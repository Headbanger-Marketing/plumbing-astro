#!/usr/bin/env python3
"""Offline safety tests: targeting, immutable artifacts, guarded rollback and worker recovery."""
import copy,fcntl,importlib.util,json
from pathlib import Path
import tempfile,types,unittest
from unittest.mock import patch

def module(name,file):
    spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(file))
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result);return result

R=module('release','local-release.py');W=module('worker','release-worker.py')
A='a'*40;B='b'*40;C='c'*40

class ScopeTests(unittest.TestCase):
    def setUp(self):self.sites={'one.ca','two.ca','three.ca'}
    def test_city_only(self):self.assertEqual(R.scope(['src/sites/one.ca/content.ts'],self.sites,['two.ca']),['one.ca'])
    def test_city_config(self):self.assertEqual(R.scope(['src/sites/two.ca.json'],self.sites,['one.ca']),['two.ca'])
    def test_staged_config_not_launched(self):self.assertEqual(R.scope(['src/sites/staged.ca.ts'],self.sites,['one.ca']),[])
    def test_shared_style_all(self):self.assertEqual(set(R.scope(['public/assets/css/styles.css'],self.sites,[])),self.sites)
    def test_dependency_change_all(self):self.assertEqual(set(R.scope(['package-lock.json'],self.sites,[])),self.sites)
    def test_docs_only_none(self):self.assertEqual(R.scope(['docs/local-release.md','.github/workflows/retained.yml'],self.sites,[]),[])
    def test_controller_change_pilots(self):self.assertEqual(R.scope(['scripts/local-release.py'],self.sites,['one.ca','two.ca']),['one.ca','two.ca'])
    def test_wordmark_scope(self):self.assertEqual(R.scope(['public/assets/wordmarks/one.ca-header.svg'],self.sites,[]),['one.ca'])
    def test_unknown_build_input_all(self):self.assertEqual(set(R.scope(['new-build-input.toml'],self.sites,[])),self.sites)
    def test_pilots_preferred(self):self.assertEqual(R.choose_pilots(self.sites,['three.ca','one.ca']),['three.ca','one.ca'])
    def test_single_target_stays_single(self):self.assertEqual(R.choose_pilots(['two.ca'],['one.ca']),['two.ca'])
    def test_versioned_pilots_are_approved_live_domains(self):
        policy=json.loads((R.ROOT/'release-policy.json').read_text())
        self.assertEqual(len(policy['canaries']),2)
        self.assertTrue(set(policy['canaries'])<=R.DEPLOY.approved_sites())
    def test_controller_only_changes_are_read_only_validations(self):
        self.assertTrue(R.operational_only(['scripts/release-worker.py','docs/local-release.md']))
        self.assertFalse(R.operational_only(['scripts/release-worker.py','src/pages/index.astro']))
        self.assertFalse(R.operational_only(['docs/local-release.md']))

class ArtifactTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name)
        self.dist=self.root/'dist';self.dist.mkdir();self.folder=self.root/'release';self.blobs=self.root/'blobs'
        (self.dist/'index.html').write_text('preserved');(self.dist/'style.css').write_text('body{}')
    def test_round_trip_and_deduplication(self):
        R.archive(self.dist,self.folder,self.blobs);R.archive(self.dist,self.root/'second',self.blobs)
        self.assertEqual(len(list(self.blobs.iterdir())),2)
        (self.dist/'index.html').write_text('changed');R.restore(self.folder,self.dist,self.blobs)
        self.assertEqual((self.dist/'index.html').read_text(),'preserved')
    def test_corrupt_blob_refused(self):
        R.archive(self.dist,self.folder,self.blobs);next(self.blobs.iterdir()).write_text('corrupt')
        with self.assertRaisesRegex(ValueError,'checksum'):R.restore(self.folder,self.dist,self.blobs)
    def test_artifact_path_traversal_refused(self):
        R.archive(self.dist,self.folder,self.blobs)
        manifest=json.loads((self.folder/'artifact.json').read_text());manifest['files'][0]['path']='../outside'
        (self.folder/'artifact.json').write_text(json.dumps(manifest))
        with self.assertRaisesRegex(ValueError,'Unsafe'):R.restore(self.folder,self.dist,self.blobs)
    def test_symlink_not_archived(self):
        (self.dist/'bad').symlink_to(self.dist/'index.html')
        with self.assertRaisesRegex(ValueError,'Unsafe'):R.archive(self.dist,self.folder,self.blobs)

class FakeAPI:
    def __init__(self,head=A):
        self.head=head;self.writes=[]
        self.current={'index.html':{'sha':'1'*40,'mode':'100644','type':'blob'},
            'introduced.css':{'sha':'2'*40,'mode':'100644','type':'blob'},
            'unrelated.txt':{'sha':'3'*40,'mode':'100644','type':'blob'}}
        self.after=copy.deepcopy(self.current)
    def snapshot(self,domain):return self.head,B,copy.deepcopy(self.current)
    def request(self,path,data=None,method=None):
        if data is not None:self.writes.append((path,data,method))
        if path.endswith('/trees'):
            self.asserted_parent_tree=data['base_tree']
            for row in data['tree']:
                if row['sha'] is None:self.after.pop(row['path'],None)
                else:self.after[row['path']]={k:row[k] for k in ('sha','mode','type')}
            return {'sha':B}
        if path.endswith('/commits'):
            if data['parents']!=[A]:raise AssertionError('Lost rollback parent guard')
            return {'sha':C}
        if path.endswith('/refs/heads/main'):
            if data!={'sha':C,'force':False}:raise AssertionError('Force push attempted')
            return {'object':{'sha':C}}
        if '/trees/'+C in path:return {'truncated':False,'tree':[{'path':p,**r} for p,r in self.after.items()]}
        raise AssertionError(path)

class RollbackTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.receipt=Path(self.temp.name)/'receipt.json'
        self.plan={'domain':'one.ca','expected_head':'0'*40,
            'remote_tree':{'index.html':{'sha':'4'*40,'mode':'100644','type':'blob'},
                'deleted.css':{'sha':'5'*40,'mode':'100644','type':'blob'},
                'unrelated.txt':{'sha':'3'*40,'mode':'100644','type':'blob'}},
            'files':[{'path':'index.html','changed':True},{'path':'introduced.css','changed':True}],
            'deletions':['deleted.css']}
    def test_preview_no_writes(self):
        api=FakeAPI();r=R.rollback_one(api,self.plan,{'commit':A},self.receipt)
        self.assertEqual(r['status'],'preview');self.assertEqual(api.writes,[]);self.assertFalse(self.receipt.exists())
    def test_newer_remote_work_refused(self):
        api=FakeAPI(head=B)
        with self.assertRaisesRegex(ValueError,'newer remote'):R.rollback_one(api,self.plan,{'commit':A},self.receipt,publish=True)
        self.assertEqual(api.writes,[])
    def test_restore_preserves_unrelated_files(self):
        api=FakeAPI();r=R.rollback_one(api,self.plan,{'commit':A},self.receipt,publish=True)
        self.assertEqual(r['status'],'published');self.assertEqual(api.after['unrelated.txt'],api.current['unrelated.txt'])
        self.assertNotIn('introduced.css',api.after);self.assertEqual(api.after['deleted.css']['sha'],'5'*40)
        self.assertEqual(api.after['index.html']['sha'],'4'*40)
    def test_uncertain_rollback_not_retried(self):
        self.receipt.write_text(json.dumps({'status':'publication-outcome-unknown'}));api=FakeAPI()
        with self.assertRaisesRegex(ValueError,'reconcile'):R.rollback_one(api,self.plan,{'commit':A},self.receipt,publish=True)
        self.assertEqual(api.writes,[])
    def test_existing_published_rollback_can_verify_without_write(self):
        self.receipt.write_text(json.dumps({'status':'published','commit':C}));api=FakeAPI(head=C)
        self.assertEqual(R.rollback_one(api,self.plan,{'commit':A},self.receipt,publish=True)['commit'],C)
        self.assertEqual(api.writes,[])
    def test_read_fallback_requires_independent_agreement(self):
        api=object.__new__(R.DEPLOY.API)
        def request(path,data=None):
            if '/ref/heads/main' in path:raise RuntimeError('GitHub HTTP 500')
            if path.endswith('/commits/main'):return {'sha':A}
            if path=='/graphql':return {'data':{'repository':{'ref':{'target':{'oid':B}}}}}
            raise AssertionError('Tree read should not happen after disagreement')
        with patch.object(api,'request',side_effect=request),self.assertRaisesRegex(ValueError,'disagree'):api.snapshot('one.ca')
    def test_read_fallback_accepts_agreement_without_writing(self):
        api=object.__new__(R.DEPLOY.API);requests=[]
        def request(path,data=None):
            requests.append((path,data))
            if '/ref/heads/main' in path:raise RuntimeError('GitHub HTTP 500')
            if path.endswith('/commits/main'):return {'sha':A}
            if path=='/graphql':return {'data':{'repository':{'ref':{'target':{'oid':A}}}}}
            return {'sha':B,'truncated':False,'tree':[]}
        with patch.object(api,'request',side_effect=request):self.assertEqual(api.snapshot('one.ca'),(A,B,{}))
        self.assertTrue(all(data is None or data['query'].startswith('query(') for _,data in requests))

class WorkerTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.state=Path(self.temp.name)
        self.name='plumbing-astro';self.path=self.state/'builders'/self.name/'state.json'
        W.save(self.state/'config.json',{'enabled':True,'builders':{self.name:{'baseline':A,'canaries':['one.ca','two.ca']}}})
        W.save(self.path,{'last_processed_source':A,'last_verified_source':A})
    def test_paused_does_not_fetch(self):
        c=W.read(self.state/'config.json');c['enabled']=False;W.save(self.state/'config.json',c)
        with patch.object(W,'mirror_head') as fetch:self.assertEqual(W.tick(self.state),[{'status':'paused'}]);fetch.assert_not_called()
    def test_current_commit_not_released_twice(self):
        with patch.object(W,'mirror_head',return_value=(self.state/'mirror',A)),patch.object(W.subprocess,'run') as run:
            self.assertEqual(W.tick(self.state)[0]['status'],'current');run.assert_not_called()
    def test_blocked_release_not_retried(self):
        r=W.read(self.path);r['blocked']=True;W.save(self.path,r)
        with patch.object(W,'mirror_head') as fetch:self.assertEqual(W.tick(self.state)[0]['status'],'blocked');fetch.assert_not_called()
    def test_failed_process_keeps_pending_commit(self):
        with patch.object(W,'mirror_head',return_value=(self.state/'mirror',B)),patch.object(W,'git',return_value=''),\
             patch.object(W,'github_status'),patch.object(W.subprocess,'run',return_value=types.SimpleNamespace(returncode=1)):
            self.assertEqual(W.tick(self.state)[0]['status'],'blocked')
        record=W.read(self.path);self.assertTrue(record['blocked']);self.assertEqual(record['pending']['source_commit'],B)
        self.assertEqual(record['last_processed_source'],A)
    def test_new_main_uses_fresh_plans_without_repeating_old_writes(self):
        r=W.read(self.path);r['pending']={'source_commit':B,'base':A,'release':str(self.state/'old')};W.save(self.path,r)
        with patch.object(W,'mirror_head',return_value=(self.state/'mirror',C)),patch.object(W,'git',return_value=C),patch.object(W,'github_status'),patch.object(W.subprocess,'run') as run:
            result=W.tick(self.state,retry=self.name)[0];self.assertEqual(result['status'],'superseded');run.assert_not_called()
        record=W.read(self.path);self.assertNotIn('pending',record);self.assertEqual(record['last_verified_source'],A)
        self.assertEqual(record['superseded_releases'][0]['source_commit'],B)
    def test_new_main_cannot_bypass_an_uncertain_write(self):
        release=self.state/'old';W.save(release/'one.ca/receipt.json',{'status':'publication-outcome-unknown'})
        record=W.read(self.path);record['pending']={'source_commit':B,'base':A,'release':str(release)};W.save(self.path,record)
        with patch.object(W,'mirror_head',return_value=(self.state/'mirror',C)),patch.object(W,'git',return_value=C),patch.object(W,'github_status'):
            self.assertEqual(W.tick(self.state,retry=self.name)[0]['status'],'blocked')
        self.assertIn('pending',W.read(self.path))
    def test_abandon_refuses_uncertain_publication(self):
        release=self.state/'old';W.save(release/'one.ca/receipt.json',{'status':'publication-outcome-unknown'})
        r=W.read(self.path);r['pending']={'release':str(release)};W.save(self.path,r)
        with self.assertRaisesRegex(ValueError,'Reconcile'):W.abandon(self.state,self.name)
        self.assertIn('pending',W.read(self.path))
    def test_abandon_unpublished_release_retains_history(self):
        release=self.state/'old';release.mkdir();r=W.read(self.path);r['pending']={'release':str(release)};r['blocked']=True;W.save(self.path,r)
        W.abandon(self.state,self.name);r=W.read(self.path)
        self.assertNotIn('pending',r);self.assertFalse(r['blocked']);self.assertEqual(len(r['abandoned_releases']),1)
    def test_modified_release_source_is_not_removed(self):
        with patch.object(W.subprocess,'check_output',return_value=' M source.txt'),patch.object(W,'git') as git:
            W.clean_source(self.state,self.state/'mirror',self.state/'release/source');git.assert_not_called()
    def test_offline_fetch_retries_without_creating_a_deployment(self):
        with patch.object(W,'mirror_head',side_effect=OSError('offline')):
            self.assertEqual(W.tick(self.state)[0]['status'],'read-retry-pending')
        self.assertFalse(W.read(self.path)['blocked']);self.assertNotIn('pending',W.read(self.path))
    def test_new_pushed_fix_supersedes_known_stopped_release(self):
        record=W.read(self.path);record.update(blocked=True,pending={'source_commit':B,'base':A,'release':str(self.state/'old')});W.save(self.path,record)
        with patch.object(W,'mirror_head',return_value=(self.state/'mirror',C)),patch.object(W,'git',return_value=''):
            self.assertEqual(W.tick(self.state)[0]['status'],'superseded')
        self.assertNotIn('pending',W.read(self.path))
    def test_baseline_adoption_cannot_skip_pending_production_release(self):
        record=W.read(self.path);record['pending']={'source_commit':B,'base':A,'release':str(self.state/'old')};W.save(self.path,record)
        with patch.object(W,'mirror_head') as mirror,patch.object(W,'github_status'):
            result=W.tick(self.state,rehearsal=self.name,rehearsal_all=True)[0]
            self.assertEqual(result['status'],'blocked');mirror.assert_not_called()
        self.assertEqual(W.read(self.path)['last_verified_source'],A)
    def test_operator_rollback_hold_blocks_even_a_new_main(self):
        record=W.read(self.path);record.update(operator_hold=True,blocked=True);W.save(self.path,record)
        with patch.object(W,'mirror_head') as mirror:
            self.assertEqual(W.tick(self.state)[0]['status'],'operator-hold');mirror.assert_not_called()
    def test_resume_requires_source_reconciliation_after_rollback(self):
        record=W.read(self.path);record.update(operator_hold=True,blocked=True);W.save(self.path,record)
        with patch.object(W,'mirror_head',return_value=(self.state/'mirror',A)):
            self.assertEqual(W.tick(self.state,retry=self.name)[0]['status'],'operator-hold')
        self.assertTrue(W.read(self.path)['operator_hold'])

class RollbackLockTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.state=Path(self.temp.name)
        self.release=self.state/'releases/plumbing-astro/id';self.release.mkdir(parents=True)
        W.save(self.state/'config.json',{'enabled':True})
    def test_publish_refuses_an_active_worker(self):
        with (self.state/'worker.lock').open('a') as held:
            fcntl.flock(held,fcntl.LOCK_EX|fcntl.LOCK_NB)
            with self.assertRaisesRegex(ValueError,'worker is active'):
                with R.rollback_guard(self.release,True):self.fail('Rollback acquired an occupied lock')
    def test_preview_does_not_block_or_mutate_worker(self):
        with (self.state/'worker.lock').open('a') as held:
            fcntl.flock(held,fcntl.LOCK_EX|fcntl.LOCK_NB)
            with R.rollback_guard(self.release,False) as state:self.assertIsNone(state)
    def test_publish_holds_and_releases_global_lock(self):
        with R.rollback_guard(self.release,True) as state:
            self.assertEqual(state,self.state.resolve())
            with (self.state/'worker.lock').open('a') as other:
                with self.assertRaises(BlockingIOError):fcntl.flock(other,fcntl.LOCK_EX|fcntl.LOCK_NB)
        with (self.state/'worker.lock').open('a') as other:fcntl.flock(other,fcntl.LOCK_EX|fcntl.LOCK_NB)

class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name)/'source';self.root.mkdir()
        self.release=Path(self.temp.name)/'releases/builder/id';self.events=[]
        (self.root/'release-policy.json').write_text(json.dumps({'canaries':['one.ca','two.ca'],'visual':{}}))
        self.patches=[]
        def patcher(obj,name,value):
            p=patch.object(obj,name,value);p.start();self.addCleanup(p.stop)
        patcher(R,'ROOT',self.root)
        def command(args,capture=False):
            if args[:2]==['git','rev-parse']:return A
            if args[:2]==['git','diff']:return 'src/layouts/Layout.astro'
            return ''
        patcher(R,'command',command)
        patcher(R.DEPLOY,'approved_sites',lambda:set(['one.ca','two.ca','three.ca']))
        patcher(R.DEPLOY,'engine',lambda:'plumbing-astro');patcher(R.DEPLOY,'API',lambda:object())
        def build(domain):
            dist=self.root/'dist'/domain;dist.mkdir(parents=True,exist_ok=True)
            (dist/'index.html').write_text('<header>Header</header><main>Body</main><footer>Footer</footer>')
            return dist,'fingerprint',1
        def plan(api,dist,domain,fingerprint,count,target):
            value={'domain':domain,'expected_head':B,'remote_tree':{'index.html':{'sha':'1'*40,'mode':'100644','type':'blob'}},
                'files':[],'deletions':[]};R.save(target,value);return value
        def publish(api,plan,path):
            self.events.append('publish:'+plan['domain']);value={'domain':plan['domain'],'status':'published','commit':C};R.save(path,value);return value
        def verify(api,plan,receipt,dist):
            self.events.append(('live:' if receipt['commit']==C else 'baseline:')+plan['domain']);return {'commit':receipt['commit']}
        def browser(release,name,jobs,**kwargs):self.events.append(name);return release/name/'report.json'
        patcher(R.DEPLOY,'build',build);patcher(R.DEPLOY,'plan_build',plan);patcher(R.DEPLOY,'publish',publish)
        patcher(R,'verify_live',verify);patcher(R,'browser',browser)
        patcher(R,'assert_source_current',lambda api,sha:None)
    def run_pipeline(self):return R.run_release(self.release,B,{'one.ca','two.ca','three.ca'},publish=True)
    def test_both_pilots_verify_before_remainder(self):
        result=self.run_pipeline();self.assertEqual(result['status'],'verified')
        self.assertLess(self.events.index('live-one.ca'),self.events.index('publish:three.ca'))
        self.assertLess(self.events.index('live-two.ca'),self.events.index('publish:three.ca'))
    def test_candidate_failure_prevents_all_publication(self):
        def fail(release,name,jobs,**kwargs):
            if name=='candidate':raise ValueError('Visual regression')
            return release/name/'report.json'
        with patch.object(R,'browser',side_effect=fail),self.assertRaisesRegex(ValueError,'Visual'):self.run_pipeline()
        self.assertFalse(any(e.startswith('publish:') for e in self.events))
    def test_first_pilot_failure_stops_remaining_sites(self):
        def fail(api,plan,receipt,dist):
            if receipt['commit']==C:raise ValueError('Public mismatch')
            return {}
        with patch.object(R,'verify_live',side_effect=fail),self.assertRaisesRegex(ValueError,'mismatch'):self.run_pipeline()
        self.assertEqual([e for e in self.events if e.startswith('publish:')],['publish:one.ca'])
    def test_resume_verifies_published_pilot_without_republishing(self):
        calls=[]
        def fail_once(api,plan,receipt,dist):
            if receipt['commit']==C and not calls:calls.append(True);raise ValueError('Network interrupted')
            return {}
        with patch.object(R,'verify_live',side_effect=fail_once),self.assertRaisesRegex(ValueError,'interrupted'):self.run_pipeline()
        self.run_pipeline();self.assertEqual(self.events.count('publish:one.ca'),1)
    def test_uncertain_receipt_blocks_resume(self):
        def uncertain(api,plan,path):R.save(path,{'status':'publication-outcome-unknown'});raise ValueError('Lost response')
        with patch.object(R.DEPLOY,'publish',side_effect=uncertain),self.assertRaisesRegex(ValueError,'Lost'):self.run_pipeline()
        with self.assertRaisesRegex(ValueError,'uncertain receipt'):self.run_pipeline()
        self.assertFalse(any(e.startswith('publish:') for e in self.events))
    def test_initial_rehearsal_refuses_any_live_change(self):
        original=R.DEPLOY.plan_build
        def changed(*args):
            plan=original(*args);plan['files']=[{'path':'index.html','changed':True}];R.save(args[-1],plan);return plan
        with patch.object(R.DEPLOY,'plan_build',side_effect=changed),self.assertRaisesRegex(ValueError,'Rehearsal would change'):
            R.run_release(self.release,B,{'one.ca','two.ca','three.ca'},publish=True,require_no_changes=True)
        self.assertFalse(any(e.startswith('publish:') for e in self.events))
    def test_new_source_main_stops_publication_of_old_artifact(self):
        with patch.object(R,'assert_source_current',side_effect=ValueError('Source main advanced')):
            with self.assertRaisesRegex(ValueError,'advanced'):self.run_pipeline()
        self.assertFalse(any(e.startswith('publish:') for e in self.events))
    def test_source_is_rechecked_before_each_site_publication(self):
        calls=[]
        def advance(api,sha):
            calls.append(True)
            if len(calls)==6:raise ValueError('Source main advanced')
        with patch.object(R,'assert_source_current',side_effect=advance),self.assertRaisesRegex(ValueError,'advanced'):self.run_pipeline()
        self.assertEqual([e for e in self.events if e.startswith('publish:')],['publish:one.ca','publish:two.ca'])

if __name__=='__main__':unittest.main()
