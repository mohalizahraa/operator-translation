// The Workbench is intentionally open for shared editing; an actor label is
// attribution, not authentication. Reject cross-origin browser writes, but do
// not request editor credentials. Public write access is a documented risk.
const SAFE=new Set(['GET','HEAD','OPTIONS']);
export async function onRequest(context) {
  const request=context.request;
  if (SAFE.has(request.method.toUpperCase()) || !new URL(request.url).pathname.startsWith('/api/')) return context.next();
  const origin=request.headers.get('origin');
  if (origin && origin!==new URL(request.url).origin){
    return new Response(JSON.stringify({error:'Cross-origin edit requests are not accepted.'}),{status:403,headers:{'content-type':'application/json','cache-control':'no-store'}});
  }
  return context.next();
}
