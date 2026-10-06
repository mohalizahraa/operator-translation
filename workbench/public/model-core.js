(function(root){
  'use strict';

  function median(values, fallback=400) {
    const sorted=(values || []).filter(Number.isFinite).sort((a,b)=>a-b);
    if (!sorted.length) return fallback;
    const mid=Math.floor(sorted.length/2);
    return sorted.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
  }

  function verifiedFallbackPages(projects, fallback=400) {
    const verified=(projects || [])
      .filter(project=>project?.page_count_verified)
      .map(project=>Number(project.pages))
      .filter(value=>Number.isFinite(value) && value>0);
    return Math.round(median(verified,fallback));
  }

  function estimatedPages(project, fallbackPages, indexedVolume=false) {
    const pages=Number(project?.pages);
    if (project?.page_count_verified && Number.isFinite(pages) && pages>0) return pages;
    const volumes=Number(project?.volumes);
    if (Number.isFinite(volumes) && volumes>1 && !indexedVolume) return fallbackPages*volumes;
    return fallbackPages;
  }

  function statusTransitionAllowed(statusOrder, from, to) {
    if (from===to) return true;
    const a=statusOrder.indexOf(from), b=statusOrder.indexOf(to);
    return a>=0 && b>=0 && Math.abs(a-b)===1;
  }

  function workflowTransitionAllowed(statusOrder, project, to) {
    const from=project?.status;
    if (!statusTransitionAllowed(statusOrder,from,to)) return false;
    if (from==='in_progress' && to==='review' && project?.page_count_verified) {
      const total=Number(project.pages || 0);
      const done=Number(project.translated_pages || 0);
      if (total>0 && done<total) return false;
    }
    return true;
  }

  function reconcilePageDeltas(events, acceptedActors=null) {
    const creditsByProject=new Map();
    const ordered=[...(events || [])].sort((a,b)=>{
      const byTime=String(a.created_at || '').localeCompare(String(b.created_at || ''));
      return byTime || Number(a.id || 0)-Number(b.id || 0);
    });

    for (const event of ordered) {
      const projectId=Number(event.project_id);
      const before=Number(event.before_pages || 0);
      const after=Number(event.after_pages || 0);
      if (!Number.isFinite(projectId) || !Number.isFinite(before) || !Number.isFinite(after) || !event.date_key) continue;
      const delta=after-before;
      if (!delta) continue;
      if (!creditsByProject.has(projectId)) creditsByProject.set(projectId,[]);
      const credits=creditsByProject.get(projectId);
      if (delta>0) {
        credits.push({date_key:event.date_key,pages:delta,actor:event.actor || 'Unknown'});
        continue;
      }
      let remaining=-delta;
      for (let i=credits.length-1;i>=0 && remaining>0;i--) {
        const take=Math.min(credits[i].pages,remaining);
        credits[i].pages-=take;
        remaining-=take;
      }
    }

    const dailyPages={};
    for (const credits of creditsByProject.values()) {
      for (const credit of credits) {
        if (!(credit.pages>0)) continue;
        if (Array.isArray(acceptedActors) && !acceptedActors.includes(credit.actor)) continue;
        dailyPages[credit.date_key]=(dailyPages[credit.date_key] || 0)+credit.pages;
      }
    }
    return dailyPages;
  }

  function completionHistory(transitions, currentTranslated) {
    const ordered=[...(transitions || [])].sort((a,b)=>{
      const byTime=String(a.created_at || '').localeCompare(String(b.created_at || ''));
      return byTime || Number(a.id || 0)-Number(b.id || 0);
    });
    const net=ordered.reduce((sum,event)=>sum+Number(event.delta || 0),0);
    const baseline=Math.max(0,Number(currentTranslated || 0)-net);
    const dayDeltas={};
    for (const event of ordered) {
      if (!event.date_key || !Number.isFinite(Number(event.delta))) continue;
      dayDeltas[event.date_key]=(dayDeltas[event.date_key] || 0)+Number(event.delta);
    }
    return {baseline,dayDeltas,events:ordered};
  }

  root.WorkbenchCore={
    median,
    verifiedFallbackPages,
    estimatedPages,
    statusTransitionAllowed,
    workflowTransitionAllowed,
    reconcilePageDeltas,
    completionHistory,
  };
})(typeof globalThis!=='undefined' ? globalThis : window);
