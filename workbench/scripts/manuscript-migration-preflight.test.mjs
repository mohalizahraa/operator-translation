import test from 'node:test';
import assert from 'node:assert/strict';
import { assessMigration, auditMigration } from './manuscript-migration-preflight.mjs';

const sourceId='a'.repeat(28), copyId='b'.repeat(28), oldDraftId='c'.repeat(28);
const owner='destination@example.org';
const base=()=>({
  project:{id:88,title_en:'Representative scholarly book'},
  live:{id:88,title_en:'Representative scholarly book',status:'not_started',
    sourcePageProgress:0,observedThisRun:true,apiWritable:true,linkBefore:null},
  expectedLinkBefore:null,
  inventoryComplete:true,sourceSearchComplete:true,
  sourceCandidates:[{fileId:sourceId,contentState:'nonempty',contentVerified:true,editionVerified:true}],
  destinationCandidates:[],action:'copy_existing',copySourceFileId:sourceId
});
const withCopy=()=>{const x=base();x.action='attach_target';x.destinationCandidates=[{
  fileId:copyId,kind:'native_copy',sourceFileId:sourceId,ownerEmail:owner,
  ownerVerified:true,textEquivalent:true,structureEquivalent:true,
  stylesEquivalent:true,notesEquivalent:true,manuscriptRevisionVerified:true,
  permission:{type:'anyone',role:'writer'},anonymousAccessible:true
}];return x;};
const reasons=(row)=>assessMigration(row,owner).blockers;

test('native-copy plan of an actual source manuscript may proceed when no destination exists',()=>{
  assert.deepEqual(reasons(base()),[]);
});
test('known existing text blocks the accidental blank replacement (real #88 failure class)',()=>{
  const row=base();row.action='create_draft';
  assert.ok(reasons(row).includes('existing_manuscript_requires_copy'));
});
test('unknown older-account scaffold is not assumed blank',()=>{
  const row=base();row.action='create_draft';
  row.sourceCandidates[0]={fileId:sourceId,contentState:'unknown',contentVerified:false};
  assert.ok(reasons(row).includes('source_content_unknown'));
});
test('a nonempty source with a preexisting blank destination requires reconciliation first',()=>{
  const row=base();row.destinationCandidates=[{fileId:oldDraftId,kind:'new_draft'}];
  assert.ok(reasons(row).includes('destination_already_exists'));
});
test('verified empty source can justify a new draft only for unstarted book',()=>{
  const row=base();row.action='create_draft';
  row.sourceCandidates[0]={fileId:sourceId,contentState:'empty',contentVerified:true};
  assert.deepEqual(reasons(row),[]);
  row.live.status='review';
  assert.ok(reasons(row).includes('draft_does_not_preserve_workflow_state'));
});
test('structural counts alone do not prove exact-copy fidelity',()=>{
  const row=withCopy();row.destinationCandidates[0].textEquivalent=false;
  assert.ok(reasons(row).includes('exact_copy_not_verified'));
});
test('source-backed native copy can be attached after full evidence',()=>{
  assert.deepEqual(reasons(withCopy()),[]);
});
test('owner and permission evidence are independently mandatory',()=>{
  const row=withCopy();
  row.destinationCandidates[0].ownerEmail='original@example.org';
  row.destinationCandidates[0].permission={type:'user',role:'writer'};
  assert.ok(reasons(row).includes('destination_owner_not_verified'));
  assert.ok(reasons(row).includes('public_editor_permission_missing'));
});
test('live readback and exact project identity are mandatory',()=>{
  const row=withCopy();row.live.observedThisRun=false;row.live.apiWritable=false;
  row.live.title_en='Incorrect edition';
  assert.ok(reasons(row).includes('live_project_identity_unverified'));
  assert.ok(reasons(row).includes('live_api_unavailable'));
});
test('a changed Workbench current link blocks concurrent overwrite',()=>{
  const row=withCopy();row.live.linkBefore='different';
  assert.ok(reasons(row).includes('live_link_changed_concurrently'));
});
test('multiple active target Docs are a hard conflict, superseded placeholders are excluded',()=>{
  const row=withCopy();row.destinationCandidates.push({fileId:oldDraftId,kind:'new_draft'});
  assert.ok(reasons(row).includes('multiple_active_destinations'));
  row.destinationCandidates[1].disposition='superseded';
  assert.ok(!reasons(row).includes('multiple_active_destinations'));
});
test('source itself cannot be the destination copy',()=>{
  const row=withCopy();row.destinationCandidates[0].fileId=sourceId;
  assert.ok(reasons(row).includes('source_equals_destination'));
});
test('portfolio checks duplicate project ID and reused target ID',()=>{
  const row=withCopy();const other=withCopy();
  const report=auditMigration({destinationOwner:owner,rows:[row,other]},owner);
  assert.equal(report.safe,false);
  assert.ok(report.results[1].blockers.includes('duplicate_project_id'));
  assert.ok(report.results[1].blockers.includes('destination_reused_across_projects'));
});
test('preflight requires authorization for exact destination owner',()=>{
  assert.throws(()=>auditMigration({destinationOwner:owner,rows:[base()]},'different@example.org'),/owner/);
});
test('incomplete source and destination census blocks mutation',()=>{
  const row=base();row.sourceSearchComplete=false;row.inventoryComplete=false;
  assert.ok(reasons(row).includes('source_search_incomplete'));
  assert.ok(reasons(row).includes('inventory_incomplete'));
});

test('a source of the wrong or unverified edition is never copied',()=>{
  const row=base();row.sourceCandidates[0].editionVerified=false;
  assert.ok(reasons(row).includes('copy_source_edition_unverified'));
});
test('conflicting or inaccessible alternative source witnesses block copying',()=>{
  const row=base();row.sourceCandidates.push({fileId:'d'.repeat(28),contentState:'unknown',contentVerified:false});
  assert.ok(reasons(row).includes('multiple_or_unresolved_source_manuscripts'));
});
test('audit-only cannot accidentally authorize a write',()=>{
  const row=base();row.action='audit_only';
  assert.ok(reasons(row).includes('invalid_action'));
});
