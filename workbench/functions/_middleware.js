import {requireEditorCapability} from './_write_auth.js';

// Once WORKBENCH_EDITOR_KEY is configured in Cloudflare, ALL API writes are
// guarded here. Never confuse client-provided x-workbench-actor with auth.
// During migration, an unprovisioned deployment retains legacy writes;
// this is explicitly an INSECURE transitional state, not a completed rollout.
const SAFE=new Set(['GET','HEAD','OPTIONS']);
export async function onRequest(context) {
  const request=context.request;
  if (SAFE.has(request.method.toUpperCase()) || !new URL(request.url).pathname.startsWith('/api/')) return context.next();
  const origin=request.headers.get('origin');
  if (origin && origin!==new URL(request.url).origin){
    return new Response(JSON.stringify({error:'Cross-origin edit requests are not accepted.'}),{status:403,headers:{'content-type':'application/json','cache-control':'no-store'}});
  }
  if (context.env?.WORKBENCH_EDITOR_KEY!==undefined){
    const result=await requireEditorCapability(context);
    if(!result.ok) return new Response(JSON.stringify({error:result.error,code:'editor_access_required'}),{status:result.status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  }
  return context.next();
}
