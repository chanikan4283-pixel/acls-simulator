import {createHash} from 'node:crypto';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function buildIdentity(entries){
 const sources=Object.fromEntries([...entries].sort(([a],[b])=>a.localeCompare(b)).map(([name,bytes])=>[name,sha256(bytes)]));
 return {buildId:sha256(JSON.stringify(sources)),sources};
}
