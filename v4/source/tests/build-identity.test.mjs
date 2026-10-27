import test from 'node:test';import assert from 'node:assert/strict';
import {buildIdentity} from '../build-identity.mjs';
test('build identity is reproducible regardless of filesystem enumeration order',()=>{
 const a=[['scene.js','visual'],['clinical.js','rules']];
 assert.deepEqual(buildIdentity(a),buildIdentity([...a].reverse()));
 assert.match(buildIdentity(a).buildId,/^[a-f0-9]{64}$/);
});
test('clinical, visual, asset and file-name changes all distinguish builds',()=>{
 const base=[['clinical.js','rules'],['scene.js','visual'],['head.glb',Buffer.from([0,1,2])]];
 const id=buildIdentity(base).buildId;
 for(let i=0;i<base.length;i++){
  const changed=base.map((e,j)=>j===i?[e[0],'changed']:e);
  assert.notEqual(buildIdentity(changed).buildId,id);
 }
 assert.notEqual(buildIdentity(base.map(([n,b])=>[n+'.renamed',b])).buildId,id);
});
