#!/usr/bin/env node
/** Guard the documented cross-runtime PDF bridge against silent removal/drift. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url),'utf8');
const workflow = await read('../../.github/workflows/workbench-source-fetch.yml');
const readme = await read('../README.md');
const request = await read('../source-access-request.txt');
const helper = await read('./fetch-workbench-source.mjs');
const firstLine = request.split(/\r?\n/,1)[0].trim();

assert.match(readme,/\.github\/workflows\/workbench-source-fetch\.yml/,'Active README must identify actual workflow.');
assert.match(workflow,/branches:\s*\[main\]/,'Request trigger must be limited to main.');
assert.match(workflow,/workbench\/source-access-request\.txt/,'Request-file push must trigger the workflow.');
assert.match(workflow,/workflow_dispatch:/,'Manual exact-ID dispatch must be available.');
assert.match(workflow,/runs-on:\s*\[self-hosted, Windows, X64\]/,'GitHub paid hosted compute is prohibited.');
assert.match(workflow,/permissions:\s*\n\s*contents: read/,'Use least-privileged workflow permissions.');
assert.match(workflow,/node --test workbench\/scripts\/fetch-workbench-source\.test\.mjs/,'Source helper regression suite must execute before download.');
assert.match(workflow,/node workbench\/scripts\/fetch-workbench-source\.mjs/,'Workflow must call tested source helper.');
assert.match(workflow,/actions\/upload-artifact@v4/,'Expected handoff action missing.');
assert.match(workflow,/name: workbench-source-pdf/,'Expected stable artifact name missing.');
assert.match(workflow,/retention-days: 1/,'Source handoff must be short lived.');
assert.match(workflow,/issues: write/,'Reporting results to the private verification issue requires scoped issue permission.');
assert.match(workflow,/Report run outcome to private verification issue/,'A bridge run must expose checkable outcome outside the runner.');
assert.match(workflow,/if: always\(\)/,'A failed source job must still attempt its outcome report.');
assert.match(workflow,/FETCH_SHA256/,'Report must identify the downloaded PDF by SHA-256 without exposing source bytes.');
assert.match(workflow,/if: always\(\)/,'Ephemeral source clean-up must run on failure.');
assert.match(helper,/haydari-translation-workbench\.pages\.dev/,'Source must remain Workbench-owned.');
assert.match(helper,/\/api\/pdf\/\$\{id\}/,'Source must go through project PDF route.');
assert.match(helper,/signature\/completeness checks/,'Non-PDF responses must fail closed.');
assert.match(firstLine,/^[1-9][0-9]*$/,'Request must start with an exact positive project ID.');
console.log(`PDF access bridge: PASS (request project ${firstLine}; runtime availability requires Actions readback)`);
