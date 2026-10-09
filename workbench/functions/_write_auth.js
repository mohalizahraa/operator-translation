// Capability guard for new sensitive editorial mutation endpoints.
// A public URL or x-workbench-actor header is NOT identity verification.
export async function requireEditorCapability(context) {
  const secret = context.env?.WORKBENCH_EDITOR_KEY;
  if (typeof secret !== 'string' || secret.length < 32) {
    return {ok:false, status:503, error:'Editor access is not provisioned. Configure WORKBENCH_EDITOR_KEY as a Cloudflare secret; never publish it or enable unauthenticated fallback.'};
  }
  const header=context.request.headers.get('x-workbench-editor-key') || '';
  if (header.length!==secret.length || header.length<32) {
    return {ok:false,status:401,error:'An editor key is required for this change.'};
  }
  const encoder=new TextEncoder();
  const [expected,actual]=await Promise.all([
    crypto.subtle.digest('SHA-256',encoder.encode(secret)),
    crypto.subtle.digest('SHA-256',encoder.encode(header))
  ]);
  const a=new Uint8Array(expected), b=new Uint8Array(actual);
  let diff=0; for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  return diff===0 ? {ok:true} : {ok:false,status:401,error:'Invalid editor key.'};
}
