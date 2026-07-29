var inlets=1;var outlets=1;function anything(){var message=messagename,args=arrayfromargs(arguments);if(typeof MotifEngine==="undefined"||typeof MotifEngine.dispatch!=="function"){error("Motif: engine dispatcher is unavailable for "+message+"\n");return}return MotifEngine.dispatch(message,args)}
"use strict";var MotifEngine=(()=>{var Ue=Object.defineProperty;var un=Object.getOwnPropertyDescriptor;var fn=Object.getOwnPropertyNames;var ln=Object.prototype.hasOwnProperty;var ot=e=>{throw TypeError(e)};var mn=(e,t)=>{for(var n in t)Ue(e,n,{get:t[n],enumerable:!0})},pn=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of fn(t))!ln.call(e,r)&&r!==n&&Ue(e,r,{get:()=>t[r],enumerable:!(i=un(t,r))||i.enumerable});return e};var gn=e=>pn(Ue({},"__esModule",{value:!0}),e);var at=(e,t,n)=>t.has(e)||ot("Cannot "+n);var b=(e,t,n)=>(at(e,t,"read from private field"),n?n.call(e):t.get(e)),ce=(e,t,n)=>t.has(e)?ot("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),X=(e,t,n,i)=>(at(e,t,"write to private field"),i?i.call(e,n):t.set(e,n),n);var Li={};mn(Li,{dispatch:()=>Pi});function k(e,t,n){return Math.min(n,Math.max(t,e))}function W(e,t){return(e%t+t)%t}function He(e,t){return Math.floor(e/t)}function hn(e){let t=[...new Set(e.map(n=>W(Math.round(n),12)))].sort((n,i)=>n-i);return t.includes(0)||t.unshift(0),t}function ee(e,t,n,i){let r=hn(i),o=W(n,12),c=W(e,12),a=W(c-o,12),f=r.indexOf(a);if(f===-1){let $=He(t,r.length),E=W(t,r.length);return $*12+(r[E]??0)}let d=f+t,u=He(d,r.length),M=W(d,r.length);return u*12+(r[M]??0)-a}function st(e,t,n,i){return k(e+ee(e,t,n,i),0,127)}function ct(e,t){return k(e+t,0,127)}function dt(e,t,n,i,r){return k(e+ee(e,t,i,r)+n,0,127)}function bn(e,t,n=60,i=0){let r=Math.max(1,new Set(t.map(d=>(Math.round(d)%12+12)%12)).size),o=Math.round(e/12*r),c=r*2+2,a=o,f=e-ee(n,o,i,t);for(let d=o-c;d<=o+c;d+=1){let u=e-ee(n,d,i,t),M=Math.abs(u),T=Math.abs(f);(M<T||M===T&&Math.abs(d)<Math.abs(a)||M===T&&Math.abs(d)===Math.abs(a)&&d<a)&&(a=d,f=u)}return{degree:a,accidental:f}}function ut(e,t,n){if(t==="chromatic")return{pitch:e};let i=bn(e,n.scaleIntervals,n.triggerPitch,n.rootNote);return t==="hybrid"&&i.accidental!==0?{pitch:i.degree,accidental:i.accidental}:{pitch:i.degree}}function yn(e,t,n){return t==="chromatic"?e.pitch+(e.accidental??0):ee(n.triggerPitch,e.pitch,n.rootNote,n.scaleIntervals)+(t==="hybrid"?e.accidental??0:0)}function ft(e,t,n){if(e.pitchMode===t)return e;let i=e.notes.map(r=>{let o=yn(r,e.pitchMode,n),c=ut(o,t,n),{pitch:a,accidental:f,...d}=r;return{...d,...c}});return{...e,pitchMode:t,notes:i}}function lt(e,t){let n=[...e].map(a=>({at:a.at,duration:Math.max(1,a.duration),pitch:a.pitch,velocity:a.velocity})).sort((a,f)=>a.at-f.at||a.pitch-f.pitch);if(n.length===0)throw new Error("No completed notes to import");let i=t.rootNote??n[0]?.pitch??60,r={triggerPitch:i,rootNote:t.scaleRootNote??0,scaleIntervals:t.scaleIntervals??[0,2,4,5,7,9,11]},o=n.map(a=>{let f=a.pitch-i;return{at:a.at,duration:a.duration,...ut(f,t.pitchMode,r),velocity:a.velocity}}),c=Math.max(...o.map(a=>a.at+a.duration));return{schemaVersion:1,id:t.id,name:t.name,description:t.description??`Imported using ${t.pitchMode} relative analysis.`,pitchMode:t.pitchMode,sourceMeter:t.sourceMeter??{numerator:4,denominator:4},length:c,notes:o,metadata:{tags:t.tags?[...t.tags]:["imported"]}}}function F(e){return e.numerator*960*(4/e.denominator)}function te(e,t){let n=Number.isFinite(t)&&t>0?t:120;return e/960*(6e4/n)}function mt(e,t){switch(e){case"1/16":return 960/4;case"1/8":return 960/2;case"1/4":return 960;case"bar":return F(t);default:return 0}}function pt(e,t){if(!Number.isFinite(e)||!Number.isFinite(t)||t<=0)return 0;let n=(e%t+t)%t;return n===0?0:t-n}function Mn(e,t){if(!t)return e;let n=t.inputMin??1,i=t.inputMax??127,r=t.outputMin??1,o=t.outputMax??127,c=Math.max(.01,t.exponent??1),a=k((e-n)/Math.max(1,i-n),0,1);return r+(o-r)*a**c}function vn(e,t,n){let i=Mn(n,t.velocityCurve),o=(e.velocity??i)*(e.velocityScale??1);return Math.round(k(o+(e.velocityOffset??0),1,127))}function Ge(e,t,n,i){switch(i.pitchMode??t.pitchMode){case"chromatic":return ct(i.triggerPitch,e.pitch+(e.accidental??0));case"hybrid":return dt(i.triggerPitch,e.pitch,e.accidental??0,n.rootNote,n.scaleIntervals);default:return st(i.triggerPitch,e.pitch,n.rootNote,n.scaleIntervals)}}function kn(e,t,n){let i=Math.max(.01,e.gate??n.defaultGate??1),r=e.duration*i;return e.legato&&t&&t.at>e.at&&(r=Math.max(r,t.at-e.at)),e.tie&&t&&t.at<=e.at+e.duration&&t.pitch===e.pitch&&(t.accidental??0)===(e.accidental??0)&&(r=Math.max(r,t.at+t.duration-e.at)),r}function gt(e,t,n){let i=F(t.timeSignature),r=F(e.sourceMeter),o=n.meterMode==="fit-bar"?i/r:1,c=Math.round(k(n.channel,1,16)),a=Math.max(0,n.launchOffsetTicks??0),f=n.instanceId??0,d=[];for(let u=0;u<e.notes.length;u+=1){let M=e.notes[u];if(!M)continue;let T=e.notes[u+1],$=Ge(M,e,t,n),E=vn(M,e,n.triggerVelocity),A=a+Math.max(0,M.at*o),p=kn(M,T,e)*o,w=Math.max(A,A+p);d.push({pitch:$,velocity:E,channel:c,offsetTicks:A,offsetMs:te(A,t.tempo),instanceId:f}),d.push({pitch:$,velocity:0,channel:c,offsetTicks:w,offsetMs:te(w,t.tempo),instanceId:f})}return d.sort((u,M)=>u.offsetTicks!==M.offsetTicks?u.offsetTicks-M.offsetTicks:u.velocity-M.velocity)}function wn(e){let t=Math.max(0,Math.min(127,Math.round(e))),n=["C","C\u266F","D","D\u266F","E","F","F\u266F","G","G\u266F","A","A\u266F","B"],i=Math.floor(t/12)-2;return`${n[t%12]??"C"}${i}`}function ht(e){let t=e.trim().match(/^([A-Ga-g])([#♯b♭]?)(-2|-1|[0-8])$/);if(!t)return;let n={C:0,D:2,E:4,F:5,G:7,A:9,B:11},i=t[1]?.toUpperCase()??"",r=t[2],o=Number(t[3]),c=r==="#"||r==="\u266F"?1:r==="b"||r==="\u266D"?-1:0,a=(o+2)*12+(n[i]??0)+c;return a>=0&&a<=127?a:void 0}function Ve(e,t,n,i,r,o=64){let c=i??e.pitchMode,a=F(e.sourceMeter),f=F(t.timeSignature),d=r==="fit-bar"?f/a:1,u=e.notes.slice(0,o).map(S=>({pitch:Ge(S,e,t,{channel:1,meterMode:r,pitchMode:c,triggerPitch:n,triggerVelocity:100}),atTicks:Math.max(0,S.at*d),durationTicks:Math.max(1,S.duration*d)})),M=u.map(S=>S.pitch),T=M.length>0?Math.min(...M):n,$=M.length>0?Math.max(...M):n,E=T===$?T-1:T,A=T===$?$+1:$,w=Math.max(1,e.length*d)/Math.max(1,r==="fit-bar"?f:a);return{notes:u,noteNames:u.map(S=>wn(S.pitch)),lowPitch:E,highPitch:A,bars:w,effectivePitchMode:c,triggerPitch:n}}function bt(e){return e===0?0:-e}function yt(e,t){if(!t.invert&&!t.reverse)return e;let i=(t.reverse?[...e.notes].reverse():e.notes).map(r=>{let o={...r};return t.invert&&(o.pitch=bt(r.pitch),r.accidental!==void 0&&(o.accidental=bt(r.accidental))),t.reverse&&(o.at=Math.max(0,e.length-r.at-r.duration)),o});return t.reverse&&i.sort((r,o)=>r.at-o.at),{...e,notes:i}}var qe=[{schemaVersion:1,id:"chromatic-turn",name:"Chromatic Turn",description:"Fixed-interval phrase that ignores the selected scale.",pitchMode:"chromatic",sourceMeter:{numerator:4,denominator:4},length:3360,defaultGate:.82,metadata:{tags:["demo","chromatic"]},notes:[{at:0,duration:480,pitch:0},{at:480,duration:480,pitch:2},{at:960,duration:480,pitch:3},{at:1440,duration:480,pitch:7,velocityOffset:6},{at:1920,duration:480,pitch:5},{at:2400,duration:480,pitch:2},{at:2880,duration:480,pitch:0,gate:.95}]},{schemaVersion:1,id:"scale-turn",name:"Scale Turn",description:"Compact scale-aware turn used to validate one-key phrase triggering.",pitchMode:"scale",sourceMeter:{numerator:4,denominator:4},length:3360,defaultGate:.82,metadata:{tags:["demo","scale","turn"]},notes:[{at:0,duration:480,pitch:0,velocityOffset:4},{at:480,duration:480,pitch:1},{at:960,duration:480,pitch:2,velocityOffset:3},{at:1440,duration:480,pitch:4,velocityOffset:7},{at:1920,duration:480,pitch:3},{at:2400,duration:480,pitch:1,velocityOffset:-3},{at:2880,duration:480,pitch:0,velocityOffset:2,gate:.95}]}];function ne(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function V(e){return typeof e=="number"&&Number.isFinite(e)}function In(e){return e==="scale"||e==="chromatic"||e==="hybrid"}function _n(e,t,n){if(!ne(e))return n.push(`${t} must be an object`),!1;let i=!0;return(!Number.isInteger(e.numerator)||Number(e.numerator)<1)&&(n.push(`${t}.numerator must be a positive integer`),i=!1),[1,2,4,8,16,32].includes(Number(e.denominator))||(n.push(`${t}.denominator must be 1, 2, 4, 8, 16, or 32`),i=!1),i}function U(e,t,n,i,r=()=>!0,o="a finite number"){let c=e[t];c!==void 0&&(!V(c)||!r(c))&&i.push(`${n}.${t} must be ${o}`)}function vt(e,t,n){(!Array.isArray(e)||e.some(i=>typeof i!="string"))&&n.push(`${t} must be an array of strings`)}function Sn(e,t,n){let i=`notes[${t}]`;if(!ne(e))return n.push(`${i} must be an object`),!1;(!V(e.at)||e.at<0)&&n.push(`${i}.at must be a non-negative number`),(!V(e.duration)||e.duration<=0)&&n.push(`${i}.duration must be greater than zero`),V(e.pitch)||n.push(`${i}.pitch must be a number`),U(e,"accidental",i,n),U(e,"velocity",i,n,r=>r>=1&&r<=127,"between 1 and 127"),U(e,"velocityOffset",i,n),U(e,"velocityScale",i,n,r=>r>=0,"zero or greater"),U(e,"gate",i,n,r=>r>0,"greater than zero");for(let r of["legato","tie"]){let o=e[r];o!==void 0&&typeof o!="boolean"&&n.push(`${i}.${r} must be a boolean`)}return!0}function Nn(e,t){if(e!==void 0){if(!ne(e)){t.push("velocityCurve must be an object");return}for(let n of["inputMin","inputMax","outputMin","outputMax"])U(e,n,"velocityCurve",t);U(e,"exponent","velocityCurve",t,n=>n>0,"greater than zero")}}function xn(e,t){if(e!==void 0){if(!ne(e)){t.push("metadata must be an object");return}for(let n of["author","source","license"])e[n]!==void 0&&typeof e[n]!="string"&&t.push(`metadata.${n} must be a string`);e.tags!==void 0&&vt(e.tags,"metadata.tags",t),e.suggestedModes!==void 0&&vt(e.suggestedModes,"metadata.suggestedModes",t),U(e,"pickupTicks","metadata",t,n=>n>=0,"zero or greater")}}function Ce(e){let t=[];if(!ne(e))return{valid:!1,errors:["motif must be an object"]};e.schemaVersion!==1&&t.push(`schemaVersion must be ${1}`);for(let n of["id","name","description"])(typeof e[n]!="string"||e[n].trim().length===0)&&t.push(`${n} must be a non-empty string`);if(In(e.pitchMode)||t.push("pitchMode must be scale, chromatic, or hybrid"),_n(e.sourceMeter,"sourceMeter",t),(!V(e.length)||e.length<=0)&&t.push("length must be greater than zero"),U(e,"defaultGate","motif",t,n=>n>0,"greater than zero"),Nn(e.velocityCurve,t),xn(e.metadata,t),!Array.isArray(e.notes)||e.notes.length===0)t.push("notes must be a non-empty array");else{e.notes.forEach((i,r)=>Sn(i,r,t));let n=e.length;V(n)&&e.notes.forEach((i,r)=>{ne(i)&&V(i.at)&&V(i.duration)&&i.at+i.duration>n&&t.push(`notes[${r}] extends beyond motif length`)})}return t.length>0?{valid:!1,errors:t}:{valid:!0,errors:t,motif:e}}function Tn(e,t){let n=t.trim().toLowerCase();return n?[e.id,e.name,e.description,...e.metadata?.tags??[],...e.metadata?.suggestedModes??[]].join(" ").toLowerCase().includes(n):!0}function q(e,t="motif"){return e.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,72)||t}var C,ue,de=class{constructor(){ce(this,C,new Map);ce(this,ue,new Set(qe.map(t=>t.id)));this.resetToBuiltins()}resetToBuiltins(){b(this,C).clear();for(let t of qe)b(this,C).set(t.id,t)}isBuiltin(t){return b(this,ue).has(t)}has(t){return b(this,C).has(t)}uniqueId(t,n){let i=q(t),r=i,o=2;for(;b(this,C).has(r)&&r!==n||b(this,ue).has(r)&&r!==n;)r=`${i}-${o}`,o+=1;return r}add(t){let n=Ce(t);return!n.valid||!n.motif?n.errors:this.isBuiltin(n.motif.id)?[`Cannot overwrite built-in motif: ${n.motif.id}`]:(b(this,C).set(n.motif.id,n.motif),[])}update(t){return this.add(t)}get(t){return b(this,C).get(t)}remove(t){return this.isBuiltin(t)?!1:b(this,C).delete(t)}list(){return[...b(this,C).values()].sort((t,n)=>t.name.localeCompare(n.name)||t.id.localeCompare(n.id))}filter(t){return this.list().filter(n=>Tn(n,t))}cloneAsUser(t,n){let i=b(this,C).get(t);if(!i)return;let r=this.uniqueId(n??q(i.name,`${i.id}-copy`)),o=new Set([...i.metadata?.tags??[],"edited"]),c={...i,id:r,notes:i.notes.map(a=>({...a})),metadata:{...i.metadata,tags:[...o]}};return b(this,C).set(c.id,c),c}setNotes(t,n){let i=b(this,C).get(t);if(!i)return[`Unknown motif: ${t}`];if(n.length===0)return["notes must be a non-empty array"];let r=Math.max(...n.map(o=>o.at+o.duration));return this.update({...i,notes:n,length:r})}};C=new WeakMap,ue=new WeakMap;function Pe(e){return{...e,sourceMeter:{...e.sourceMeter},notes:e.notes.map(t=>({...t})),...e.velocityCurve?{velocityCurve:{...e.velocityCurve}}:{},...e.metadata?{metadata:{...e.metadata,...e.metadata.tags?{tags:[...e.metadata.tags]}:{},...e.metadata.suggestedModes?{suggestedModes:[...e.metadata.suggestedModes]}:{}}}:{}}}var I,Le=class{constructor(){ce(this,I)}snapshot(){let t=b(this,I);return t?{active:!0,dirty:t.dirty,created:t.created,sourceId:t.sourceId,targetId:t.targetId}:{active:!1,dirty:!1,created:!1,sourceId:null,targetId:null}}isEditing(t){return b(this,I)!==void 0&&(t===void 0||b(this,I).targetId===t)}isDirty(){return b(this,I)?.dirty??!1}begin(t,n,i={}){if(b(this,I))return b(this,I).targetId===n?t.get(b(this,I).targetId):void 0;let r=t.get(n);if(r){if(t.isBuiltin(n)){let o=t.uniqueId(i.targetId??q(r.name,`${r.id}-copy`)),c={...Pe(r),id:o,metadata:{...r.metadata,tags:[...new Set([...r.metadata?.tags??[],"edited"])]}};return t.add(c).length>0?void 0:(X(this,I,{sourceId:n,targetId:o,original:Pe(r),created:!0,dirty:i.dirty??!1}),c)}return X(this,I,{sourceId:i.sourceId??n,targetId:n,original:Pe(r),created:i.created??!1,dirty:i.dirty??!1}),r}}markDirty(){b(this,I)&&(b(this,I).dirty=!0)}cancel(t){let n=b(this,I);if(n)return n.created?t.remove(n.targetId):t.update(Pe(n.original)),X(this,I,void 0),n.sourceId}finishSave(){let t=b(this,I)?.targetId;return X(this,I,void 0),t}abandon(){X(this,I,void 0)}};I=new WeakMap;var l=new de,y=new Le,Y=new Map,pe=new Set,G=new Map,le=new Set,Fe=new Set,re="scale-turn",$n=32,Cn=32,Lt=1,v=re,oe,ge=!1,he=!1,Ie="preserve",Ee="replace",D="one-shot",Re="immediate",be="non-triggers",ye=36,Me=84,ie=!1,kt=!1,Pn=1,N="",_e=!1,Se=60,Ot=!1,Ye=1,me="",Z=!1,ae=0,z,L,At,wt=0,It=0,Ln=[.5,1,1.5,2],On=["pitch","accidental","at","duration","gate","velocity","velocityOffset","velocityScale","legato","tie"],ve=512,Je=32,h={tempo:120,rootNote:0,scaleName:"Major",scaleIntervals:[0,2,4,5,7,9,11],scaleMode:!0,timeSignature:{numerator:4,denominator:4},isPlaying:!1,currentSongTime:0},H=new Map,ke=new Set;function Ne(){return{...h,tempo:h.tempo*Ye}}function x(...e){outlet(0,...e)}function g(...e){x("status",...e)}function s(e){x("error",e),error(`Motif: ${e}
`)}function we(){let e=l.list(),t=new Map;for(let n of e)t.set(n.name,(t.get(n.name)??0)+1);return new Map(e.map(n=>[n.id,(t.get(n.name)??0)>1?`${n.name} \xB7 ${n.id}`:n.name]))}function se(e){let t=String(e).trim(),n=l.get(t);if(n)return n;let i=[...we()].find(([,r])=>r===t);return i?l.get(i[0]):l.list().find(r=>r.name===t)}function K(){return l.get(v)}function Ke(e){return yt(e,{invert:ge,reverse:he})}function An(e){return Number.isInteger(e)?String(e):e.toFixed(1).replace(/\.0$/,"")}function fe(e){if(l.isBuiltin(e))return"Built-ins";let t=Y.get(e);if(!t||!N)return"Library";let n=N.replace(/\\/g,"/").replace(/\/+$/,""),i=t.replace(/\\/g,"/"),r=`${n}/`;if(!i.toLowerCase().startsWith(r.toLowerCase()))return"Library";let o=i.slice(r.length),c=o.lastIndexOf("/");return c<0?"Library":o.slice(0,c)}function _t(e){return[...G].filter(([,t])=>t.motifId===e).map(([t,n])=>({pitch:t,action:n.action})).sort((t,n)=>t.pitch-n.pitch)}function En(e){return{pitch:e.pitch,accidental:e.accidental??null,at:e.at,duration:e.duration,gate:e.gate??null,velocity:e.velocity??null,velocityOffset:e.velocityOffset??null,velocityScale:e.velocityScale??null,legato:e.legato??!1,tie:e.tie??!1}}function m(){let e=me.trim().toLowerCase(),t=new Set(l.filter(me).map(d=>d.id)),n=l.list().filter(d=>!e||t.has(d.id)||fe(d.id).toLowerCase().includes(e)).sort((d,u)=>fe(d.id).localeCompare(fe(u.id))||d.name.localeCompare(u.name)||d.id.localeCompare(u.id)),i=K(),r=i?n.findIndex(d=>d.id===i.id):-1,o=new Map;for(let d of n)o.set(d.name,(o.get(d.name)??0)+1);let c=null,a;if(i){let d=i.notes.map(En);d.length>Je&&(It+=1,a={id:It,motifId:i.id,notes:d});let u=Ve(Ke(i),Ne(),Se,oe,Ie),M=`${i.sourceMeter.numerator}/${i.sourceMeter.denominator}`,T=i.metadata?.tags?.join(" \xB7 ")??"custom motif",$=i.metadata?.suggestedModes?.join(", "),E=$?`${T}  \u2022  suggested: ${$}`:T,A=`${An(u.bars)} ${u.bars===1?"bar":"bars"}`,p=`${u.notes.length} notes  \u2022  ${A}  \u2022  ${M} source  \u2022  ${u.effectivePitchMode}`;c={schemaVersion:i.schemaVersion,id:i.id,name:i.name,description:i.description??"",pitchMode:i.pitchMode,sourceMeter:{...i.sourceMeter},length:i.length,defaultGate:i.defaultGate??null,velocityCurve:{inputMin:i.velocityCurve?.inputMin??null,inputMax:i.velocityCurve?.inputMax??null,outputMin:i.velocityCurve?.outputMin??null,outputMax:i.velocityCurve?.outputMax??null,exponent:i.velocityCurve?.exponent??null},metadata:{author:i.metadata?.author??"",source:i.metadata?.source??"",license:i.metadata?.license??"",tags:[...i.metadata?.tags??[]],suggestedModes:[...i.metadata?.suggestedModes??[]],pickupTicks:i.metadata?.pickupTicks??null},stats:p,tags:E,isBuiltin:l.isBuiltin(i.id),isPersisted:Y.has(i.id),folder:fe(i.id),hotkeys:_t(i.id),noteCount:i.notes.length,noteLimit:ve,noteTransferId:a?.id??null,notesLoading:!!a,notes:a?[]:d}}let f={query:me,items:n.map(d=>({id:d.id,name:d.name,showId:(o.get(d.name)??0)>1,folder:fe(d.id),hotkeys:_t(d.id)})),selectedIndex:r,selected:c,editing:y.snapshot(),libraryPath:N,libraryLoaded:_e,libraryScanning:Z,alert:At??null,scanProgress:z?{processedEntries:z.processedEntries,loadedMotifs:z.loadedMotifs}:null};if(x("ui","lib",encodeURIComponent(JSON.stringify(f))),a)for(let d=0;d<a.notes.length;d+=Je)x("ui","lib",encodeURIComponent(JSON.stringify({kind:"note-chunk",transferId:a.id,motifId:a.motifId,offset:d,total:a.notes.length,notes:a.notes.slice(d,d+Je)})))}function Fn(e,t){wt+=1,At={id:wt,title:e,message:t},s(t),m()}function Et(){let e=K();if(!e)return;let t=Ve(Ke(e),Ne(),Se,oe,Ie),n=t.notes.reduce((r,o)=>Math.max(r,o.atTicks+o.durationTicks),1),i={notes:t.notes.map(r=>({pitch:r.pitch,atTicks:r.atTicks,durationTicks:r.durationTicks})),totalTicks:n,lowPitch:t.lowPitch,highPitch:t.highPitch,noteNames:t.noteNames.join("  \xB7  ")};x("ui","preview",encodeURIComponent(JSON.stringify(i)))}function _(){m(),Et()}function xe(e){let t=[];for(let n of e)Array.isArray(n)?t.push(...n):t.push(n);return t}function P(e,t=""){return typeof e=="string"?e:typeof e=="number"||typeof e=="boolean"?String(e):t}function Rn(e){return xe(e).map(Number).filter(Number.isFinite)}function Te(){x("clear"),x("panic"),le.clear(),Fe.clear()}function Dn(e,t){let n=Rn(t);switch(e){case"tempo":{let i=n[0];i!==void 0&&i>0&&(h.tempo=i);break}case"root_note":{let i=n[0];i!==void 0&&(h.rootNote=Math.round(i),Ot||(Se=60+h.rootNote),_());break}case"scale_mode":{h.scaleMode=(n[0]??0)!==0,_();break}case"scale_intervals":{n.length>0&&(h.scaleIntervals=n.map(Math.round),_());break}case"scale_name":{let i=xe(t).map(String).join(" ").trim();i&&(h.scaleName=i,_());break}case"signature_numerator":{let i=n[0];i!==void 0&&i>0&&(h.timeSignature.numerator=Math.round(i),_());break}case"signature_denominator":{let i=n[0];i!==void 0&&i>0&&(h.timeSignature.denominator=Math.round(i),_());break}case"is_playing":{let i=h.isPlaying;h.isPlaying=(n[0]??0)!==0,i&&!h.isPlaying&&(et(),Te());break}case"current_song_time":{let i=n[0];i!==void 0&&i>=0&&(h.currentSongTime=i);break}default:s(`Unknown Song property: ${e}`);return}}function zn(e,...t){Dn(String(e),t)}function Xe(){l.get(v)||(v=l.list()[0]?.id??re)}function O(){Xe();let e=we();x("motifs-reset");for(let t of l.list())x("motif-item",e.get(t.id)??t.name);x("motif-selected",e.get(v)??K()?.name??v),_()}function Ft(){x("midi-pass",be==="none"?0:1)}function Bn(){kt||(kt=!0,g("Ready"),Ft()),O(),tt()}function jn(){Et()}function Un(){m()}function Rt(e,t){let n=e.endsWith("/")||e.endsWith(":")?"":"/";return`${e}${n}${t}`}function Hn(e,t){for(let i=0;i<t.length;i+=8192)e.writestring(t.slice(i,i+8192))}function Gn(){let e="Tempfolder:/uttori-motif-library-ce085acf5373.html",t;try{if(t=new File(e,"write"),!t.isopen)throw new Error(`could not create ${e}`);t.eof=0,t.position=0,Hn(t,`<!DOCTYPE html>
<!--
  Max jweb bridge documentation:
  https://docs.cycling74.com/reference/jweb/
  https://docs.cycling74.com/userguide/web_browser/#javascript-communication
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Motif Library</title>
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root {
      --bg:#141415; --surface:#1c1c1e; --surface2:#18181a; --border:#2e2e32;
      --accent:#ff8c1f; --text:#e0e0e6; --muted:#7a7a82; --input:#0e0e10;
      --btn:#2a2a2e; --btn-hover:#363638; --danger:#d55549; --note-alt:#1a1a1c;
    }
    html, body { height:100%; background:var(--bg); color:var(--text); font:11px "Ableton Sans",system-ui,-apple-system,sans-serif; overflow:hidden; }
    button, input, textarea, select { font:inherit; }
    button:disabled, input:disabled, textarea:disabled, select:disabled { opacity:.42; cursor:not-allowed !important; }
    .hidden { display:none !important; }
    #app { display:flex; height:calc(100% - 20px); }
    #left { width:clamp(170px,30vw,240px); min-width:150px; flex-shrink:0; display:flex; flex-direction:column; border-right:1px solid var(--border); }
    #right { flex:1; min-width:0; display:flex; flex-direction:column; }
    #search-row { display:flex; align-items:center; gap:4px; padding:6px 6px 4px; }
    #search { flex:1; min-width:0; background:var(--input); border:1px solid var(--border); color:var(--text); padding:3px 6px; outline:none; }
    #clear-search { background:none; border:0; color:var(--muted); cursor:pointer; font-size:13px; padding:0 2px; }
    #browser-list { flex:1; overflow-y:auto; border-top:1px solid var(--border); }
    .browser-folder { position:sticky; top:0; z-index:1; width:100%; padding:4px 8px 3px; background:var(--surface2); border:0; border-bottom:1px solid var(--border); color:var(--muted); cursor:pointer; font-size:9px; font-weight:600; text-align:left; text-transform:uppercase; letter-spacing:.05em; }
    .browser-folder:hover { background:var(--btn); color:var(--text); }
    .browser-item { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2px 5px; padding:5px 8px; cursor:pointer; border-bottom:1px solid transparent; }
    .browser-item:hover { background:var(--btn); }
    .browser-item.selected { background:var(--accent); color:#000; }
    .browser-name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .browser-id { grid-column:1 / -1; margin-top:1px; color:var(--muted); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .hotkey-badge { align-self:center; color:var(--accent); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; }
    .browser-item.selected .browser-id { color:rgba(0,0,0,.62); }
    .browser-item.selected .hotkey-badge { color:#000; }
    #empty-list { padding:12px 8px; color:var(--muted); text-align:center; }
    #browser-actions { border-top:1px solid var(--border); display:flex; gap:4px; padding:5px; }
    #library-path { padding:0 6px 5px; color:var(--muted); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .btn { background:var(--btn); border:1px solid var(--border); color:var(--text); cursor:pointer; padding:3px 7px; text-align:center; white-space:nowrap; }
    .btn:hover:not(:disabled) { background:var(--btn-hover); }
    .btn:active:not(:disabled), .btn.accent { background:var(--accent); color:#000; border-color:transparent; }
    #meta { padding:6px 8px 4px; border-bottom:1px solid var(--border); display:flex; flex-direction:column; gap:3px; }
    #meta-row-1 { display:flex; align-items:center; gap:4px; }
    #name-edit { flex:1; min-width:0; font-size:12px; font-weight:600; }
    .field { background:var(--input); border:1px solid var(--border); color:var(--text); padding:3px 5px; outline:none; min-width:0; }
    .field:focus { border-color:var(--accent); }
    .field[readonly], .field:disabled { background:transparent; border-color:transparent; color:var(--muted); }
    #description-edit { resize:none; height:34px; width:100%; }
    #stats-line { color:var(--muted); font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #edit-state { color:var(--accent); font-size:10px; min-height:12px; }
    #detail-actions { display:flex; gap:4px; padding:4px 8px; border-bottom:1px solid var(--border); }
    #detail-actions .btn { flex:1; }
    #import-mode { width:104px; flex:0 0 auto; }
    #panel-tabs { display:flex; border-bottom:1px solid var(--border); background:var(--surface2); }
    .panel-tab { flex:1; border:0; border-right:1px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; padding:4px 8px; }
    .panel-tab:last-child { border-right:0; }
    .panel-tab.active { background:var(--surface); color:var(--text); box-shadow:inset 0 -2px var(--accent); }
    .panel { flex:1; min-height:0; overflow:auto; }
    #properties-panel { padding:7px 8px 12px; }
    .section { margin-bottom:9px; }
    .section-title { color:var(--muted); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
    .property-grid { display:grid; grid-template-columns:92px minmax(0,1fr) 92px minmax(0,1fr); gap:4px 6px; align-items:center; }
    .property-grid .wide { grid-column:2 / 5; }
    .property-grid label { color:var(--muted); font-size:10px; text-align:right; }
    .property-grid input, .property-grid select, .property-grid textarea { width:100%; }
    .property-grid textarea { min-height:38px; resize:vertical; }
    .identity { font:9px ui-monospace,SFMono-Regular,Menlo,monospace; }
    .help { grid-column:2 / 5; color:var(--muted); font-size:9px; line-height:1.25; }
    #hotkey-controls { display:flex; gap:4px; }
    #hotkey-input { width:72px; }
    #hotkey-action { width:112px; }
    #hotkey-list { display:flex; flex-wrap:wrap; gap:4px; }
    .hotkey-chip { background:var(--btn); border:1px solid var(--border); color:var(--text); cursor:pointer; padding:2px 5px; }
    .hotkey-chip:hover { background:var(--danger); border-color:var(--danger); color:#fff; }
    #notes-panel { overflow:auto; }
    #note-table { min-width:780px; display:flex; flex-direction:column; min-height:100%; }
    #note-header, .note-row { display:grid; grid-template-columns:28px 48px 38px 48px 54px 44px 48px 50px 50px 42px 42px 26px; }
    #note-header { position:sticky; top:0; z-index:2; background:var(--surface); border-bottom:1px solid var(--border); color:var(--muted); font-size:9px; font-weight:600; }
    #note-header span { padding:3px 2px; text-align:right; border-right:1px solid var(--border); }
    #note-header span:first-child, #note-header span:nth-last-child(-n+3) { text-align:center; }
    #note-rows { flex:1; }
    .note-row { border-bottom:1px solid var(--border); align-items:center; }
    .note-row:nth-child(even) { background:var(--note-alt); }
    .note-row > span { color:var(--muted); font-size:10px; text-align:center; padding:2px; }
    .note-row input[type="number"] { background:transparent; border:0; border-left:1px solid var(--border); color:var(--text); font-size:10px; padding:2px 3px; text-align:right; width:100%; outline:none; -moz-appearance:textfield; }
    .note-row input[type="number"]::-webkit-inner-spin-button, .note-row input[type="number"]::-webkit-outer-spin-button { display:none; }
    .note-row input[type="number"]:focus { background:var(--input); }
    .check-cell { display:flex; justify-content:center; border-left:1px solid var(--border); }
    .check-cell input { accent-color:var(--accent); }
    .remove-btn { background:none; border:0; border-left:1px solid var(--border); color:var(--danger); cursor:pointer; font-size:13px; width:100%; height:100%; }
    .remove-btn:hover:not(:disabled) { background:var(--danger); color:#fff; }
    #add-row { position:sticky; bottom:0; border-top:1px solid var(--border); padding:4px 8px; background:var(--bg); }
    #add-note-btn { width:100%; }
    #modal-backdrop { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.68); }
    #modal { width:330px; max-width:calc(100% - 32px); background:var(--surface); border:1px solid #4a4a50; box-shadow:0 12px 40px rgba(0,0,0,.55); padding:12px; }
    #modal-title { font-size:13px; margin-bottom:7px; }
    #modal-message { color:var(--muted); line-height:1.4; white-space:pre-wrap; }
    #modal-actions { display:flex; justify-content:flex-end; gap:6px; margin-top:12px; }
    #debug-bar { position:fixed; left:0; right:0; bottom:0; height:20px; z-index:30; display:flex; align-items:center; gap:5px; padding:0 6px; border-top:1px solid var(--border); background:#101012; color:var(--muted); font-size:9px; }
    #debug-indicator { color:#b0a050; } #debug-indicator.ok { color:#70c070; } #debug-indicator.error { color:#ff7066; }
    #debug-summary { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #debug-toggle { border:0; background:transparent; color:var(--muted); cursor:pointer; }
    #debug-panel { position:fixed; left:0; right:0; bottom:20px; z-index:29; display:none; max-height:160px; overflow:auto; padding:6px; border-top:1px solid var(--border); background:rgba(8,8,9,.97); color:#c8c8ce; font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:pre-wrap; user-select:text; }
    #debug-panel.open { display:block; } #debug-panel.has-error { color:#ff8b82; }
    @media (max-width:520px) {
      #app { flex-direction:column; }
      #left { width:100%; min-width:0; height:140px; border-right:0; border-bottom:1px solid var(--border); }
      #right { min-height:0; }
      .property-grid { grid-template-columns:80px minmax(0,1fr); }
      .property-grid .wide { grid-column:2; }
      .help { grid-column:1 / -1; }
    }
  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #7a7a82 #141415;
  }
  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 16px;
  }
  *::-webkit-scrollbar-track {
    background: #141415;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #7a7a82;
    border-radius: 10px;
    border: 3px none #000000;
  }
  </style>
</head>
<body>
<div id="app">
  <div id="left">
    <div id="search-row">
      <input id="search" type="text" placeholder="Search\u2026" autocomplete="off" spellcheck="false">
      <button id="clear-search" title="Clear search">\u2715</button>
    </div>
    <div id="browser-list"></div>
    <div id="browser-actions">
      <button class="btn" id="choose-btn" title="Choose and remember a library folder">Choose</button>
      <button class="btn" id="refresh-btn" title="Reload the chosen library folder">Refresh</button>
    </div>
    <div id="library-path" title="No user library selected">Built-ins only</div>
  </div>

  <div id="right">
    <div id="meta">
      <div id="meta-row-1">
        <input class="field" id="name-edit" type="text" placeholder="(no motif selected)" readonly>
        <button class="btn" id="edit-btn">Edit</button>
        <button class="btn hidden" id="cancel-edit-btn">Cancel Edit</button>
      </div>
      <textarea class="field" id="description-edit" placeholder="Description" readonly></textarea>
      <div id="stats-line">\u2013</div>
      <div id="edit-state"></div>
    </div>

    <div id="detail-actions">
      <select class="field" id="import-mode" title="Chromatic preserves the MIDI exactly; Scale and Hybrid encode relative scale degrees">
        <option value="chromatic">Exact / Chromatic</option>
        <option value="hybrid">Hybrid</option>
        <option value="scale">Scale</option>
      </select>
      <button class="btn accent" id="import-clip-btn">Import Clip</button>
      <button class="btn" id="save-motif-btn">Save &amp; Finish</button>
    </div>

    <div id="panel-tabs">
      <button class="panel-tab active" data-panel="properties">Properties</button>
      <button class="panel-tab" data-panel="notes">Notes</button>
    </div>

    <div class="panel" id="properties-panel">
      <div class="section">
        <div class="section-title">Identity</div>
        <div class="property-grid">
          <label for="id-display">ID</label><input class="field identity" id="id-display" readonly>
          <label for="schema-display">Schema</label><input class="field identity" id="schema-display" readonly>
          <label for="length-display">Length</label><input class="field identity" id="length-display" readonly>
          <div class="help">ID is generated once and remains stable. Length is recalculated from the final note end.</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">MIDI Hot Keys</div>
        <div class="property-grid">
          <label for="hotkey-input">Trigger note</label>
          <div class="wide" id="hotkey-controls">
            <input class="field identity" id="hotkey-input" type="text" value="C1" placeholder="C3" autocomplete="off" spellcheck="false">
            <select class="field" id="hotkey-action">
              <option value="trigger">Trigger Motif</option>
              <option value="select">Select Motif</option>
            </select>
            <button class="btn" id="assign-hotkey-btn">Assign to Motif</button>
          </div>
          <label>Assigned</label><div class="wide" id="hotkey-list"></div>
          <div class="help">Trigger Motif plays this motif using the device\u2019s current Trigger Mode. Select Motif makes it active for later trigger-zone notes. Enter a note name such as C3, F\u266F2, or Bb4; click an assignment to remove it.</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Pitch &amp; Timing</div>
        <div class="property-grid">
          <label for="pitch-mode-edit">Pitch mode</label>
          <select class="field editable-property" id="pitch-mode-edit" disabled>
            <option value="scale">Scale</option><option value="chromatic">Chromatic</option><option value="hybrid">Hybrid</option>
          </select>
          <label for="default-gate-edit">Default gate</label><input class="field editable-property" id="default-gate-edit" type="number" min="0.01" step="0.01" placeholder="1" disabled>
          <label for="meter-numerator-edit">Source meter</label>
          <div style="display:flex;gap:4px">
            <input class="field editable-property" id="meter-numerator-edit" type="number" min="1" step="1" disabled>
            <select class="field editable-property" id="meter-denominator-edit" disabled>
              <option>1</option><option>2</option><option>4</option><option>8</option><option>16</option><option>32</option>
            </select>
          </div>
          <label for="pickup-ticks-edit">Pickup ticks</label><input class="field editable-property" id="pickup-ticks-edit" type="number" min="0" step="1" placeholder="0" disabled>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Velocity Curve</div>
        <div class="property-grid">
          <label for="curve-input-min">Input min</label><input class="field editable-property" id="curve-input-min" type="number" placeholder="default" disabled>
          <label for="curve-input-max">Input max</label><input class="field editable-property" id="curve-input-max" type="number" placeholder="default" disabled>
          <label for="curve-output-min">Output min</label><input class="field editable-property" id="curve-output-min" type="number" placeholder="default" disabled>
          <label for="curve-output-max">Output max</label><input class="field editable-property" id="curve-output-max" type="number" placeholder="default" disabled>
          <label for="curve-exponent">Exponent</label><input class="field editable-property" id="curve-exponent" type="number" min="0.01" step="0.01" placeholder="1" disabled>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Metadata</div>
        <div class="property-grid">
          <label for="author-edit">Author</label><input class="field editable-property wide" id="author-edit" type="text" disabled>
          <label for="source-edit">Source</label><input class="field editable-property wide" id="source-edit" type="text" disabled>
          <label for="license-edit">License</label><textarea class="field editable-property wide" id="license-edit" disabled></textarea>
          <label for="tags-edit">Tags</label><input class="field editable-property wide" id="tags-edit" type="text" placeholder="comma-separated" disabled>
          <label for="suggested-modes-edit">Suggested modes</label><input class="field editable-property wide" id="suggested-modes-edit" type="text" placeholder="comma-separated" disabled>
        </div>
      </div>
    </div>

    <div class="panel hidden" id="notes-panel">
      <div id="note-table">
        <div id="note-header">
          <span>#</span><span>Pitch</span><span>Acc</span><span>Start</span><span>Duration</span><span>Gate</span><span>Vel</span><span>Vel +</span><span>Vel \xD7</span><span>Legato</span><span>Tie</span><span></span>
        </div>
        <div id="note-rows"></div>
        <div id="add-row"><button class="btn" id="add-note-btn">+ Add Note</button></div>
      </div>
    </div>
  </div>
</div>

<div id="modal-backdrop" class="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div id="modal">
    <div id="modal-title"></div>
    <div id="modal-message"></div>
    <div id="modal-actions">
      <button class="btn" id="modal-cancel">Cancel</button>
      <button class="btn" id="modal-confirm">Continue</button>
    </div>
  </div>
</div>

<div id="debug-panel" aria-live="polite"></div>
<div id="debug-bar">
  <span id="debug-indicator">\u25CF</span><span id="debug-summary">Loading jweb bridge\u2026</span>
  <button id="debug-toggle" type="button">Debug</button>
</div>

<script>
  /** Diagnostic source label forwarded to the Max console. */
  const PAGE = 'library';
  /** Maximum number of notes allowed in one motif or Live clip import. */
  const MAX_MOTIF_NOTES = 512;
  /** Editable note schema used to generate rows and coerce outgoing field values. */
  const NOTE_FIELDS = [
    { name:'pitch', type:'number', required:true, step:'1' },
    { name:'accidental', type:'number', step:'1' },
    { name:'at', type:'number', required:true, min:'0', step:'1' },
    { name:'duration', type:'number', required:true, min:'1', step:'1' },
    { name:'gate', type:'number', min:'0.01', step:'0.01' },
    { name:'velocity', type:'number', min:'1', max:'127', step:'1' },
    { name:'velocityOffset', type:'number', step:'1' },
    { name:'velocityScale', type:'number', min:'0', step:'0.01' },
    { name:'legato', type:'checkbox' },
    { name:'tie', type:'checkbox' },
  ];
  /** Motif property controls that participate in dirty-state and edit-message handling. */
  const PROPERTY_INPUT_IDS = [
    'name-edit','description-edit','pitch-mode-edit','default-gate-edit','meter-numerator-edit',
    'meter-denominator-edit','pickup-ticks-edit','curve-input-min','curve-input-max',
    'curve-output-min','curve-output-max','curve-exponent','author-edit','source-edit',
    'license-edit','tags-edit','suggested-modes-edit',
  ];
  /** Whether the page is running inside Max's jweb bridge instead of a normal browser. */
  const isMax = typeof window.max !== 'undefined' && typeof window.max.outlet === 'function';

  if (!isMax) {
    const browserInlets = new Map();
    window.max = {
      outlet: (...args) => console.log('\u2192 Max:', ...args),
      bindInlet: (name, handler) => browserInlets.set(name, handler),
    };
    window.__motifBrowserInlets = browserInlets;
  }

  function createStore(initialState) {
    let current = initialState;
    const subscribers = new Set();
    return {
      getState: () => current,
      setState(update) {
        current = typeof update === 'function' ? update(current) : { ...current, ...update };
        for (const subscriber of subscribers) subscriber(current);
      },
      subscribe(subscriber) {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
      },
    };
  }

  const store = createStore({
    server:null,
    modal:null,
    formDirty:false,
    activePanel:'properties',
    collapsedFolders:new Set(),
  });
  const debugEntries = [];
  let stateDeadline = null;
  let payloadErrorSignature = '';
  let pendingNoteTransfer = null;
  const debugIndicator = document.getElementById('debug-indicator');
  const debugSummary = document.getElementById('debug-summary');
  const debugPanel = document.getElementById('debug-panel');

  function errorText(reason) { return reason instanceof Error ? \`\${reason.name}: \${reason.message}\` : String(reason); }
  function debug(level, message) {
    const line = \`\${new Date().toLocaleTimeString()} [\${level}] \${message}\`;
    debugEntries.push(line);
    if (debugEntries.length > 80) debugEntries.shift();
    debugSummary.textContent = message;
    debugIndicator.className = level === 'error' ? 'error' : level === 'ok' ? 'ok' : '';
    debugPanel.classList.toggle('has-error', debugEntries.some((entry) => entry.includes('[error]')));
    debugPanel.textContent = debugEntries.join('\\n');
    if (isMax) window.max.outlet('web_debug', PAGE, level, encodeURIComponent(message));
  }

  window.addEventListener('error', (event) => debug('error', \`\${event.message} @ \${event.filename}:\${event.lineno}\`));
  window.addEventListener('unhandledrejection', (event) => debug('error', \`Unhandled promise: \${errorText(event.reason)}\`));
  document.getElementById('debug-toggle').addEventListener('click', () => debugPanel.classList.toggle('open'));

  function send(action) {
    try {
      window.max.outlet('lib_action', encodeURIComponent(JSON.stringify(action)));
      debug('info', \`Action: \${action.type}\`);
    } catch (reason) {
      debug('error', \`Action failed: \${errorText(reason)}\`);
    }
  }

  function selectedIsEditing(server) {
    return Boolean(server?.selected && server.editing?.active && server.editing.targetId === server.selected.id);
  }

  function hasUnsavedChanges() {
    const current = store.getState();
    return Boolean(current.formDirty || current.server?.editing?.dirty);
  }

  function openModal(options) { store.setState({ modal:options }); }
  function closeModal() { store.setState({ modal:null }); }
  function confirmDiscard(onConfirm, message = 'Discard the unsaved changes to this motif?') {
    if (!hasUnsavedChanges()) { onConfirm(); return; }
    openModal({ title:'Discard unsaved changes?', message, confirmLabel:'Discard', onConfirm });
  }

  function renderModal(modal) {
    const backdrop = document.getElementById('modal-backdrop');
    if (!modal) { backdrop.classList.add('hidden'); return; }
    backdrop.classList.remove('hidden');
    document.getElementById('modal-title').textContent = modal.title;
    document.getElementById('modal-message').textContent = modal.message;
    document.getElementById('modal-confirm').textContent = modal.confirmLabel ?? 'Continue';
    document.getElementById('modal-cancel').classList.toggle('hidden', Boolean(modal.dismissOnly));
  }

  function isFolderCollapsed(folder, query, collapsedFolders) {
    return !query && collapsedFolders.has(folder);
  }

  function toggleCollapsedFolder(folder, collapsedFolders) {
    const next = new Set(collapsedFolders);
    if (next.has(folder)) next.delete(folder);
    else next.add(folder);
    return next;
  }

  function renderBrowser(server) {
    const list = document.getElementById('browser-list');
    list.innerHTML = '';
    if (!server || server.items.length === 0) {
      const empty = document.createElement('div');
      empty.id = 'empty-list';
      empty.textContent = server?.query ? 'No matching motifs' : 'No motifs found';
      list.append(empty);
      return;
    }
    let currentFolder = null;
    let folderCollapsed = false;
    const collapsedFolders = store.getState().collapsedFolders;
    for (const item of server.items) {
      const folder = item.folder || 'Library';
      if (folder !== currentFolder) {
        currentFolder = folder;
        folderCollapsed = isFolderCollapsed(folder, server.query, collapsedFolders);
        const heading = document.createElement('button');
        heading.type = 'button';
        heading.className = 'browser-folder';
        heading.textContent = \`\${folderCollapsed ? '\u25B8' : '\u25BE'} \${folder}\`;
        heading.setAttribute('aria-expanded', String(!folderCollapsed));
        heading.title = \`\${folderCollapsed ? 'Expand' : 'Collapse'} \${folder}\`;
        heading.addEventListener('click', () => {
          store.setState({
            collapsedFolders:toggleCollapsedFolder(folder, store.getState().collapsedFolders),
          });
        });
        list.append(heading);
      }
      if (folderCollapsed) continue;
      const el = document.createElement('div');
      el.className = \`browser-item\${server.selected?.id === item.id ? ' selected' : ''}\`;
      const name = document.createElement('div');
      name.className = 'browser-name';
      name.textContent = item.name;
      el.append(name);
      if (Array.isArray(item.hotkeys) && item.hotkeys.length > 0) {
        const badge = document.createElement('div');
        badge.className = 'hotkey-badge';
        badge.textContent = item.hotkeys
          .map((mapping) => \`\${midiNoteName(mapping.pitch)} \${mapping.action === 'select' ? '\u21A6' : '\u25B6'}\`)
          .join(' ');
        el.append(badge);
      }
      if (item.showId) {
        const id = document.createElement('div');
        id.className = 'browser-id';
        id.textContent = item.id;
        el.append(id);
      }
      el.title = item.showId ? \`\${item.name}\\nID: \${item.id}\` : item.name;
      el.addEventListener('click', () => {
        if (server.selected?.id === item.id) return;
        confirmDiscard(() => send({ type:'select_browser', id:item.id, discardChanges:true }));
      });
      list.append(el);
    }
  }

  function midiNoteName(pitch) {
    const names = ['C','C\u266F','D','D\u266F','E','F','F\u266F','G','G\u266F','A','A\u266F','B'];
    const value = Math.max(0, Math.min(127, Math.round(Number(pitch))));
    return \`\${names[value % 12]}\${Math.floor(value / 12) - 2}\`;
  }

  function parseMidiNoteName(noteName) {
    const match = String(noteName).trim().match(/^([A-Ga-g])([#\u266Fb\u266D]?)(-2|-1|[0-8])$/);
    if (!match) return null;
    const pitchClasses = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
    const accidental = match[2] === '#' || match[2] === '\u266F' ? 1 : match[2] === 'b' || match[2] === '\u266D' ? -1 : 0;
    const pitch = (Number(match[3]) + 2) * 12 + pitchClasses[match[1].toUpperCase()] + accidental;
    return pitch >= 0 && pitch <= 127 ? pitch : null;
  }

  function renderHotkeys(selected) {
    const input = document.getElementById('hotkey-input');
    const action = document.getElementById('hotkey-action');
    const assign = document.getElementById('assign-hotkey-btn');
    const list = document.getElementById('hotkey-list');
    const mappings = Array.isArray(selected?.hotkeys) ? selected.hotkeys : [];
    input.disabled = !selected;
    action.disabled = !selected;
    assign.disabled = !selected;
    list.innerHTML = '';
    if (!selected) return;
    if (mappings.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'help';
      empty.textContent = 'None';
      list.append(empty);
      return;
    }
    for (const mapping of mappings) {
      const chip = document.createElement('button');
      chip.className = 'hotkey-chip';
      const actionLabel = mapping.action === 'select' ? 'Select' : 'Trigger';
      chip.title = \`Remove \${midiNoteName(mapping.pitch)} \xB7 \${actionLabel}\`;
      chip.textContent = \`\${midiNoteName(mapping.pitch)} \xB7 \${actionLabel}  \xD7\`;
      chip.addEventListener('click', () => send({ type:'unmap_trigger', pitch:mapping.pitch }));
      list.append(chip);
    }
  }

  function renderNoteRows(server, editing) {
    const notes = server?.selected?.notes ?? [];
    const noteCount = Number(server?.selected?.noteCount ?? notes.length);
    const container = document.getElementById('note-rows');
    container.innerHTML = '';
    notes.forEach((note, index) => {
      const row = document.createElement('div');
      row.className = 'note-row';
      const label = document.createElement('span');
      label.textContent = String(index + 1);
      row.append(label);
      for (const field of NOTE_FIELDS) {
        if (field.type === 'checkbox') {
          const cell = document.createElement('label');
          cell.className = 'check-cell';
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = Boolean(note[field.name]);
          input.disabled = !editing;
          input.addEventListener('change', () => send({
            type:'edit_note_at',
            index,
            field:field.name,
            value:input.checked,
          }));
          cell.append(input);
          row.append(cell);
          continue;
        }
        const input = document.createElement('input');
        input.type = 'number';
        input.value = note[field.name] == null ? '' : String(note[field.name]);
        input.disabled = !editing;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        input.addEventListener('change', () => {
          const value = input.value === '' ? null : Number(input.value);
          if (value !== null && !Number.isFinite(value)) return;
          send({ type:'edit_note_at', index, field:field.name, value });
        });
        row.append(input);
      }
      const remove = document.createElement('button');
      remove.className = 'remove-btn';
      remove.textContent = '\u2715';
      remove.title = 'Remove note';
      remove.disabled = !editing || noteCount <= 1;
      remove.addEventListener('click', () => send({ type:'remove_note', index }));
      row.append(remove);
      container.append(row);
    });
  }

  function setValue(id, value, editing) {
    const input = document.getElementById(id);
    if (document.activeElement === input && editing) return;
    input.value = value == null ? '' : String(value);
  }

  function setEditable(editing) {
    for (const id of PROPERTY_INPUT_IDS) {
      const input = document.getElementById(id);
      if (id === 'name-edit' || id === 'description-edit') input.readOnly = !editing;
      else input.disabled = !editing;
    }
  }

  function renderProperties(selected, editing) {
    const curve = selected?.velocityCurve ?? {};
    const metadata = selected?.metadata ?? {};
    setValue('id-display', selected?.id ?? '', false);
    setValue('schema-display', selected ? \`v\${selected.schemaVersion}\` : '', false);
    setValue('length-display', selected ? \`\${selected.length} ticks\` : '', false);
    setValue('pitch-mode-edit', selected?.pitchMode ?? 'scale', editing);
    setValue('default-gate-edit', selected?.defaultGate, editing);
    setValue('meter-numerator-edit', selected?.sourceMeter?.numerator ?? '', editing);
    setValue('meter-denominator-edit', selected?.sourceMeter?.denominator ?? 4, editing);
    setValue('pickup-ticks-edit', metadata.pickupTicks, editing);
    setValue('curve-input-min', curve.inputMin, editing);
    setValue('curve-input-max', curve.inputMax, editing);
    setValue('curve-output-min', curve.outputMin, editing);
    setValue('curve-output-max', curve.outputMax, editing);
    setValue('curve-exponent', curve.exponent, editing);
    setValue('author-edit', metadata.author ?? '', editing);
    setValue('source-edit', metadata.source ?? '', editing);
    setValue('license-edit', metadata.license ?? '', editing);
    setValue('tags-edit', Array.isArray(metadata.tags) ? metadata.tags.join(', ') : '', editing);
    setValue('suggested-modes-edit', Array.isArray(metadata.suggestedModes) ? metadata.suggestedModes.join(', ') : '', editing);
  }

  function renderDetail(server, local) {
    const selected = server?.selected ?? null;
    const editing = selectedIsEditing(server);
    const edit = document.getElementById('edit-btn');
    const cancel = document.getElementById('cancel-edit-btn');
    const save = document.getElementById('save-motif-btn');
    const add = document.getElementById('add-note-btn');

    if (!selected) {
      setValue('name-edit', '', false); setValue('description-edit', '', false);
      setEditable(false); renderProperties(null, false);
      document.getElementById('stats-line').textContent = '\u2013';
      document.getElementById('edit-state').textContent = '';
      edit.disabled = true; cancel.classList.add('hidden'); save.disabled = true; add.disabled = true;
      renderNoteRows(server, false);
      renderHotkeys(null);
      return;
    }

    setValue('name-edit', selected.name, editing);
    setValue('description-edit', selected.description ?? '', editing);
    setEditable(editing);
    renderProperties(selected, editing);
    document.getElementById('stats-line').textContent = selected.stats ?? '';
    document.getElementById('edit-state').textContent = editing
      ? \`\${server.editing.dirty || local.formDirty ? 'Unsaved changes' : 'Editing'} \xB7 \${selected.id}\`
      : selected.isBuiltin
        ? 'Built-in \xB7 Edit creates a user copy'
        : \`\${selected.isPersisted ? 'Saved' : 'Not yet saved'} \xB7 \${selected.id}\`;
    edit.classList.toggle('hidden', editing);
    edit.disabled = Boolean(server.libraryScanning);
    cancel.classList.toggle('hidden', !editing);
    cancel.disabled = false;
    save.disabled = !editing || !server.libraryLoaded;
    save.title = server.libraryLoaded ? 'Save changes and exit editing' : 'Choose a valid library folder before saving';
    add.disabled = !editing
      || Boolean(selected.notesLoading)
      || selected.noteCount >= (selected.noteLimit ?? MAX_MOTIF_NOTES);
    renderNoteRows(server, editing);
    renderHotkeys(selected);
    document.getElementById('import-clip-btn').disabled = Boolean(server.libraryScanning);
  }

  function renderPanels(activePanel) {
    document.getElementById('properties-panel').classList.toggle('hidden', activePanel !== 'properties');
    document.getElementById('notes-panel').classList.toggle('hidden', activePanel !== 'notes');
    document.querySelectorAll('.panel-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.panel === activePanel));
  }

  function render(state) {
    const server = state.server;
    renderBrowser(server);
    renderDetail(server, state);
    renderModal(state.modal);
    renderPanels(state.activePanel);
    const search = document.getElementById('search');
    if (server && document.activeElement !== search) search.value = server.query ?? '';
    const path = document.getElementById('library-path');
    path.textContent = server?.libraryPath
      ? \`\${server.libraryScanning ? 'Scanning \xB7 ' : server.libraryLoaded ? '' : 'Unavailable \xB7 '}\${server.libraryPath}\`
      : 'Built-ins only';
    path.title = server?.libraryPath || 'No user library selected';
    const refresh = document.getElementById('refresh-btn');
    refresh.disabled = !server?.libraryPath || Boolean(server?.libraryScanning);
    refresh.textContent = server?.libraryScanning ? 'Scanning\u2026' : 'Refresh';
  }

  function optionalNumber(id) {
    const value = document.getElementById(id).value.trim();
    return value === '' ? null : Number(value);
  }

  function textList(id) {
    return [...new Set(document.getElementById(id).value.split(/[\\n,]/).map((value) => value.trim()).filter(Boolean))];
  }

  function readProperties() {
    return {
      name:document.getElementById('name-edit').value,
      description:document.getElementById('description-edit').value,
      pitchMode:document.getElementById('pitch-mode-edit').value,
      sourceMeter:{
        numerator:Number(document.getElementById('meter-numerator-edit').value),
        denominator:Number(document.getElementById('meter-denominator-edit').value),
      },
      defaultGate:optionalNumber('default-gate-edit'),
      velocityCurve:{
        inputMin:optionalNumber('curve-input-min'), inputMax:optionalNumber('curve-input-max'),
        outputMin:optionalNumber('curve-output-min'), outputMax:optionalNumber('curve-output-max'),
        exponent:optionalNumber('curve-exponent'),
      },
      metadata:{
        author:document.getElementById('author-edit').value,
        source:document.getElementById('source-edit').value,
        license:document.getElementById('license-edit').value,
        tags:textList('tags-edit'), suggestedModes:textList('suggested-modes-edit'),
        pickupTicks:optionalNumber('pickup-ticks-edit'),
      },
    };
  }

  function pushProperties() {
    if (!selectedIsEditing(store.getState().server)) return;
    send({ type:'edit_motif', properties:readProperties() });
  }

  function normalizeServerState(value) {
    if (!value || !Array.isArray(value.items)) throw new TypeError('items must be an array');
    if (!value.editing || typeof value.editing.active !== 'boolean') throw new TypeError('editing state is missing');
    return {
      ...value,
      items:value.items.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string'),
      selectedIndex:Number.isInteger(value.selectedIndex) ? value.selectedIndex : -1,
      libraryPath:typeof value.libraryPath === 'string' ? value.libraryPath : '',
      libraryScanning:Boolean(value.libraryScanning),
    };
  }

  function receiveNoteChunk(payload) {
    const current = store.getState();
    const selected = current.server?.selected;
    const transferId = Number(payload.transferId);
    const offset = Number(payload.offset);
    const total = Number(payload.total);
    if (
      !selected
      || selected.id !== payload.motifId
      || selected.noteTransferId !== transferId
      || !Number.isInteger(offset)
      || !Number.isInteger(total)
      || total < 0
      || total > MAX_MOTIF_NOTES
      || !Array.isArray(payload.notes)
    ) return;

    if (
      !pendingNoteTransfer
      || pendingNoteTransfer.id !== transferId
      || pendingNoteTransfer.motifId !== payload.motifId
    ) {
      pendingNoteTransfer = {
        id:transferId,
        motifId:payload.motifId,
        total,
        notes:new Array(total),
        received:new Set(),
      };
    }

    payload.notes.forEach((note, index) => {
      const noteIndex = offset + index;
      if (noteIndex < 0 || noteIndex >= total || !note) return;
      pendingNoteTransfer.notes[noteIndex] = note;
      pendingNoteTransfer.received.add(noteIndex);
    });
    if (pendingNoteTransfer.received.size !== total) return;

    const notes = pendingNoteTransfer.notes;
    pendingNoteTransfer = null;
    store.setState({
      server:{
        ...current.server,
        selected:{ ...selected, notes, notesLoading:false },
      },
    });
  }

  function receiveData(...values) {
    const encoded = values[values.length - 1];
    try {
      const payload = JSON.parse(decodeURIComponent(String(encoded)));
      if (payload?.kind === 'note-chunk') {
        receiveNoteChunk(payload);
        payloadErrorSignature = '';
        return;
      }
      const server = normalizeServerState(payload);
      const previous = store.getState();
      const selectedChanged = previous.server?.selected?.id !== server.selected?.id;
      const editingEnded = previous.server?.editing?.active && !server.editing.active;
      pendingNoteTransfer = null;
      store.setState({ server, formDirty:selectedChanged || editingEnded ? false : previous.formDirty });
      if (server.alert?.id && server.alert.id !== previous.server?.alert?.id) {
        openModal({
          title:server.alert.title || 'Import warning',
          message:server.alert.message || 'The MIDI clip could not be imported.',
          confirmLabel:'OK',
          dismissOnly:true,
        });
      }
      payloadErrorSignature = '';
      if (stateDeadline !== null) { clearTimeout(stateDeadline); stateDeadline = null; }
      debug('ok', \`State: \${server.items.length} motifs\${server.libraryPath ? \` \xB7 \${server.libraryPath}\` : ''}\`);
    } catch (reason) {
      const detail = errorText(reason);
      if (detail === payloadErrorSignature) return;
      payloadErrorSignature = detail;
      if (/Unterminated string|Unexpected end of JSON|unterminated/i.test(detail)) {
        const message = 'The selected MIDI clip contains more note data than the Library can display. Shorten the clip or split it into smaller phrases, then import it again.';
        debug('error', \`MIDI file is too long: \${message}\`);
        openModal({
          title:'MIDI file is too long',
          message,
          confirmLabel:'OK',
          dismissOnly:true,
        });
      } else {
        debug('error', \`Library data could not be displayed: \${detail}\`);
      }
    }
  }

  store.subscribe(render);
  render(store.getState());

  document.querySelectorAll('.panel-tab').forEach((tab) => tab.addEventListener('click', () => store.setState({ activePanel:tab.dataset.panel })));
  document.getElementById('search').addEventListener('input', (event) => send({ type:'filter_motifs', query:event.target.value }));
  document.getElementById('clear-search').addEventListener('click', () => send({ type:'filter_motifs', query:'' }));
  document.getElementById('choose-btn').addEventListener('click', () => {
    confirmDiscard(() => {
      if (store.getState().server?.editing?.active) send({ type:'cancel_edit' });
      window.max.outlet('choose_library');
    }, 'Discard the current edits and choose another library folder?');
  });
  document.getElementById('refresh-btn').addEventListener('click', () => confirmDiscard(
    () => send({ type:'refresh_library', discardChanges:true }),
    'Discard the current edits and reload the library folder?',
  ));
  document.getElementById('edit-btn').addEventListener('click', () => send({ type:'begin_edit' }));
  document.getElementById('cancel-edit-btn').addEventListener('click', () => confirmDiscard(() => send({ type:'cancel_edit' })));
  document.getElementById('import-clip-btn').addEventListener('click', () => confirmDiscard(
    () => send({ type:'import_clip', pitchMode:document.getElementById('import-mode').value }),
    'Discard the current edits and import the selected Live clip?',
  ));
  document.getElementById('save-motif-btn').addEventListener('click', () => send({ type:'save_motif', properties:readProperties() }));
  document.getElementById('add-note-btn').addEventListener('click', () => send({ type:'add_note' }));
  document.getElementById('assign-hotkey-btn').addEventListener('click', () => {
    const selected = store.getState().server?.selected;
    const input = document.getElementById('hotkey-input');
    const pitch = parseMidiNoteName(input.value);
    if (!selected || pitch === null) {
      debug('error', 'Hot key must be a note name from C-2 through G8, such as C3');
      return;
    }
    input.value = midiNoteName(pitch);
    send({
      type:'map_trigger',
      pitch,
      motifId:selected.id,
      action:document.getElementById('hotkey-action').value,
    });
  });
  document.getElementById('hotkey-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('assign-hotkey-btn').click();
    }
  });

  for (const id of PROPERTY_INPUT_IDS) {
    const input = document.getElementById(id);
    input.addEventListener('input', () => store.setState({ formDirty:true }));
    input.addEventListener('change', pushProperties);
    if (input.tagName === 'TEXTAREA' || input.type === 'text') input.addEventListener('blur', pushProperties);
  }

  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeModal(); });
  document.getElementById('modal-confirm').addEventListener('click', () => {
    const modal = store.getState().modal;
    closeModal();
    if (modal?.onConfirm) modal.onConfirm();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && store.getState().modal) closeModal(); });

  if (isMax) {
    if (typeof window.max.bindInlet !== 'function') {
      debug('error', 'Max jweb bridge is missing bindInlet');
    } else {
      window.max.bindInlet('receiveData', receiveData);
      debug('info', \`Bridge ready; waiting for library state (\${location.href})\`);
      window.max.outlet('library_ready');
      stateDeadline = setTimeout(() => {
        if (!store.getState().server) debug('error', 'No library state received within 2 seconds');
      }, 2000);
    }
  } else {
    receiveData(encodeURIComponent(JSON.stringify({
      query:'', libraryPath:'/Users/example/Motifs', libraryLoaded:true, libraryScanning:false, scanProgress:null,
      editing:{ active:false, dirty:false, created:false, sourceId:null, targetId:null },
      items:[
        { id:'chromatic-turn', name:'Chromatic Turn', showId:false },
        { id:'scale-turn', name:'Scale Turn', showId:false },
      ],
      selectedIndex:0,
      selected:{
        schemaVersion:1, id:'chromatic-turn', name:'Chromatic Turn', description:'Fixed-interval phrase that ignores the selected scale.',
        pitchMode:'chromatic', sourceMeter:{ numerator:4, denominator:4 }, length:3360, defaultGate:.82,
        velocityCurve:{ inputMin:null, inputMax:null, outputMin:null, outputMax:null, exponent:null },
        metadata:{ author:'', source:'', license:'', tags:['demo','chromatic'], suggestedModes:[], pickupTicks:null },
        stats:'7 notes \u2022 0.88 bars \u2022 4/4 source \u2022 chromatic', isBuiltin:true, isPersisted:false,
        notes:[
          { pitch:0, accidental:null, at:0, duration:480, gate:null, velocity:null, velocityOffset:null, velocityScale:null, legato:false, tie:false },
          { pitch:2, accidental:null, at:480, duration:480, gate:null, velocity:null, velocityOffset:null, velocityScale:null, legato:false, tie:false },
        ],
      },
    })));
  }
</script>
</body>
</html>
`);let n=Rt(t.foldername,"uttori-motif-library-ce085acf5373.html");t.close(),t=void 0;let i=new File(n,"read");if(!i.isopen)throw new Error(`could not reopen ${n}`);let r=i.eof;if(i.close(),r<46491)throw new Error(`wrote a truncated page to ${n} (${r} bytes)`);x("library-page",n)}catch(n){t?.isopen&&t.close(),s(`Library page preparation failed: ${n instanceof Error?n.message:String(n)}`)}}function Vn(e,t,n){let i=String(n);try{i=decodeURIComponent(i)}catch{}let r=`Motif jweb ${String(e)} [${String(t)}] ${i}
`;String(t).toLowerCase()==="error"?error(r):post(r)}function Dt(){if(!h.isPlaying||Re==="immediate")return 0;let e=mt(Re,h.timeSignature);return pt(Math.max(0,h.currentSongTime*960),e)}function qn(e){if(Ie==="preserve")return e.length;let t=F(h.timeSignature),n=F(e.sourceMeter);return e.length*(t/n)}function St(e){return Math.max(Lt,te(qn(e),Ne().tempo))}function zt(e,t,n,i){x("event",e,t,n,Math.max(0,i))}function Jn(e,t,n){zt(e,t,n,0)}function Qn(e){return be==="all"||be==="non-triggers"&&!e}function Bt(e){let t=G.get(e);return t?.action==="trigger"?t.motifId:v}function Ze(e,t,n,i={}){let r=i.motifId??Bt(e),o=se(r);if(!o){s(`Unknown motif: ${r}`);return}(Ee==="replace"||D==="latch")&&Te(),Se=e,Ot=!0,_();let c=Pn++,a={channel:Math.round(k(n,1,16)),meterMode:Ie,triggerPitch:Math.round(e),triggerVelocity:Math.round(t),launchOffsetTicks:i.launchOffsetTicks??Dt(),instanceId:c};oe!==void 0&&(a.pitchMode=oe);for(let f of gt(Ke(o),Ne(),a))zt(f.pitch,f.velocity,f.channel,f.offsetMs);return g("trigger",r,e,c),c}function J(e,t=!0){let n=H.get(e);n&&(n.task.cancel(),n.task.freepeer(),H.delete(e),ke.delete(e),t&&g("repeat-stopped",n.motifId,e))}function et(e=!1){for(let t of[...H.keys()])J(t,e);ke.clear()}function Wn(e,t,n){if(H.has(e))return;let i=Bt(e),r=se(i);if(!r){s(`Unknown motif: ${i}`);return}let o=Dt();if(Ze(e,t,n,{motifId:r.id,launchOffsetTicks:o})===void 0)return;let a,f=new Task(()=>{if(H.get(e)!==a)return;let u=se(a.motifId);if(!u){J(e);return}Ze(e,a.velocity,a.channel,{motifId:a.motifId,launchOffsetTicks:0})===void 0||H.get(e)!==a||a.task.schedule(St(u))});a={motifId:r.id,velocity:t,channel:n,task:f},H.set(e,a);let d=te(o,Ne().tempo)+St(r);f.schedule(Math.max(Lt,d)),g("repeat-started",r.id,e)}function Nt(e){le.has(e)&&(Te(),g("release",e))}function Yn(e,t,n=1){let i=Math.round(k(e,0,127)),r=Math.round(k(t,0,127)),o=Math.round(k(n,1,16)),c=G.get(i),a=!!c||H.has(i)||i>=ye&&i<=Me;if(Qn(a)&&Jn(i,r,o),!!a){if(c?.action==="select"){r>0&&(it(c.motifId),v===c.motifId&&g("selected",c.motifId,i));return}if(D==="hold-repeat"||H.has(i)){r>0?D==="hold-repeat"&&Wn(i,r,o):ie?ke.add(i):J(i);return}if(r>0){if(D==="toggle"&&le.has(i)){Nt(i);return}Ze(i,r,o)!==void 0&&D!=="one-shot"&&le.add(i);return}D==="hold"?ie?Fe.add(i):Nt(i):D==="release-tail"&&le.delete(i)}}function jt(e,t,n=1){let i=Math.round(k(e,0,127)),r=Math.round(k(t,0,127));if(i!==64)return;let o=ie;if(ie=r>=64,o&&!ie){for(let c of[...ke])J(c);ke.clear(),Fe.size>0&&Te(),Fe.clear()}g("sustain",ie?"on":"off")}function Zn(e,t=1){jt(64,e,t)}function Kn(e){let t=se(e);if(!t){s(`Unknown motif: ${e}`);return}if(t.id!==v){if(y.isEditing()){if(y.isDirty()){s("Save or cancel the current edits before selecting another motif"),x("motif-selected",we().get(v)??K()?.name??v),m();return}if(y.cancel(l),t=se(e),!t){s(`Unknown motif after cancelling edit: ${e}`),O();return}}v=t.id,x("motif-selected",we().get(t.id)??t.name),_(),g("Motif",t.name)}}function Xn(e){if(e==="motif")oe=void 0;else if(e==="scale"||e==="chromatic"||e==="hybrid")oe=e;else{s(`Unknown pitch mode: ${e}`);return}_(),g("Pitch",e)}function Ut(e){return e===!0||e===1||e==="1"||e==="true"||e==="on"}function tt(){x("ui","transforms",ge?1:0,he?1:0)}function Ht(e){ge=Ut(e),tt(),_(),g("invert",ge?"on":"off")}function ei(){Ht(!ge)}function Gt(e){he=Ut(e),tt(),_(),g("reverse",he?"on":"off")}function ti(){Gt(!he)}function ni(e){if(e!=="preserve"&&e!=="fit-bar"){s(`Unknown meter mode: ${e}`);return}Ie=e,_(),g("Meter",e)}function ii(e){if(e===1||e==="replace")Ee="replace";else if(e===0||e==="overlap")Ee="overlap";else{s(`Unknown retrigger mode: ${String(e)}`);return}g("retrigger",Ee)}function ri(e){if(!["one-shot","hold","hold-repeat","toggle","latch","release-tail"].includes(e)){s(`Unknown trigger mode: ${e}`);return}let n=e;D==="hold-repeat"&&n!=="hold-repeat"&&et(),D=n,g("trigger-mode",D)}function oi(e){if(!["immediate","1/16","1/8","1/4","bar"].includes(e)){s(`Unknown launch quantization: ${e}`);return}Re=e,g("quantization",Re)}function ai(e){if(!["none","non-triggers","all"].includes(e)){s(`Unknown pass-through policy: ${e}`);return}be=e,Ft(),g("pass-through",be)}function si(e){ye=Math.min(Me,Math.round(k(e,0,127))),g("trigger-zone",ye,Me)}function ci(e){Me=Math.max(ye,Math.round(k(e,0,127))),g("trigger-zone",ye,Me)}function Vt(e){if(typeof e=="string"){let t=ht(e);if(t!==void 0)return t;let n=Number(e);return Number.isFinite(n)?Math.round(k(n,0,127)):void 0}return Number.isFinite(e)?Math.round(k(e,0,127)):void 0}function qt(e,t,n="trigger"){let i=Vt(e);if(i===void 0){s(`Cannot map invalid MIDI note: ${String(e)}`);return}let r=se(t);if(!r){s(`Cannot map ${i}: unknown motif ${t}`);return}if(n!=="trigger"&&n!=="select"){s(`Cannot map ${i}: unknown hot-key action ${n}`);return}let o=n;J(i,!1),G.set(i,{motifId:r.id,action:o}),m(),g("mapped",i,r.id,o)}function Jt(e){let t=Vt(e);if(t===void 0){s(`Cannot unmap invalid MIDI note: ${String(e)}`);return}J(t,!1),G.delete(t),m(),g("unmapped",t)}function Qt(){for(let e of G.keys())J(e,!1);G.clear(),m(),g("map-cleared")}function nt(){for(let[e,t]of G)l.has(t.motifId)||(J(e,!1),G.delete(e))}function di(e){let t=new File(e,"read");if(!t.isopen)throw new Error("could not open file");try{return JSON.parse(t.readstring(t.eof))}finally{t.close()}}function ui(e,t){let n=new File(e,"write");if(!n.isopen)throw new Error("could not open file for write");try{n.writestring(`${JSON.stringify(t,null,2)}
`)}finally{n.close()}}function Wt(e){let t=N.endsWith("/")||N.endsWith(":")?"":"/";return`${N}${t}${e}.json`}function $e(e){return e.replace(/\\/g,"/").replace(/\/{2,}/g,"/").toLowerCase()}function xt(e){pe.add($e(e))}function Yt(e){return pe.has($e(e))}function fi(e){let t=new File(e,"read"),n=t.isopen;return n&&t.close(),n}function Zt(e){let t=q(e),n=t,i=2;for(;l.has(n)||N&&Yt(Wt(n));)n=`${t}-${i}`,i+=1;return n}function li(e,t,n){n.candidateOccupiedPaths.add($e(e));try{let i=Ce(di(e));if(!i.valid||!i.motif)s(`${t}: ${i.errors.join("; ")}`);else if(n.candidateStore.isBuiltin(i.motif.id))s(`${t}: id \u201C${i.motif.id}\u201D conflicts with a built-in and was skipped`);else if(n.candidateFiles.has(i.motif.id))s(`${t}: duplicate motif id \u201C${i.motif.id}\u201D was skipped`);else{let r=n.candidateStore.add(i.motif);r.length>0?s(`${t}: ${r.join("; ")}`):(n.candidateFiles.set(i.motif.id,e),n.loadedMotifs+=1)}}catch(i){s(`${t}: ${i instanceof Error?i.message:String(i)}`)}}function mi(){ae+=1,L&&(L.cancel(),L.freepeer(),L=void 0),z?.current&&z.current.folder.close(),z=void 0,Z=!1}function pi(e){if(!(e.generation!==ae||z!==e)){l.resetToBuiltins();for(let t of e.candidateStore.list())e.candidateStore.isBuiltin(t.id)||l.add(t);Y.clear();for(let[t,n]of e.candidateFiles)Y.set(t,n);pe.clear();for(let t of e.candidateOccupiedPaths)pe.add(t);z=void 0,Z=!1,_e=!0,L&&(L.cancel(),L.freepeer(),L=void 0),nt(),Xe(),O(),e.completionStatus==="library"?g("library",N):g("library-refreshed",l.list().length)}}function gi(){let e=z;if(!e||e.generation!==ae)return;let t=0;for(;t<$n;){if(!e.current){let o=e.pending.shift();if(!o){pi(e);return}let c=$e(o.pathname).replace(/\/+$/,"");if(e.visited.has(c))continue;e.visited.add(c);let a=new Folder(o.pathname);if(t+=1,!a.pathname){a.close();continue}e.current={...o,folder:a}}let n=e.current;if(n.folder.end){n.folder.close(),e.current=void 0;continue}let i=n.folder.filename,r=n.folder.filetype;if(i&&i!=="."&&i!==".."){let o=Rt(n.folder.pathname,i),c=n.relativePath?`${n.relativePath}/${i}`:i;r==="fold"?n.depth<Cn?e.pending.push({pathname:o,relativePath:c,depth:n.depth+1}):s(`${c}: maximum library folder depth exceeded`):i.toLowerCase().endsWith(".json")&&li(o,c,e),e.processedEntries+=1}n.folder.next(),t+=1}L&&e.generation===ae&&L.schedule(0)}function Kt(e){if(mi(),_e=!1,!N)return!1;let t=new Folder(N);return t.pathname?(ae+=1,Z=!0,z={generation:ae,completionStatus:e,pending:[],current:{pathname:N,relativePath:"",depth:0,folder:t},visited:new Set([$e(N).replace(/\/+$/,"")]),candidateStore:new de,candidateFiles:new Map,candidateOccupiedPaths:new Set,processedEntries:0,loadedMotifs:0},m(),g("library-scanning",N),L=new Task(gi),L.schedule(0),!0):(t.close(),l.resetToBuiltins(),Y.clear(),pe.clear(),s(`Library folder not found: ${N}`),nt(),Xe(),O(),g("library-unavailable",N),!1)}function hi(e){return xe(e).map(t=>P(t)).filter(Boolean).join(" ").trim().replace(/^"|"$/g,"")}function Xt(e){return e===!0||e===1}function bi(...e){let t=hi(e);if(t){if(y.isDirty()){s("Finish or cancel editing before changing the library folder"),m();return}if(t===N&&(_e||Z)){m();return}y.abandon(),N=t,Kt("library")}}function en(e){if(y.isDirty()&&!Xt(e)){s("Unsaved edits must be saved or discarded before refreshing"),m();return}y.abandon(),Kt("library-refreshed")}function yi(e){let t=typeof e=="number"?e:Number(String(e).replace(/x$/i,""));if(!Ln.includes(t)){s(`Unknown tempo multiplier: ${String(e)}`);return}Ye=t,_(),g("tempo-multiplier",Ye)}function tn(...e){me=xe(e).map(String).map(n=>n.trim()).filter(Boolean).join(" ").trim(),m(),g("filter",me||"(all)")}function Qe(e){return e!==void 0&&e.id!==0}function De(e){if(Array.isArray(e))return De(e[0]);if(typeof e=="boolean")return e;if(typeof e=="number")return e!==0;if(typeof e=="string"){let t=e.trim().toLowerCase();return t!==""&&t!=="0"&&t!=="false"&&t!=="id 0"}return!!e}function Tt(e){try{if(De(e.get("is_midi_clip")))return!0;if(De(e.get("is_audio_clip")))return!1}catch{}return!0}function Mi(){if(!(typeof LiveAPI>"u")){try{let e=new LiveAPI(void 0,"live_set view detail_clip");if(Qe(e)&&Tt(e))return e}catch{}try{let e=new LiveAPI(void 0,"live_set view highlighted_clip_slot");if(!Qe(e)||!De(e.get("has_clip")))return;let t=new LiveAPI(void 0,"live_set view highlighted_clip_slot clip");if(Qe(t)&&Tt(t))return t}catch{}}}function $t(e){if(typeof e=="object"&&e!==null&&!Array.isArray(e))return e}function vi(e){if(typeof e=="string"){let n=e.trim();if(!n)return;try{return JSON.parse(n)}catch{return}}let t=e;if(t&&typeof t.stringify=="function")try{return JSON.parse(t.stringify())}catch{return}return e}function ki(e){let n=$t(vi(e))?.notes;if(!Array.isArray(n))return[];let i=[];for(let r of n){let o=$t(r);if(!o)continue;let c=Number(o.pitch),a=Number(o.start_time??o.startTime),f=Number(o.duration),d=Number(o.velocity??100);!Number.isFinite(c)||!Number.isFinite(a)||!Number.isFinite(f)||o.mute===1||o.muted===1||o.mute===!0||i.push({at:Math.round(a*960),duration:Math.max(1,Math.round(f*960)),pitch:Math.round(c),velocity:Math.round(k(d,1,127))})}return i}function wi(e){let t=e.call("get_notes_extended",0,128,0,4096);return ki(t)}function nn(e="chromatic"){if(Z){s("Wait for the library scan to finish before importing a clip"),m();return}if(y.isDirty()){s("Save or cancel the current edits before importing a clip"),m();return}let t=String(e||"chromatic");if(t!=="scale"&&t!=="chromatic"&&t!=="hybrid"){s(`Unknown import pitch mode: ${t}`);return}let n=Mi();if(!n){s("No clip selected - open a MIDI clip in Detail View, then Import Clip");return}let i=[];try{i=wi(n)}catch(d){s(`Clip import failed: ${d instanceof Error?d.message:String(d)}`);return}if(i.length===0){s("Selected clip has no notes");return}if(i.length>ve){Fn("MIDI file is too long",`The selected MIDI clip contains ${i.length} notes. Motif can import up to ${ve} editable notes. Shorten the clip or split it into smaller phrases, then import it again.`);return}let r=n.getstring("name"),o=String(Array.isArray(r)?r[0]:r||"Imported Clip").trim()||"Imported Clip",c;try{c=lt(i,{id:"pending-import",name:o,pitchMode:t,scaleRootNote:h.rootNote,scaleIntervals:h.scaleIntervals,sourceMeter:{...h.timeSignature},description:`Imported from Live clip \u201C${o}\u201D using ${t} relative analysis.`,tags:["imported","live-clip"]})}catch(d){s(`Clip import failed: ${d instanceof Error?d.message:String(d)}`);return}let a=v;y.isEditing()&&(a=y.cancel(l)??a,l.has(a)&&(v=a));let f=Zt(q(o,`clip-${Date.now()}`));try{let d={...c,id:f},u=l.add(d);if(u.length>0){v=l.has(a)?a:l.list()[0]?.id??re,O(),s(u.join("; "));return}if(!y.begin(l,f,{dirty:!0,created:!0,sourceId:a})){l.remove(f),v=l.has(a)?a:l.list()[0]?.id??re,s("Could not start editing the imported motif"),O();return}v=f,O(),g("imported-clip",f,i.length)}catch(d){l.remove(f),v=l.has(a)?a:l.list()[0]?.id??re,y.abandon(),O(),s(`Clip import failed: ${d instanceof Error?d.message:String(d)}`)}}function Oe(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function R(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Ct(e,t){if(!["string","number","boolean"].includes(typeof e)){s(`${t} must be text`);return}let n=P(e).trim();if(!n){s(`${t} cannot be empty`);return}return n}function We(e,t){return e==null||e===""?void 0:["string","number","boolean"].includes(typeof e)?P(e).trim()||void 0:(s(`${t} must be text`),!1)}function Ae(e,t,n=()=>!0,i="a finite number"){if(e==null||e==="")return;let r=Number(e);return!Number.isFinite(r)||!n(r)?(s(`${t} must be ${i}`),!1):r}function Pt(e,t){let n=Array.isArray(e)?e:typeof e=="string"?e.split(/[\n,]/):void 0;if(!n||n.some(i=>typeof i!="string")){s(`${t} must be a list of text values`);return}return[...new Set(n.map(i=>String(i).trim()).filter(Boolean))]}function rn(e){let t=ze();if(!t)return!1;if(!Oe(e))return s("Motif properties must be an object"),m(),!1;if(R(e,"id")&&P(e.id)!==t.id)return s("Motif ID is generated and cannot be changed"),m(),!1;if(R(e,"schemaVersion")&&Number(e.schemaVersion)!==t.schemaVersion)return s("schemaVersion is read-only"),m(),!1;if(R(e,"length")&&Number(e.length)!==t.length)return s("Motif length is derived from note timing and cannot be changed directly"),m(),!1;let n=t.name;if(R(e,"name")){let p=Ct(e.name,"Motif name");if(p===void 0)return m(),!1;n=p}let i=t.description;if(R(e,"description")){let p=Ct(e.description,"Motif description");if(p===void 0)return m(),!1;i=p}let r=t.pitchMode;if(R(e,"pitchMode")){let p=P(e.pitchMode);if(p!=="scale"&&p!=="chromatic"&&p!=="hybrid")return s("pitchMode must be scale, chromatic, or hybrid"),m(),!1;r=p}let o=t.sourceMeter;if(R(e,"sourceMeter")){let p=e.sourceMeter;if(!Oe(p))return s("sourceMeter must be an object"),m(),!1;let w=Number(p.numerator),S=Number(p.denominator);if(!Number.isInteger(w)||w<1)return s("sourceMeter.numerator must be a positive integer"),m(),!1;if(![1,2,4,8,16,32].includes(S))return s("sourceMeter.denominator must be 1, 2, 4, 8, 16, or 32"),m(),!1;o={numerator:w,denominator:S}}let c=t.defaultGate;if(R(e,"defaultGate")){let p=Ae(e.defaultGate,"defaultGate",w=>w>0,"greater than zero");if(p===!1)return m(),!1;c=p}let a=t.velocityCurve;if(R(e,"velocityCurve")){let p=e.velocityCurve;if(p==null)a=void 0;else if(Oe(p)){let w={};for(let B of["inputMin","inputMax","outputMin","outputMax"]){let Q=Ae(p[B],`velocityCurve.${B}`);if(Q===!1)return m(),!1;Q!==void 0&&(w[B]=Q)}let S=Ae(p.exponent,"velocityCurve.exponent",B=>B>0,"greater than zero");if(S===!1)return m(),!1;S!==void 0&&(w.exponent=S),a=Object.keys(w).length>0?w:void 0}else return s("velocityCurve must be an object"),m(),!1}let f=t.metadata;if(R(e,"metadata")){let p=e.metadata;if(p==null)f=void 0;else if(Oe(p)){let w=We(p.author,"metadata.author"),S=We(p.source,"metadata.source"),B=We(p.license,"metadata.license");if(w===!1||S===!1||B===!1)return m(),!1;let Q=Pt(p.tags??[],"metadata.tags"),Be=Pt(p.suggestedModes??[],"metadata.suggestedModes");if(!Q||!Be)return m(),!1;let je=Ae(p.pickupTicks,"metadata.pickupTicks",dn=>dn>=0,"zero or greater");if(je===!1)return m(),!1;let rt={...w!==void 0?{author:w}:{},...S!==void 0?{source:S}:{},...B!==void 0?{license:B}:{},...Q.length>0?{tags:Q}:{},...Be.length>0?{suggestedModes:Be}:{},...je!==void 0?{pickupTicks:je}:{}};f=Object.keys(rt).length>0?rt:void 0}else return s("metadata must be an object"),m(),!1}let d=r===t.pitchMode?t:ft(t,r,{triggerPitch:Se,rootNote:h.rootNote,scaleIntervals:h.scaleIntervals}),{defaultGate:u,velocityCurve:M,metadata:T,...$}=d,E={...$,name:n,description:i,pitchMode:r,sourceMeter:o,...c!==void 0?{defaultGate:c}:{},...a!==void 0?{velocityCurve:a}:{},...f!==void 0?{metadata:f}:{}};if(JSON.stringify(E)===JSON.stringify(t))return!0;let A=l.update(E);return A.length>0?(s(A.join("; ")),m(),!1):(y.markDirty(),!0)}function on(e){if(e!==void 0&&!rn(e))return;if(!N||!_e){s("Choose a valid library folder before saving");return}let t=K();if(!t){s("No motif selected");return}if(!y.isEditing(t.id)){s("Start editing before saving"),m();return}let n=Y.get(t.id),i=n??Wt(t.id);if(!n&&(Yt(i)||fi(i))){xt(i),s(`Save refused because ${t.id}.json already exists; refresh the library and try again`),m();return}try{ui(i,t),Y.set(t.id,i),xt(i),y.finishSave(),O(),g("saved",t.id,i)}catch(r){s(`Save failed: ${r instanceof Error?r.message:String(r)}`),m()}}function ze(){let e=K();if(!e){s("No motif selected");return}if(!y.isEditing(e.id)){s("Start editing before changing this motif"),m();return}return e}function an(){if(Z){s("Wait for the library scan to finish before editing a motif"),m();return}if(y.isEditing(v)){m();return}let e=K(),t=e&&l.isBuiltin(e.id)?Zt(q(e.name,`${e.id}-copy`)):void 0,n=y.begin(l,v,t?{targetId:t}:{});if(!n){s("Could not start editing the selected motif");return}v=n.id,O(),g("editing",n.id,n.name)}function sn(){let e=y.cancel(l);if(!e){m();return}v=l.has(e)?e:l.list()[0]?.id??re,nt(),O(),g("editing-cancelled",v)}function cn(e){rn(e)&&(_(),g("motif-edited",v))}function it(e,t){let n=l.get(String(e));if(!n||n.id===v)return;if(y.isEditing()){if(y.isDirty()&&!Xt(t)){s("Unsaved edits must be saved or discarded before selecting another motif"),m();return}y.cancel(l)}let i=l.get(n.id);i&&(v=i.id,x("motif-selected",we().get(i.id)??i.name),_(),g("Motif",i.name))}function Ii(e,t,n){if(!On.includes(t))return s(`Unknown note field: ${t}`),!1;let i=ze();if(!i||i.notes.length===0)return!1;if(!Number.isInteger(e)||e<0||e>=i.notes.length)return s(`Unknown note row: ${e}`),!1;let r=i.notes[e];if(!r)return!1;let o={...r},c=n;if(t==="legato"||t==="tie"){let d=n===!0||n===1||n==="1"||n==="true";d?o[t]=!0:delete o[t],c=d}else{let u=n==null||n===""?void 0:Number(n);if(u!==void 0&&!Number.isFinite(u))return s(`Invalid ${t} value`),!1;switch(t){case"pitch":if(u===void 0)return s("pitch cannot be empty"),!1;o.pitch=Math.round(u),c=o.pitch;break;case"accidental":u===void 0||u===0?delete o.accidental:o.accidental=Math.round(u),c=o.accidental??null;break;case"at":if(u===void 0||u<0)return s("at must be zero or greater"),!1;o.at=Math.round(u),c=o.at;break;case"duration":if(u===void 0||u<=0)return s("duration must be greater than zero"),!1;o.duration=Math.round(u),c=o.duration;break;case"gate":if(u===void 0)delete o.gate;else{if(u<=0)return s("gate must be greater than zero"),!1;o.gate=u}c=o.gate??null;break;case"velocity":if(u===void 0)delete o.velocity;else{if(!Number.isInteger(u)||u<1||u>127)return s("velocity must be an integer between 1 and 127"),!1;o.velocity=u}c=o.velocity??null;break;case"velocityOffset":u===void 0||u===0?delete o.velocityOffset:o.velocityOffset=u,c=o.velocityOffset??null;break;case"velocityScale":if(u===void 0)delete o.velocityScale;else{if(u<0)return s("velocityScale must be zero or greater"),!1;o.velocityScale=u}c=o.velocityScale??null;break;default:break}}let a=i.notes.map((d,u)=>u===e?o:d),f=l.setNotes(i.id,a);return f.length>0?(s(f.join("; ")),!1):(y.markDirty(),_(),g("note-edited",e,t,c??"unset"),!0)}function _i(e,t,n){Ii(Math.round(e),String(t),n)}function Si(){let e=ze();if(!e)return;if(e.notes.length>=ve){s(`Maximum ${ve} notes per motif`);return}let t=e.notes.at(-1)?.at??0,n=e.notes.at(-1)?.duration??240,i={pitch:0,at:t+n,duration:240},r=l.setNotes(e.id,[...e.notes,i]);if(r.length>0){s(r.join("; "));return}y.markDirty(),_()}function Ni(e){let t=ze();if(!t)return;let n=Math.round(e);if(n<0||n>=t.notes.length)return;let i=t.notes.filter((o,c)=>c!==n),r=l.setNotes(t.id,i);if(r.length>0){s(r.join("; "));return}y.markDirty(),_()}function xi(...e){let t=xe(e).map(o=>P(o)).filter(Boolean),n=t[t.length-1];if(!n){s("lib_action: missing JSON payload");return}let i;try{i=JSON.parse(decodeURIComponent(n))}catch{s(`lib_action: invalid JSON (${n.slice(0,48)})`);return}let r=P(i.type);switch(r){case"select_browser":it(P(i.id),i.discardChanges);break;case"filter_motifs":tn(i.query);break;case"import_clip":nn(i.pitchMode!==void 0?P(i.pitchMode):void 0);break;case"save_motif":on(i.properties);break;case"refresh_library":en(i.discardChanges);break;case"map_trigger":qt(typeof i.pitch=="number"?i.pitch:P(i.pitch),P(i.motifId),P(i.action,"trigger"));break;case"unmap_trigger":Jt(typeof i.pitch=="number"?i.pitch:P(i.pitch));break;case"clear_trigger_map":Qt();break;case"begin_edit":an();break;case"cancel_edit":sn();break;case"edit_motif":cn(i.properties);break;case"add_note":Si();break;case"remove_note":Ni(Number(i.index));break;case"edit_note_at":_i(Number(i.index),P(i.field),i.value);break;default:s(`lib_action: unknown type ${r}`)}}function Ti(){et(),Te(),g("panic")}function $i(){x("context",h.tempo,h.rootNote,h.scaleName,...h.scaleIntervals)}var Ci={initialize:Bn,preview_ready:jn,library_ready:Un,library_prepare:Gn,web_debug:Vn,note:Yn,cc:jt,sustain:Zn,motif:Kn,pitch_mode:Xn,invert:Ht,invert_toggle:ei,reverse:Gt,reverse_toggle:ti,meter_mode:ni,retrigger:ii,trigger_mode:ri,launch_quantization:oi,pass_through:ai,trigger_low:si,trigger_high:ci,map_trigger:qt,unmap_trigger:Jt,clear_trigger_map:Qt,library_path:bi,refresh_library:en,tempo_multiplier:yi,filter_motifs:tn,import_clip:nn,save_motif:on,begin_edit:an,cancel_edit:sn,edit_motif:cn,select_browser:it,lib_action:xi,panic:Ti,list_motifs:O,dump_context:$i,song_context:zn};function Pi(e,t){let n=Ci[e];if(!n){s(`Unknown message: ${e}`);return}n(...t)}return gn(Li);})();
