// Open-collaboration compatibility shim.
// No editor/reviewer capability key is requested, checked, or stored.
// The 'Editing as' selector and human-review declarations are self-reported,
// never proof of identity; revision-bound QA and decision-history guards remain.
export async function requireEditorCapability(_context) {
  return {ok:true};
}

export async function requireHumanReviewerCapability(_context) {
  return {ok:true};
}
