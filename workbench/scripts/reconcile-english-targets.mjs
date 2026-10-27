/**
 * Conservative, read-only reconciliation of Workbench English targets.
 * Takes existing live /api/projects rows and authenticated Drive search/file
 * metadata supplied by the caller. No Google API credentials or mutations.
 *
 * Restricted status from Drive visibility search is evidence of a blocker,
 * never authorization to change file permissions or link a manuscript.
 */

const candidateId=entry=>{
  const title=entry?.title??entry?.name??'';
  if(typeof title!=='string'||!/English Translation/i.test(title))return null;
  const match=title.match(/\(Workbench #(\d+)\)/);
  return match?Number(match[1]):null;
};
const docIdFromUrl=url=>{
  if(!url)return null;
  try{
    const u=new URL(url);
    if(u.protocol!=='https:'||u.hostname!=='docs.google.com')return null;
    return u.pathname.match(/^\/document\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)?.[1]||null;
  }catch{return null;}
};

export function reconcileEnglishTargets({
  projects,candidates,metadataByFileId={},restrictedFileIds=[],
}) {
  if(!Array.isArray(projects)||!Array.isArray(candidates)||!metadataByFileId||
     typeof metadataByFileId!=='object'||!Array.isArray(restrictedFileIds)){
    return {ok:false,code:'invalid_reconciliation_input'};
  }
  const byBook=new Map(),duplicateProjects=new Set();
  for(const p of projects){
    const id=Number(p?.id);
    if(!Number.isInteger(id)||id<1)return {ok:false,code:'invalid_book_id'};
    if(byBook.has(id))duplicateProjects.add(id);
    byBook.set(id,p);
  }
  if(duplicateProjects.size)return {ok:false,code:'duplicate_workbench_book_id',
    book_ids:[...duplicateProjects].sort((a,b)=>a-b)};
  const filesByBook=new Map();
  for(const c of candidates){
    const id=candidateId(c);
    if(id===null)continue;
    const fid=c?.id??c?.fileId;
    if(typeof fid!=='string'||!fid.trim())return {ok:false,code:'unnamed_drive_candidate_id',book_id:id};
    if(!filesByBook.has(id))filesByBook.set(id,new Map());
    filesByBook.get(id).set(fid,{id:fid,title:c?.title??c?.name});
  }
  const restricted=new Set(restrictedFileIds);
  const rows=[];
  for(const [id,project] of [...byBook].sort((a,b)=>a[0]-b[0])){
    const matches=[...(filesByBook.get(id)?.values()||[])];
    const linked=docIdFromUrl(project.google_doc_url);
    const invalidLinked=Boolean(project.google_doc_url&&!linked);
    let decision;
    if(invalidLinked)decision='invalid_existing_doc_url';
    else if(matches.length>1)decision='duplicate_english_candidates';
    else if(linked&&matches.length===1&&linked!==matches[0].id)
      decision='linked_other_doc_review_required';
    else if(linked)decision='already_linked_identity_check_pending';
    else if(!matches.length)decision='no_candidate_document';
    else decision='existing_candidate_requires_access_and_content_review';

    const candidate=matches.length===1?matches[0]:null;
    const targetId=linked||candidate?.id||null;
    const meta=targetId?metadataByFileId[targetId]:null;
    const permissionMetadata=Array.isArray(meta?.permissions)?meta.permissions:null;
    const publicEditor=permissionMetadata?.some(p=>p?.type==='anyone'&&p?.role==='writer')===true;
    let access;
    if(publicEditor)access='anyone_writer_metadata_confirmed';
    else if(permissionMetadata)access='no_anyone_writer_permission';
    else if(targetId&&restricted.has(targetId))access='limited_visibility_search';
    else access='permission_unverified';

    rows.push({
      book_id:id,decision,access,
      has_live_english_link:Boolean(linked),candidate_count:matches.length,
      candidate_matches_existing_link:Boolean(candidate&&linked===candidate.id),
      // No raw private Doc IDs/titles in reports. The original files remain
      // untouched; callers retain private input manifests for precise writes.
      auto_create_document_allowed:false,
      auto_link_document_allowed:false,
      needs_identity_review:Boolean(candidate||linked),
      needs_access_remediation:!linked&&access!=='anyone_writer_metadata_confirmed',
    });
  }
  const counts={};
  for(const r of rows){counts[r.decision]=(counts[r.decision]||0)+1;
    counts[r.access]=(counts[r.access]||0)+1;}
  return {ok:true,total_books:rows.length,counts,rows,
    invariant:'Reuse known English Docs; do not auto-link restricted documents or create duplicates; independently verify permissions, edition, content, canonical book ID and exact D1 readback.'};
}
