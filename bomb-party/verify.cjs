const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
function load(file, imports = {}) { const source = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText; const module={exports:{}};new Function('require','module','exports',source)(name=>imports[name],module,module.exports);return module.exports; }
const adultData=load('data/adult-prompts.ts'); const extra=load('data/extra-prompts.ts'); const data=load('data/prompts.ts',{'./extra-prompts':extra,'./adult-prompts':adultData}); const {duration,shuffle,PromptDeck}=load('lib/game.ts',{'@/data/prompts':data});
assert.equal(data.prompts.length,420);assert.equal(new Set(data.prompts.map(p=>p.text)).size,420);
const deck=new PromptDeck(); const normal=Array.from({length:180},()=>deck.next('normal'));assert.equal(new Set(normal.map(p=>p.text)).size,180);assert(normal.every(p=>!p.adult));assert.notEqual(deck.next('normal').text,normal.at(-1).text);
const adult=Array.from({length:240},()=>deck.next('adult'));assert.equal(new Set(adult.map(p=>p.text)).size,240);assert(adult.every(p=>p.adult));assert(adult.every(p=>!normal.some(n=>n.text===p.text)));assert.notEqual(deck.next('adult').text,adult.at(-1).text);assert.equal(deck.next('normal').adult,false);
assert.equal(duration(()=>0),20000);assert.equal(duration(()=>1),75000);const draws=Array.from({length:50000},()=>duration());assert(draws.every(x=>x>=20000&&x<=75000));const centered=draws.filter(x=>x>=30000&&x<=55000).length/draws.length;assert(centered>.7);assert.deepEqual(shuffle([1,2,3]).sort(),[1,2,3]);
console.log(`Passed: 420 distinct prompts, full-pool non-repetition, mode changes, shuffle, timer bounds; ${(centered*100).toFixed(1)}% of rounds between 30–55 seconds.`);

// Exercise the actual React component's event handlers with deterministic hooks and timers.
const realNow=Date.now;const realSetTimeout=global.setTimeout;const realClearTimeout=global.clearTimeout;
let now=100000, nextId=0, cursor=0, mounted=false; const slots=[], effects=[], scheduled=new Map(), preferences=new Map();
Date.now=()=>now;global.setTimeout=(callback,delay)=>{const id=++nextId;scheduled.set(id,{callback,due:now+delay});return id;};global.clearTimeout=id=>scheduled.delete(id);
global.localStorage={getItem:key=>preferences.get(key)??null,setItem:(key,value)=>preferences.set(key,value)};
const listeners=new Map();global.window={addEventListener:(key,callback)=>listeners.set(key,callback),removeEventListener:()=>{},dispatchEvent:()=>{}};global.document={addEventListener:()=>{},removeEventListener:()=>{}};
const react={useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];},useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},useCallback(fn){return fn;},useEffect(fn){if(!mounted)effects.push(fn);},useSyncExternalStore(subscribe,snapshot){return snapshot();}};
const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'};
const source=ts.transpileModule(fs.readFileSync('components/PartyGame.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const component={exports:{}};new Function('require','module','exports',source)(name=>({'react':react,'react/jsx-runtime':jsx,'./Bomb':()=>null,'@/data/prompts':data,'@/lib/game':{duration:()=>40000,PromptDeck},'@/lib/audio':{GameAudio:class{unlock(){}play(){}close(){}}}}[name]),component,component.exports);
function render(){cursor=0;return component.exports.default();}
function find(node, predicate){if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of [node.props?.children].flat(Infinity)){const match=find(child,predicate);if(match)return match;}return null;}
function button(tree,text){return find(tree,node=>node.type==='button'&&[node.props.children].flat().some(child=>typeof child==='string'&&child.includes(text)));}
let tree=render();const cleanups=effects.map(fn=>fn());mounted=true;
// Strict Mode's setup/cleanup/setup replay must not schedule a round.
cleanups.forEach(fn=>fn?.());effects.forEach(fn=>fn());assert.equal(scheduled.size,0);
button(tree,'START GAME').props.onClick();tree=render();assert.equal(scheduled.size,2);
const originalDeadline=Math.max(...[...scheduled.values()].map(timer=>timer.due));
assert.equal(button(tree,'ANSWERED, PASS IT'),null);
const oldPrompt=find(tree,n=>n.type==='h1').props.children;
const oldCallbacks=[...scheduled.values()].map(timer=>timer.callback);
now+=1000;
const skipButton=button(tree,'SKIP QUESTION');skipButton.props.onClick();skipButton.props.onClick();tree=render();
assert.equal(scheduled.size,2);assert.notDeepEqual(find(tree,n=>n.type==='h1').props.children,oldPrompt);
const replacementDeadline=Math.max(...[...scheduled.values()].map(timer=>timer.due));
assert.equal(replacementDeadline,originalDeadline+1000);
oldCallbacks.forEach(callback=>callback());tree=render();assert(button(tree,'SKIP QUESTION'));assert.equal(scheduled.size,2);
// Passing by hand needs no action and never changes the deadline.
listeners.get('keydown')({key:' ',code:'Space',preventDefault(){throw new Error('Space should not pass');}});
assert.equal(Math.max(...[...scheduled.values()].map(timer=>timer.due)),replacementDeadline);
// Explosion clears all scheduled work, and a double start cannot create two rounds.
now=replacementDeadline;const boom=[...scheduled.values()].find(timer=>timer.due===replacementDeadline);boom.callback();tree=render();assert(button(tree,'NEXT ROUND'));assert.equal(scheduled.size,0);
for(let round=0;round<5;round++){const next=button(tree,'NEXT ROUND');next.props.onClick();next.props.onClick();assert.equal(scheduled.size,2);const end=Math.max(...[...scheduled.values()].map(timer=>timer.due));now=end;[...scheduled.values()].find(timer=>timer.due===end).callback();tree=render();}
button(tree,'NEXT ROUND').props.onClick();tree=render();button(tree,'HOME').props.onClick();assert.equal(scheduled.size,0);tree=render();assert(button(tree,'START GAME'));
const adultButton=button(tree,'21+ After hours');adultButton.props.onClick();assert.equal(preferences.get('bomb-party-mode'),'adult');tree=render();assert.equal(button(tree,'21+ After hours').props['aria-pressed'],true);
cleanups.forEach(fn=>fn?.());Date.now=realNow;global.setTimeout=realSetTimeout;global.clearTimeout=realClearTimeout;
console.log('Passed: Strict Mode lifecycle, hands-only passing, skip restart/debounce, stale callback protection, explosion cleanup, repeated rounds, double-start protection, home cleanup, mode persistence.');
