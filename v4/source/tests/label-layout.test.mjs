import test from 'node:test';import assert from 'node:assert/strict';
import {layoutLabels} from '../label-layout.js';
test('crowded team labels stay separated and inside portrait and landscape views',()=>{
 for(const [width,height] of [[350,480],[700,590],[1024,768]]){
  const anchors=Array.from({length:5},(_,id)=>({id,x:width/2,y:height/2,visible:true}));
  const result=layoutLabels(anchors,width,height);
  assert.equal(result.filter(p=>p.visible).length,5);
  for(const [i,p] of result.entries()){
   assert.ok(p.x-p.width/2>=0&&p.x+p.width/2<=width);
   assert.ok(p.y-p.height/2>=0&&p.y+p.height/2<=height);
   for(const q of result.slice(i+1))assert.ok(Math.abs(p.x-q.x)>=p.width+6||Math.abs(p.y-q.y)>=p.height+6);
  }
  assert.deepEqual(result,layoutLabels(anchors,width,height));
 }
});
test('offscreen staff do not consume label space; crowded tiny views fail closed',()=>{
 const hidden={x:10,y:10,visible:false};assert.equal(layoutLabels([hidden],350,480)[0].visible,false);
 const result=layoutLabels(Array.from({length:5},()=>({x:50,y:50,visible:true})),100,100);
 assert.ok(result.filter(x=>x.visible).length<5);
});
