#!/usr/bin/env python3
"""Versioned local release gates, immutable artifacts, pilot rollout and guarded rollback."""
from __future__ import annotations
import argparse, concurrent.futures, contextlib, hashlib, importlib.util, json, os
from pathlib import Path
import re, shutil, subprocess, sys, time, urllib.request

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('deploy', ROOT/'scripts/local-deploy.py')
DEPLOY = importlib.util.module_from_spec(spec); spec.loader.exec_module(DEPLOY)

def command(args, capture=False):
    r = subprocess.run(args, cwd=ROOT, check=True, text=True, capture_output=capture)
    return r.stdout.strip() if capture else None

def save(path, value):
    DEPLOY.save(Path(path), value)

def scope(paths, allowed, canaries):
    """Explicit city inputs stay narrow; unknown build inputs conservatively select all."""
    selected, global_change, operational = set(), False, False
    for path in paths:
        city = re.match(r'src/sites/([a-z0-9-]+\.ca)(?:\.(?:ts|json)|/)', path)
        artwork = re.match(r'public/assets/(?:wordmarks|portfolio|brand-media)/([a-z0-9-]+\.ca)[.-]', path)
        if city or artwork:
            domain = (city or artwork).group(1)
            if domain in allowed: selected.add(domain)
        elif path.startswith(('docs/', '.github/', '.githooks/')) or path in ('README.md','CLAUDE.md','AGENTS.md','.gitignore'):
            continue
        elif path.startswith(('scripts/local-release', 'scripts/release-', 'scripts/test-release')) or path == 'release-policy.json':
            operational = True
        else:
            global_change = True
    return sorted(allowed if global_change else selected or (set(canaries) if operational else set()))

def choose_pilots(domains, preferred):
    return (list(dict.fromkeys([d for d in preferred if d in domains] + sorted(domains))))[:2]

def operational_only(paths):
    relevant=[p for p in paths if not p.startswith(('docs/','.github/','.githooks/'))
              and p not in ('README.md','CLAUDE.md','AGENTS.md','.gitignore')]
    return bool(relevant) and all(p.startswith(('scripts/local-release','scripts/release-','scripts/test-release'))
                                 or p=='release-policy.json' for p in relevant)

def assert_source_current(api,sha):
    current=api.request(f'/repos/{DEPLOY.OWNER}/{DEPLOY.engine()}/git/ref/heads/main')['object']['sha']
    if current!=sha:raise ValueError('Source main advanced; stop this artifact and build the newer commit')

def archive(dist, folder, blobs):
    entries = []
    for p in sorted(dist.rglob('*')):
        if not p.is_file(): continue
        name = p.relative_to(dist).as_posix()
        if not DEPLOY.safe_path(name) or p.is_symlink(): raise ValueError('Unsafe artifact path')
        raw = p.read_bytes(); sha = hashlib.sha256(raw).hexdigest(); target = blobs/sha
        if target.exists():
            if hashlib.sha256(target.read_bytes()).hexdigest() != sha: raise ValueError('Corrupt artifact cache')
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            temporary = target.with_suffix('.tmp'); temporary.write_bytes(raw); temporary.replace(target)
        entries.append({'path':name,'sha256':sha,'size':len(raw)})
    save(folder/'artifact.json', {'files':entries})

def restore(folder, dist, blobs):
    manifest = json.loads((folder/'artifact.json').read_text())
    if dist.exists(): shutil.rmtree(dist)
    for row in manifest['files']:
        if not DEPLOY.safe_path(row['path']): raise ValueError('Unsafe artifact inventory')
        raw = (blobs/row['sha256']).read_bytes()
        if len(raw)!=row['size'] or hashlib.sha256(raw).hexdigest()!=row['sha256']: raise ValueError('Artifact checksum mismatch')
        dest=dist/row['path'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw)

def routes(dist):
    pages=[]
    for p in sorted(dist.rglob('*.html')):
        raw=p.read_text()
        if re.search(r'http-equiv=["\']refresh',raw,re.I):continue
        name=p.relative_to(dist).as_posix()
        if name.startswith(('thank','success')) or name=='404.html':continue
        pages.append('/' if name=='index.html' else '/'+(name[:-10] if name.endswith('index.html') else name))
    # Cover every non-redirect template on the pilots, including legal/contact pages.
    return sorted(pages)

def browser(release, name, jobs, *, baseline=None, capture=False, policy=None):
    folder=release/name
    spec={'release':release.name,'output':str(folder),'jobs':jobs,'capture':capture,'policy':policy or {}}
    if baseline:spec['baseline']=str(baseline)
    save(release/(name+'-input.json'),spec)
    command(['node','scripts/release-browser.mjs',str(release/(name+'-input.json'))])
    return folder/'report.json'

def public_url(domain, name, commit):
    route='/' if name=='index.html' else '/'+(name[:-10] if name.endswith('index.html') else name)
    return 'https://'+domain+route+'?release-check='+commit

def verify_live(api, plan, receipt, dist, *, timeout=600):
    """Only GET requests are retried. Publication itself is never retried blindly."""
    domain=plan['domain'];commit=receipt['commit'];end=time.monotonic()+timeout;last='Not checked'
    rows=[r for r in plan['files'] if (r['changed'] and r['path'] not in ('CNAME','.nojekyll')) or
          r['path']=='index.html' or r['path'].endswith(('.css','.js','.xml'))]
    def check(row):
        req=urllib.request.Request(public_url(domain,row['path'],commit),headers={'User-Agent':'Headbanger-Release-Verification/1.0'})
        with urllib.request.urlopen(req,timeout=45) as response:raw=response.read()
        if DEPLOY.blob_sha(raw)!=row['sha']:raise ValueError('Public bytes differ: '+row['path'])
    while True:
        try:
            runs=api.request(f'/repos/{DEPLOY.OWNER}/{domain}/actions/runs?head_sha={commit}&per_page=10')['workflow_runs']
            matching=[r for r in runs if r['head_sha']==commit and r['name']=='pages build and deployment']
            if not matching or matching[0]['conclusion']!='success':raise ValueError('Native Pages deployment pending or failed')
            with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(check,rows))
            return {'commit':commit,'pages_run':matching[0]['html_url'],'files_verified':len(rows)}
        except Exception as error:
            last=str(error)
            if time.monotonic()>=end:raise ValueError(domain+': '+last) from error
            time.sleep(5)

def rollback_changes(plan):
    previous=plan['remote_tree'];paths={r['path'] for r in plan['files'] if r['changed']}|set(plan['deletions'])
    return [{'path':p,**previous[p]} if p in previous else {'path':p,'sha':None,'mode':'100644','type':'blob'} for p in sorted(paths)]

def rollback_one(api, plan, published, receipt_path, *, publish=False):
    head,tree_sha,current=api.snapshot(plan['domain'])
    if receipt_path.exists():
        existing=json.loads(receipt_path.read_text())
        if existing['status']=='published' and head==existing.get('commit'):return existing
        raise ValueError('Rollback receipt exists; reconcile before another write')
    if head!=published['commit']:raise ValueError('Rollback refused: newer remote work must be reviewed')
    rows=rollback_changes(plan)
    result={'domain':plan['domain'],'expected_head':head,'restore_from':plan['expected_head'],'changes':rows,'status':'preview'}
    if not publish:return result
    result['status']='publication-outcome-unknown';save(receipt_path,result)
    prefix=f'/repos/{DEPLOY.OWNER}/{plan["domain"]}/git'
    tree=api.request(prefix+'/trees',{'base_tree':tree_sha,'tree':rows})['sha']
    commit=api.request(prefix+'/commits',{'tree':tree,'parents':[head],
        'message':'Restore verified compiled output after local release'})['sha']
    result['commit']=commit;save(receipt_path,result)
    api.request(prefix+'/refs/heads/main',{'sha':commit,'force':False},method='PATCH')
    actual=api.request(prefix+'/trees/'+commit+'?recursive=1')
    if actual.get('truncated'):raise ValueError('Truncated rollback tree')
    expected=dict(current)
    for row in rows:
        if row['sha'] is None:expected.pop(row['path'],None)
        else:expected[row['path']]={k:row[k] for k in ('sha','mode','type')}
    got={r['path']:{k:r[k] for k in ('sha','mode','type')} for r in actual['tree'] if r['type']!='tree'}
    if got!=expected:raise ValueError('Rollback tree verification failed')
    result['status']='published';result['tree_verified']=True;save(receipt_path,result)
    return result

def run_release(release, base, allowed, *, publish=False, domains=None, require_no_changes=False):
    release=release.resolve();release.mkdir(parents=True,exist_ok=True)
    policy=json.loads((ROOT/'release-policy.json').read_text())
    sha=command(['git','rev-parse','HEAD'],True)
    if command(['git','status','--porcelain','--untracked-files=normal'],True):raise ValueError('Release source must be clean')
    if sha!=command(['git','rev-parse','origin/main'],True):raise ValueError('Release source must equal pushed origin/main')
    live=set(allowed)&set(DEPLOY.approved_sites())
    changes=command(['git','diff','--name-only',base,sha],True).splitlines()
    require_no_changes = require_no_changes or operational_only(changes)
    selected=sorted(set(domains)) if domains else scope(changes,live,policy['canaries'])
    if any(d not in live for d in selected):raise ValueError('Unregistered or staged publication target')
    if not selected:return {'status':'no-site-changes','source_commit':sha,'domains':[]}
    manifest_path=release/'release.json'
    if manifest_path.exists():
        manifest=json.loads(manifest_path.read_text())
        if manifest['source_commit']!=sha or manifest['domains']!=selected:raise ValueError('Release identity changed')
    else:
        manifest={'source_commit':sha,'base_commit':base,'builder':DEPLOY.engine(),'domains':selected,
            'pilots':choose_pilots(selected,policy['canaries']),'status':'preparing','steps':{},'verified':{}}
        save(manifest_path,manifest)
    blobs=release.parent.parent/'blobs'
    api=DEPLOY.API()
    try:
        if not manifest['steps'].get('prepared'):
            command(['npm','ci'])
            command(['npm','run','test:local-deploy'])
            command(['npm','run','test:release'])
            command([sys.executable,'scripts/prepare-local-assets.py'])
            for domain in selected:
                folder=release/domain;folder.mkdir(exist_ok=True)
                dist,fingerprint,count=DEPLOY.build(domain)
                assert_source_current(api,sha)
                plan=DEPLOY.plan_build(api,dist,domain,fingerprint,count,folder/'plan.json')
                if require_no_changes and (plan['deletions'] or any(r['changed'] for r in plan['files'])):
                    raise ValueError('Rehearsal would change deployed files; reconcile current source/public work first: '+domain)
                archive(dist,folder,blobs)
                shutil.rmtree(dist)
                print('Prepared',domain,flush=True)
            manifest['steps']['prepared']=True;save(manifest_path,manifest)
        local_jobs=[];public_jobs=[]
        if require_no_changes:
            for domain in selected:
                plan=json.loads((release/domain/'plan.json').read_text())
                if plan['deletions'] or any(r['changed'] for r in plan['files']):
                    raise ValueError('Controller-only validation cannot change deployed output: '+domain)
        for domain in manifest['pilots']:
            dist=ROOT/'dist'/domain;restore(release/domain,dist,blobs)
            for route in routes(dist):
                public_jobs.append({'domain':domain,'route':route})
                local_jobs.append({'domain':domain,'route':route,'root':str(dist)})
        if not manifest['steps'].get('regression_checks'):
            for domain in manifest['pilots']:
                plan=json.loads((release/domain/'plan.json').read_text())
                names=[('index.html' if j['route']=='/' else j['route'].strip('/')+'/index.html')
                       for j in public_jobs if j['domain']==domain]
                names += [p for p in plan['remote_tree'] if p.endswith(('.css','.js'))]
                old={'domain':domain,'files':[{'path':p,'changed':True,**plan['remote_tree'][p]}
                    for p in set(names) if p in plan['remote_tree']]}
                verify_live(api,old,{'commit':plan['expected_head']},None)
            # Baselines come from the currently served approved layout, before publication.
            before=browser(release,'before',public_jobs,capture=True)
            browser(release,'candidate',local_jobs,baseline=before,policy=policy.get('visual',{}))
            manifest['steps']['regression_checks']=True;save(manifest_path,manifest)
        if not publish:
            manifest['status']='ready';save(manifest_path,manifest);return manifest
        ordered=manifest['pilots']+[d for d in selected if d not in manifest['pilots']]
        for domain in ordered:
            folder=release/domain;dist=ROOT/'dist'/domain
            restore(folder,dist,blobs)
            assert_source_current(api,sha)
            plan=json.loads((folder/'plan.json').read_text());receipt_path=folder/'receipt.json'
            if receipt_path.exists():
                receipt=json.loads(receipt_path.read_text())
                if receipt['status'] not in ('published','already-current'):raise ValueError('Reconcile uncertain receipt: '+str(receipt_path))
            else:
                receipt=DEPLOY.publish(api,plan,receipt_path)
            manifest['verified'][domain]=verify_live(api,plan,receipt,dist)
            save(manifest_path,manifest)
            if domain in manifest['pilots']:
                jobs=[j for j in public_jobs if j['domain']==domain]
                browser(release,'live-'+domain,jobs,baseline=release/'candidate/report.json',policy=policy.get('visual',{}))
            shutil.rmtree(dist)
            print('Verified live',domain,flush=True)
        manifest['status']='verified';save(manifest_path,manifest);return manifest
    except Exception as error:
        manifest['status']='failed';manifest['error']=str(error);save(manifest_path,manifest)
        raise

def main():
    parser=argparse.ArgumentParser(description=__doc__);sub=parser.add_subparsers(dest='action',required=True)
    run=sub.add_parser('run');run.add_argument('--release-dir',type=Path,required=True);run.add_argument('--base',required=True)
    run.add_argument('--allowed',type=Path,required=True);run.add_argument('--publish',action='store_true');run.add_argument('--domains',nargs='+')
    run.add_argument('--require-no-changes',action='store_true')
    roll=sub.add_parser('rollback');roll.add_argument('release',type=Path);roll.add_argument('--publish',action='store_true')
    args=parser.parse_args()
    if args.action=='run':
        allowed=json.loads(args.allowed.read_text())
        result=run_release(args.release_dir,args.base,allowed,publish=args.publish,domains=args.domains,require_no_changes=args.require_no_changes)
        print(json.dumps({'status':result['status'],'domains':result['domains']}));return
    api=DEPLOY.API();results=[];targets=[]
    for folder in sorted(args.release.iterdir()):
        if not folder.is_dir() or not (folder/'receipt.json').exists():continue
        published=json.loads((folder/'receipt.json').read_text())
        if published['status']=='already-current':continue
        if published['status']!='published':raise ValueError('Uncertain publication must be reconciled before rollback')
        plan=json.loads((folder/'plan.json').read_text())
        existing=json.loads((folder/'rollback-receipt.json').read_text()) if (folder/'rollback-receipt.json').exists() else None
        expected=existing['commit'] if existing and existing['status']=='published' else published['commit']
        if api.snapshot(plan['domain'])[0]!=expected:raise ValueError('Rollback preflight refused newer work: '+plan['domain'])
        targets.append((folder,plan,published))
    for folder,plan,published in targets:
        result=rollback_one(api,plan,published,folder/'rollback-receipt.json',publish=args.publish)
        if args.publish:
            previous=plan['remote_tree'];names={r['path'] for r in rollback_changes(plan) if r['sha']}|{'index.html'}
            inverse={'domain':plan['domain'],'files':[{'path':p,'changed':True,**previous[p]} for p in names if p in previous]}
            result['live_verification']=verify_live(api,inverse,result,None)
        results.append(result)
    save(args.release/'rollback-summary.json',results);print(json.dumps(results))
    if args.publish:
        state=args.release.resolve().parents[2]
        record_path=state/'builders'/json.loads((args.release/'release.json').read_text())['builder']/'state.json'
        if record_path.exists():
            record=json.loads(record_path.read_text());record.update(blocked=True,error='Deployment rolled back. Revert/reconcile source main, then resume explicitly.')
            save(record_path,record)

if __name__=='__main__':
    try:main()
    except Exception as error:
        print('Release stopped: '+str(error),file=sys.stderr);sys.exit(1)
