// Child used by the Windows cross-process GPU lock integration smoke.
import {appendFileSync} from 'node:fs';
import {setTimeout} from 'node:timers/promises';
const file=process.env.GPU_LOCK_TEST_LOG;
if(!file) throw new Error('GPU_LOCK_TEST_LOG_REQUIRED');
const record=(event)=>appendFileSync(file,JSON.stringify({event,pid:process.pid,time:Date.now()})+'\n','utf8');
record('start');
await setTimeout(650);
record('end');
