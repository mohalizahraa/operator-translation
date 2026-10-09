#!/usr/bin/env node
// Derives blinded calibration input from example fixtures without disclosing scoring labels.
import fs from 'node:fs';
const [promptPath,schemaPath]=process.argv.slice(2);
if(!promptPath||!schemaPath) throw new Error('Expected prompt and schema output paths');
const fixtures=JSON.parse(fs.readFileSync(new URL('./translator-calibration-fixtures.json',import.meta.url),'utf8'));
const sourceOnly=fixtures.cases.map(({id,arabic,context})=>({id,arabic,context}));
const allowed=['technical_polysemy','referent_ambiguity','logical_scope','source_damage'];
const prompt=[
'You are conducting an Arabic→English scholarly translation-ambiguity audit on short illustrative examples. This is a diagnostic test, not a translation or publication-ready review.',
'You are given only the source snippet and context. Identify genuinely applicable issue categories in flags. Distinguish a technical term that might have another meaning in a different field from a true unresolved ambiguity: flag technical_polysemy when the term requires context-aware disambiguation, but do not always ask the reviewer if the supplied context resolves it.',
'If the source cannot be read reliably, flag source_damage and set block_source=true. If a meaning-affecting referent cannot be resolved, flag referent_ambiguity and request human review. Do not invent uncertainties on ordinary clear sentences. Respect negation and logical scope.',
'Allowed flags: '+allowed.join(', ')+'. Return a JSON object with a single key predictions, an array of one prediction per provided id in exactly the same order. Each has {id, flags, ask_reviewer, block_source}. Respond only in the schema.',
'INPUT CASES:',JSON.stringify(sourceOnly,null,2)
].join('\n\n');
const schema={type:'object',properties:{predictions:{type:'array',items:{type:'object',properties:{id:{type:'string'},flags:{type:'array',items:{type:'string',enum:allowed}},ask_reviewer:{type:'boolean'},block_source:{type:'boolean'}},required:['id','flags','ask_reviewer','block_source'],additionalProperties:false}}},required:['predictions'],additionalProperties:false};
if(prompt.includes('expected_flags')||prompt.includes('expected_focus'))throw Error('Gold answers leaked into prompt');
fs.writeFileSync(promptPath,prompt,'utf8');
fs.writeFileSync(schemaPath,JSON.stringify(schema,null,2),'utf8');
console.log('Blinded translator calibration input generated: '+sourceOnly.length+' illustrative cases (no gold fields).');
