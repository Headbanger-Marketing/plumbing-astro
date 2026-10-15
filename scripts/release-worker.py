#!/usr/bin/env python3
"""Durable Mac worker: pushed main is authoritative; no city repositories are cloned."""
from __future__ import annotations
import argparse, ast, fcntl, hashlib, json, os
from pathlib import Path
import plistlib, shlex, shutil, subprocess, sys, time

BUILDERS=('hvac-astro','plumbing-astro','duct-cleaning-astro','electrical-astro')
DEFAULT=Path.home()/'.local/state/headbanger-releases'
LABEL='com.headbanger.local-releases'

def save(path,data):
    path.parent.mkdir(parents=True,exist_ok=True);temporary=path.with_suffix('.tmp')
    temporary.write_text(json.dumps(data,indent=2)+'\n');temporary.replace(path)

def read(path,default=None):
    return json.loads(path.read_text()) if path.exists() else default

def git(state,mirror,*args):
    helper='!'+shlex.quote(str(state/'bin/gh'))+' auth git-credential'
    return subprocess.check_output(['git','-c','credential.helper=','-c','credential.helper='+helper,
        '--git-dir',str(mirror),*args],text=True).strip()

def mirror_head(state,name):
    mirror=state/'mirrors'/(name+'.git')
    if not mirror.exists():
        mirror.parent.mkdir(parents=True,exist_ok=True)
        helper='!'+shlex.quote(str(state/'bin/gh'))+' auth git-credential'
        stage=mirror.with_name(name+'.fetching.git')
        if stage.exists():shutil.rmtree(stage)
        subprocess.run(['git','-c','credential.helper=','-c','credential.helper='+helper,'clone','--bare','--filter=blob:none',
            'https://github.com/Headbanger-Marketing/'+name+'.git',str(stage)],check=True)
        git(state,stage,'config','--local','credential.helper','')
        git(state,stage,'config','--local','--add','credential.helper',helper)
        stage.rename(mirror)
    git(state,mirror,'fetch','origin','+refs/heads/main:refs/remotes/origin/main')
    return mirror,git(state,mirror,'rev-parse','refs/remotes/origin/main')

def github_status(state,name,sha,status,description):
    payload={'state':status,'context':'local-release/netleads','description':description[:140]}
    try:
        subprocess.run([str(state/'bin/gh'),'api','--method','POST',f'repos/Headbanger-Marketing/{name}/statuses/{sha}',
            '--input','-'],input=json.dumps(payload),text=True,check=True,capture_output=True)
    except subprocess.CalledProcessError:
        print(name+': could not update GitHub commit status; local release record retained',flush=True)

def clean_source(state,mirror,source):
    """Drop reproducible source/dependencies only; plans, receipts and artifacts remain."""
    status=subprocess.check_output(['git','-C',str(source),'status','--porcelain'],text=True).strip()
    if status:
        print('Retaining unexpectedly modified release source: '+str(source),flush=True)
        return
    git(state,mirror,'worktree','remove','--force',str(source))
    pool=source.parent/'hvac-assets'
    if pool.is_symlink():pool.unlink()
    if source.parent.exists() and not any(source.parent.iterdir()):source.parent.rmdir()

def supersede(state,mirror,record,path,new_sha):
    old=record['pending'];git(state,mirror,'merge-base','--is-ancestor',old['source_commit'],new_sha)
    for receipt_path in Path(old['release']).glob('*/receipt.json'):
        if read(receipt_path)['status'] not in ('published','already-current'):
            raise ValueError('Uncertain publication must be reconciled before superseding')
    record.setdefault('superseded_releases',[]).append(old)
    record.pop('pending',None);record.pop('error',None);record['blocked']=False
    save(path,record)
    source_root=Path(old['release'])/'source'
    if source_root.exists():
        for source in source_root.iterdir():
            if source.name in BUILDERS and source.is_dir():
                try:clean_source(state,mirror,source)
                except Exception as error:print('Superseded source cleanup deferred: '+str(error),flush=True)

def tick(state, *, retry=None, rehearsal=None, rehearsal_all=False, publish=True):
    config=read(state/'config.json');results=[]
    if not config:raise ValueError('Worker is not installed')
    if not config['enabled'] and not rehearsal and not retry:return [{'status':'paused'}]
    for name,settings in config['builders'].items():
        if rehearsal and name!=rehearsal:continue
        if retry and name!=retry:continue
        record_path=state/'builders'/name/'state.json'
        record=read(record_path,{'last_verified_source':settings['baseline'],'last_processed_source':settings['baseline']})
        try:
            if record.get('operator_hold') and retry!=name:
                results.append({'builder':name,'status':'operator-hold','error':record.get('error')});continue
            if rehearsal_all and record.get('pending'):raise ValueError('Reconcile the pending production release before adopting a baseline')
            if record.get('blocked') and not record.get('pending') and retry!=name and not rehearsal:
                results.append({'builder':name,'status':'blocked','error':record.get('error')});continue
            mirror,sha=mirror_head(state,name)
            if record.get('operator_hold') and retry==name:
                if sha==record['last_processed_source']:raise ValueError('Source main is unchanged since rollback; commit the revert/fix before resuming')
                record.pop('operator_hold',None);record['blocked']=False;save(record_path,record)
            if record.get('blocked') and record.get('pending') and retry!=name and not rehearsal:
                if sha!=record['pending']['source_commit']:
                    supersede(state,mirror,record,record_path,sha)
                    results.append({'builder':name,'status':'superseded','next_source':sha})
                else:results.append({'builder':name,'status':'blocked','error':record.get('error')})
                continue
            # Worker updates are versioned in the canonical HVAC source; activate on next launch.
            if name=='hvac-astro':
                updated=git(state,mirror,'show',sha+':scripts/release-worker.py')+'\n'
                installed=state/'runtime/release-worker.py'
                if installed.exists() and installed.read_text()!=updated:
                    temporary=installed.with_suffix('.new.py');temporary.write_text(updated)
                    subprocess.run([sys.executable,'-m','py_compile',str(temporary)],check=True)
                    temporary.replace(installed)
            if not rehearsal and not record.get('pending') and sha==record['last_processed_source']:
                results.append({'builder':name,'status':'current','source_commit':sha});continue
            if record.get('pending') and not rehearsal:
                pending=record['pending'];release=Path(pending['release']);sha=pending['source_commit'];base=pending['base']
                newest=git(state,mirror,'rev-parse','origin/main')
                if newest!=sha:
                    supersede(state,mirror,record,record_path,newest)
                    results.append({'builder':name,'status':'superseded','source_commit':sha,'next_source':newest})
                    continue
            else:
                base=sha if rehearsal else record['last_verified_source']
                subprocess.run(['git','--git-dir',str(mirror),'merge-base','--is-ancestor',base,sha],check=True)
                stamp=time.strftime('%Y%m%dT%H%M%SZ',time.gmtime())
                release=state/'releases'/name/(stamp+'-'+sha[:12]);source=release/'source'/name
                source.parent.mkdir(parents=True,exist_ok=True)
                git(state,mirror,'worktree','add','--detach',str(source),sha)
                if name=='hvac-astro':
                    pool=state/'assets/hvac-assets';pool.mkdir(parents=True,exist_ok=True)
                    (source.parent/'hvac-assets').symlink_to(pool,target_is_directory=True)
                if not rehearsal:
                    record['pending']={'source_commit':sha,'base':base,'release':str(release)}
                    save(record_path,record)
            source=release/'source'/name
            allowed=state/'builders'/name/'allowed.json'
            args=[sys.executable,str(source/'scripts/local-release.py'),'run','--base',base,
                  '--release-dir',str(release),'--allowed',str(allowed)]
            if publish:args.append('--publish')
            if rehearsal:
                rehearsal_domains=read(allowed) if rehearsal_all else settings['canaries']
                args.extend(['--require-no-changes','--domains',*rehearsal_domains])
            github_status(state,name,sha,'pending','Local build, regression gates and pilot verification running')
            with (release/'worker.log').open('a') as log:
                process=subprocess.run(args,cwd=source,stdout=log,stderr=subprocess.STDOUT)
            if process.returncode:raise ValueError('Release stopped; inspect '+str(release/'worker.log'))
            result=read(release/'release.json',{'status':'no-site-changes','source_commit':sha,'domains':[]})
            save(release/'worker-result.json',result)
            if result['status'] not in ('verified','no-site-changes','ready'):raise ValueError('Incomplete release')
            if not rehearsal and publish:
                record.update(last_processed_source=sha,last_verified_source=sha,last_release=str(release),blocked=False)
                record.pop('pending',None);record.pop('error',None);save(record_path,record)
            elif rehearsal:
                record['rehearsal']={'release':str(release),'status':result['status'],'source_commit':sha,'full_scope':rehearsal_all,'domains':len(result['domains'])}
                if rehearsal_all and result['status']=='verified':
                    record.update(last_processed_source=sha,last_verified_source=sha,last_release=str(release))
                if not record.get('pending'):record.pop('error',None);record['blocked']=False
                save(record_path,record)
            github_status(state,name,sha,'success','Local release verified: '+str(len(result['domains']))+' sites' if publish else 'Local regression preview passed; no publication')
            results.append({'builder':name,'source_commit':sha,'status':result['status'],'release':str(release)})
            if publish:
                try:clean_source(state,mirror,source)
                except Exception as cleanup_error:print('Release verified; source cleanup deferred: '+str(cleanup_error),flush=True)
        except Exception as error:
            if record.get('operator_hold'):
                record.update(blocked=True,error=str(error));save(record_path,record)
                results.append({'builder':name,'status':'operator-hold','error':str(error)});continue
            if not record.get('pending') and not rehearsal:
                record.update(blocked=False,last_read_error=str(error));save(record_path,record)
                results.append({'builder':name,'status':'read-retry-pending','error':str(error)})
                continue
            if record.get('pending') and not rehearsal:
                try:
                    mirror,newest=mirror_head(state,name)
                    if newest!=record['pending']['source_commit']:
                        old_sha=record['pending']['source_commit']
                        supersede(state,mirror,record,record_path,newest)
                        github_status(state,name,old_sha,'failure','Superseded by newer main; known publication receipts retained')
                        results.append({'builder':name,'status':'superseded','next_source':newest})
                        continue
                except Exception:
                    pass  # An uncertain receipt or rewritten main must remain blocked.
            record.update(blocked=True,error=str(error));save(record_path,record)
            if record.get('pending'):github_status(state,name,record['pending']['source_commit'],'failure','Release stopped; inspect the Mac release log')
            results.append({'builder':name,'status':'blocked','error':str(error)})
    save(state/'status.json',{'checked_at':time.time(),'results':results})
    return results

def approved(root):
    tree=ast.parse((root/'scripts/rollout-chat.py').read_text())
    for node in tree.body:
        if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='APPROVED_SITES' for t in node.targets):
            return sorted(ast.literal_eval(node.value.args[0]))
    raise ValueError('Missing live-site allowlist')

def abandon(state,name):
    """Allow a newer source release only after any old publication is reconciled/restored."""
    path=state/'builders'/name/'state.json';record=read(path,{})
    pending=record.get('pending')
    if not pending:raise ValueError('No pending release to abandon')
    release=Path(pending['release'])
    for receipt_path in release.glob('*/receipt.json'):
        receipt=read(receipt_path)
        if receipt['status']=='already-current':continue
        rollback=read(receipt_path.with_name('rollback-receipt.json'),{})
        if receipt['status']!='published' or rollback.get('status')!='published':
            raise ValueError('Reconcile uncertain writes or roll back published sites before abandoning')
        endpoint=f'repos/Headbanger-Marketing/{receipt["domain"]}/commits/main'
        raw=subprocess.check_output([str(state/'bin/gh'),'api',endpoint],text=True)
        if json.loads(raw)['sha']!=rollback['commit']:raise ValueError('A restored site advanced; inspect its current work')
    record.setdefault('abandoned_releases',[]).append(pending)
    record.pop('pending',None);record.pop('error',None);record['blocked']=False;save(path,record)

def install(state,builders_root):
    state=state.expanduser().resolve()
    if str(state).startswith('/Volumes/'):raise ValueError('Background worker state must be on the internal disk')
    state.mkdir(parents=True,exist_ok=True)
    config=read(state/'config.json',{'enabled':False,'builders':{}})
    (state/'bin').mkdir(exist_ok=True);(state/'runtime').mkdir(exist_ok=True);(state/'logs').mkdir(exist_ok=True)
    gh=Path(shutil.which('gh')).resolve()
    if gh!=(state/'bin/gh'):
        raw=gh.read_bytes();dest=state/'bin/gh';temporary=dest.with_suffix('.new');temporary.write_bytes(raw);temporary.chmod(0o755);temporary.replace(dest)
        config['gh_executable_sha256']=hashlib.sha256(raw).hexdigest()
    temporary=state/'runtime/release-worker.new.py';shutil.copyfile(Path(__file__),temporary);temporary.replace(state/'runtime/release-worker.py')
    for name in BUILDERS:
        root=(builders_root/name).resolve()
        if subprocess.check_output(['git','status','--porcelain','--untracked-files=no'],cwd=root,text=True).strip():
            raise ValueError('Install from committed source: '+name)
        sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
        remote=subprocess.check_output(['git','ls-remote','origin','refs/heads/main'],cwd=root,text=True).split()[0]
        if remote!=sha:raise ValueError('Install source must be the pushed main commit: '+name)
        policy=read(root/'release-policy.json')
        settings=config['builders'].setdefault(name,{'baseline':sha,'canaries':policy['canaries']})
        allowpath=state/'builders'/name/'allowed.json'
        if not allowpath.exists():save(allowpath,approved(root))
        if not (state/'builders'/name/'state.json').exists():
            save(state/'builders'/name/'state.json',{'last_processed_source':sha,'last_verified_source':sha})
        hook=subprocess.run(['git','config','--get','core.hooksPath'],cwd=root,text=True,capture_output=True).stdout.strip()
        hooks=Path(subprocess.check_output(['git','rev-parse','--git-path','hooks'],cwd=root,text=True).strip())
        if not hooks.is_absolute():hooks=root/hooks
        custom=[p.name for p in hooks.glob('*') if p.is_file() and not p.name.endswith('.sample')]
        if hook not in ('','.githooks') or (not hook and custom):
            settings['hook']='existing hooks preserved; polling remains active'
        else:
            subprocess.run(['git','config','core.hooksPath','.githooks'],cwd=root,check=True)
            settings['hook']='.githooks/post-merge'
    config['installed_from']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=Path(__file__).resolve().parents[1],text=True).strip()
    save(state/'config.json',config)
    node_dir=str(Path(shutil.which('node')).resolve().parent)
    environment={'PATH':str(state/'bin')+':'+node_dir+':/usr/bin:/bin:/usr/sbin:/sbin','HOME':str(Path.home())}
    plist={'Label':LABEL,'ProgramArguments':[sys.executable,str(state/'runtime/release-worker.py'),'--state',str(state),'tick'],
        'EnvironmentVariables':environment,'WorkingDirectory':str(state),'RunAtLoad':True,'StartInterval':60,
        'StandardOutPath':str(state/'logs/worker.log'),'StandardErrorPath':str(state/'logs/worker-error.log')}
    target=Path.home()/'Library/LaunchAgents'/ (LABEL+'.plist');target.parent.mkdir(parents=True,exist_ok=True)
    temporary=state/'runtime/launch-agent.plist';temporary.write_bytes(plistlib.dumps(plist))
    target.write_bytes(temporary.read_bytes())
    print(json.dumps({'state':str(state),'launch_agent':str(target),'enabled':config['enabled'],'builders':list(config['builders'])}))

def main():
    os.umask(0o077)
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--state',type=Path,default=DEFAULT)
    sub=parser.add_subparsers(dest='action',required=True)
    setup=sub.add_parser('install');setup.add_argument('--builders-root',type=Path,required=True)
    sub.add_parser('tick');sub.add_parser('status');sub.add_parser('enable');sub.add_parser('pause');sub.add_parser('hint')
    retry=sub.add_parser('resume');retry.add_argument('builder',choices=BUILDERS)
    discard=sub.add_parser('abandon');discard.add_argument('builder',choices=BUILDERS)
    rehearsal=sub.add_parser('rehearse');rehearsal.add_argument('builder',choices=BUILDERS);rehearsal.add_argument('--publish',action='store_true')
    rehearsal.add_argument('--all-registered',action='store_true')
    args=parser.parse_args();state=args.state.expanduser().resolve()
    if args.action=='install':install(state,args.builders_root.resolve());return
    if args.action=='status':print(json.dumps({'config':read(state/'config.json'), 'status':read(state/'status.json'),
        'builders':{n:read(state/'builders'/n/'state.json') for n in BUILDERS}},indent=2));return
    if args.action=='hint':
        # A hint is never authority to publish an unpushed local commit.
        if state.exists():save(state/'merge-hint.json',{'at':time.time()})
        return
    config=read(state/'config.json')
    if not config:raise ValueError('Install the worker first')
    if args.action in ('enable','pause'):
        if args.action=='enable':
            for name in BUILDERS:
                record=read(state/'builders'/name/'state.json',{})
                rehearsal=record.get('rehearsal',{})
                if rehearsal.get('status')!='verified' or not rehearsal.get('full_scope'):
                    raise ValueError('Verify a no-change full-scope rehearsal for '+name+' before enabling')
        config['enabled']=args.action=='enable';save(state/'config.json',config);print(args.action);return
    with (state/'worker.lock').open('a') as lock:
        try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except BlockingIOError:print('Another release worker is active');return
        if args.action=='abandon':abandon(state,args.builder);return
        result=tick(state,retry=args.builder if args.action=='resume' else None,
            rehearsal=args.builder if args.action=='rehearse' else None,rehearsal_all=args.all_registered if args.action=='rehearse' else False,
            publish=args.publish if args.action=='rehearse' else True)
        print(json.dumps(result,indent=2))

if __name__=='__main__':
    try:main()
    except Exception as error:print('Worker stopped: '+str(error),file=sys.stderr);sys.exit(1)
