import test from 'node:test';
import assert from 'node:assert/strict';
import {synchronizeVerifiedProgress} from './sync-verified-progress.mjs';
const json=x=>new Response(JSON.stringify(x),{status:200});
test('a saved batch is unsynchronized until D1 readback matches',async()=>{
 let count=0;
 const fetchImpl=async()=>{
  count++;
  return count===1?json({project:{id:4,translated_pages:5}}):json({project:{id:4,translated_pages:4,pages:10,status:'in_progress'}});
 };
 await assert.rejects(synchronizeVerifiedProgress({projectId:4,expectedPages:5,totalPages:10,fetchImpl}),/SYNC_OPEN/);
 assert.equal(count,2);
});
test('all matching readbacks pass',async()=>{
 let count=0;
 const fetchImpl=async()=>{
  count++;
  return count===1?json({project:{id:4,translated_pages:5}}):json({project:{id:4,translated_pages:5,pages:10,status:'in_progress'}});
 };
 assert.equal((await synchronizeVerifiedProgress({projectId:4,expectedPages:5,totalPages:10,fetchImpl})).synchronized,true);
});
