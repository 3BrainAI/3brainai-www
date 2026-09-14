/* Behavioural unit fixture for the actual R3.2 script. This is not a browser,
   renderer, network measurement, keyboard or assistive-technology test. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.argv[2], 'utf8');
const checks=[];
function check(name, fn) { fn(); checks.push(name); }

function fixture(startMobile, hash='') {
 const events={};
 const viewport={matches:startMobile, addEventListener(type,fn){this[type]=fn;}};
 const makeNode=(tag, attrs={})=>({tagName:tag,attrs:{...attrs},parentElement:null,
  hasAttribute(k){return k in this.attrs;},setAttribute(k,v){this.attrs[k]=v;},
  scrollIntoView(){this.scrolled=true;}});
 const makeDetail=()=>Object.assign(makeNode('DETAILS',{'data-v32-responsive':'section'}),{
  open:true,events:{},addEventListener(type,fn){this.events[type]=fn;}
 });
 const a=makeDetail(),b=makeDetail();
 const makeTemplate=(kind,parent)=>{
  const host={children:[],append(n){this.children.push(n);}};
  const slot=Object.assign(makeNode('DIV'),{parentElement:parent,querySelector(){return host;}});
  return {dataset:{v32Media:kind},parentElement:slot,content:{cloneNode(){return {image:true};}},host};
 };
 const templates=[makeTemplate('disclosure',a),makeTemplate('disclosure',b),makeTemplate('desktop',null)];
 const section=Object.assign(makeNode('SECTION'),{querySelector(){return b;}});
 b.parentElement=section;
 const omitted=makeNode('SECTION',{'data-v32-mobile-omit':'redundant'});
 const inner=Object.assign(makeNode('SPAN'),{parentElement:omitted});
 const targets={section,inner,detail:a};
 const document={querySelectorAll(s){return s.startsWith('details')?[a,b]:templates;},
  addEventListener(type,fn){events['document:'+type]=fn;},getElementById(id){return targets[id];}};
 const parent={};
 const window={matchMedia(){return viewport;},location:{hash},parent,
  addEventListener(type,fn){events[type]=fn;},requestAnimationFrame(fn){fn();}};
 vm.runInNewContext(source,{window,document,WeakMap,decodeURIComponent,String});
 return {a,b,templates,viewport,events,targets,window,parent};
}

const m=fixture(true);
check('Cold mobile closes optional disclosures and hydrates no template images',()=>{
 assert.equal(m.a.open,false);assert.equal(m.b.open,false);
 assert.deepEqual(m.templates.map(x=>x.host.children.length),[0,0,0]);
});
m.a.open=true;m.a.events.toggle();
check('Opening one mobile photo hydrates only its own image',()=>{
 assert.deepEqual(m.templates.map(x=>x.host.children.length),[1,0,0]);
});
m.a.open=false;m.a.events.toggle();m.a.open=true;m.a.events.toggle();
check('Reopening a photo does not duplicate DOM image content',()=>assert.equal(m.templates[0].host.children.length,1));
m.viewport.matches=false;m.viewport.change();
check('Desktop transition exposes full content and hydrates remaining media once',()=>{
 assert.equal(m.a.open,true);assert.equal(m.b.open,true);
 assert.deepEqual(m.templates.map(x=>x.host.children.length),[1,1,1]);
});
m.viewport.matches=true;m.viewport.change();
check('Returning to mobile retains the explicit mobile open choice',()=>{
 assert.equal(m.a.open,true);assert.equal(m.b.open,false);
});
const d=fixture(false);
check('Cold desktop opens all responsive details and hydrates all eligible media',()=>{
 assert.equal(d.a.open,true);assert.equal(d.b.open,true);
 assert.deepEqual(d.templates.map(x=>x.host.children.length),[1,1,1]);
});
const h=fixture(true,'#section');
check('An incoming section hash opens that section and scrolls to it',()=>{
 assert.equal(h.b.open,true);assert.equal(h.a.open,false);assert.equal(h.targets.section.scrolled,true);
 assert.deepEqual(h.templates.map(x=>x.host.children.length),[0,1,0]);
});
h.window.location.hash='#inner';h.events.hashchange();
check('A direct anchor reveals an otherwise omitted duplicate block',()=>{
 assert.equal(h.targets.inner.parentElement.attrs['data-v32-revealed'],'true');
 assert.equal(h.targets.inner.scrolled,true);
});
const p=fixture(true);
p.events.message({source:{},data:{type:'cri-n4-anchor',hash:'#section'}});
check('Unrelated message source cannot open preview sections',()=>assert.equal(p.b.open,false));
p.events.message({source:p.parent,data:{type:'cri-n4-anchor',hash:'#section'}});
check('The existing parent preview shell can reveal a linked section',()=>assert.equal(p.b.open,true));
console.log(JSON.stringify({pass:checks.length,fail:0,scope:'Node VM behavioural fixture; no browser DOM, layout, event-loop fidelity or network test',checks},null,2));
