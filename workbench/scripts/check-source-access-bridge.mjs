#!/usr/bin/env node
/** Fail CI before a source bridge can quietly lose its runnable contract. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = path=>readFile(new URL(path,import.meta.url),'utf8');
const workflow=await read('../../.github/workflows/workbench-source-fetch.yml');
const readme=await read('../README.md');
const request=await read('../source-access-request.txt');
const helper=await read('./fetch-workbench-source.mjs');
const job=await read('./source-access-job.mjs');
const firstLine=request.split(/\r?\n/,1)[0].trim();

const contains=(re,reason)=>assert.match(workflow,re,reason);
const once=(pattern,reason)=>assert.equal([...workflow.matchAll(pattern)].length,1,reason);
assert.match(readme,/\.github\/workflows\/workbench-source-fetch\.yml/,'Missing canonical source bridge documentation.');
contains(/branches:\s*\[main\]/,'Push trigger must use main.');
contains(/workbench\/source-access-request\.txt/,'Request file trigger missing.');
contains(/workflow_dispatch:/,'Manual dispatch missing.');
contains(/issues:\s*\n\s*types: \[opened\]/,'Exact-ID issue trigger missing.');
contains(/github\.event\.issue\.user\.login == github\.repository_owner/,'Owner-only issue gate absent.');
contains(/if: >-\n/,'GitHub job expression must be a folded YAML scalar.');
contains(/runs-on:\s*\[self-hosted, operator-translation, macOS, ARM64\]/,'Must use a proven self-hosted Mac runner.');
contains(/group: workbench-source-fetch-macos-v2/,'Source bridge must not remain behind stale Windows concurrency group.');
contains(/permissions:\s*\n\s*contents: read\s*\n\s*issues: write/,'Use only required GitHub permissions.');
contains(/node --test workbench\/scripts\/fetch-workbench-source\.test\.mjs workbench\/scripts\/source-access-job\.test\.mjs/,'Both source tests must run before fetch.');
contains(/node workbench\/scripts\/check-source-access-bridge\.mjs/,'Structural validation must run on the runner.');
once(/node workbench\/scripts\/source-access-job\.mjs stage/g,'Exactly one source fetch stage.');
once(/      - name: Upload short-lived verified PDF artifact/g,'Exactly one artifact uploader.');
once(/      - name: Remove source bytes from runner temporary storage/g,'Exactly one cleanup step.');
once(/      - name: Report run outcome to private verification issue/g,'Exactly one issue reporter.');
contains(/node workbench\/scripts\/source-access-job\.mjs report/,'Outcome posting stage missing.');
contains(/actions\/upload-artifact@v4/,'Artifact action missing.');
contains(/name: workbench-source-pdf/,'Stable artifact name missing.');
contains(/retention-days: 1/,'Source must have one-day artifact retention.');
contains(/if: always\(\)/,'Cleanup and reporting must run on failed fetch.');
contains(/rm -f "\$RUNNER_TEMP\/workbench-source\.pdf"/,'Ephemeral PDF must be cleaned.');
assert.match(job,/fetchWorkbenchSource\(/,'Node stage must call the canonical tested PDF fetcher.');
assert.match(job,/GITHUB_REPOSITORY_OWNER/,'Issue requests must be authenticated against owner.');
assert.match(job,/issues\/\$\{issueNumber\}\/comments/,'Outcome must be posted to private verification issue.');
assert.match(helper,/https:\/\/haydari-translation-workbench\.pages\.dev/,'Canonical source must remain Workbench.');
assert.match(helper,/\/api\/pdf\/\$\{id\}/,'Source retrieval must be exact project PDF route.');
assert.match(helper,/signature\/completeness checks/,'Reject non-PDF/truncated bodies.');
assert.match(firstLine,/^[1-9][0-9]*$/,'Request file must start with exact positive project ID.');
console.log(`Source bridge contract: PASS (#${firstLine}, Mac self-hosted; live run/artifact readback still required)`);
