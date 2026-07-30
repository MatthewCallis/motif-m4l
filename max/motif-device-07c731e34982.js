var inlets=1;var outlets=1;function anything(){var message=messagename,args=arrayfromargs(arguments);if(typeof MotifEngine==="undefined"||typeof MotifEngine.dispatch!=="function"){error("Motif: engine dispatcher is unavailable for "+message+"\n");return}return MotifEngine.dispatch(message,args)}
"use strict";var MotifEngine=(()=>{var Le=Object.defineProperty;var Kt=Object.getOwnPropertyDescriptor;var Xt=Object.getOwnPropertyNames;var en=Object.prototype.hasOwnProperty;var Ye=e=>{throw TypeError(e)};var tn=(e,t)=>{for(var n in t)Le(e,n,{get:t[n],enumerable:!0})},nn=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Xt(t))!en.call(e,r)&&r!==n&&Le(e,r,{get:()=>t[r],enumerable:!(i=Kt(t,r))||i.enumerable});return e};var rn=e=>nn(Le({},"__esModule",{value:!0}),e);var Ze=(e,t,n)=>t.has(e)||Ye("Cannot "+n);var C=(e,t,n)=>(Ze(e,t,"read from private field"),n?n.call(e):t.get(e)),Ke=(e,t,n)=>t.has(e)?Ye("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),Y=(e,t,n,i)=>(Ze(e,t,"write to private field"),i?i.call(e,n):t.set(e,n),n);var Mi={};tn(Mi,{dispatch:()=>yi});function v(e,t,n){return Math.min(n,Math.max(t,e))}function V(e,t){return(e%t+t)%t}function Oe(e,t){return Math.floor(e/t)}function on(e){let t=[...new Set(e.map(n=>V(Math.round(n),12)))].sort((n,i)=>n-i);return t.includes(0)||t.unshift(0),t}function Z(e,t,n,i){let r=on(i),o=V(n,12),u=V(e,12),a=V(u-o,12),l=r.indexOf(a);if(l===-1){let x=Oe(t,r.length),h=V(t,r.length);return x*12+(r[h]??0)}let c=l+t,d=Oe(c,r.length),b=V(c,r.length);return d*12+(r[b]??0)-a}function Xe(e,t,n,i){return v(e+Z(e,t,n,i),0,127)}function et(e,t){return v(e+t,0,127)}function tt(e,t,n,i,r){return v(e+Z(e,t,i,r)+n,0,127)}function an(e,t,n=60,i=0){let r=Math.max(1,new Set(t.map(c=>(Math.round(c)%12+12)%12)).size),o=Math.round(e/12*r),u=r*2+2,a=o,l=e-Z(n,o,i,t);for(let c=o-u;c<=o+u;c+=1){let d=e-Z(n,c,i,t),b=Math.abs(d),N=Math.abs(l);(b<N||b===N&&Math.abs(c)<Math.abs(a)||b===N&&Math.abs(c)===Math.abs(a)&&c<a)&&(a=c,l=d)}return{degree:a,accidental:l}}function nt(e,t,n){if(t==="chromatic")return{pitch:e};let i=an(e,n.scaleIntervals,n.triggerPitch,n.rootNote);return t==="hybrid"&&i.accidental!==0?{pitch:i.degree,accidental:i.accidental}:{pitch:i.degree}}function sn(e,t,n){return t==="chromatic"?e.pitch+(e.accidental??0):Z(n.triggerPitch,e.pitch,n.rootNote,n.scaleIntervals)+(t==="hybrid"?e.accidental??0:0)}function it(e,t,n){if(e.pitchMode===t)return e;let i=e.notes.map(r=>{let o=sn(r,e.pitchMode,n),u=nt(o,t,n),{pitch:a,accidental:l,...c}=r;return{...c,...u}});return{...e,pitchMode:t,notes:i}}function rt(e,t){let n=[...e].map(a=>({at:a.at,duration:Math.max(1,a.duration),pitch:a.pitch,velocity:a.velocity})).sort((a,l)=>a.at-l.at||a.pitch-l.pitch);if(n.length===0)throw new Error("No completed notes to import");let i=t.rootNote??n[0]?.pitch??60,r={triggerPitch:i,rootNote:t.scaleRootNote??0,scaleIntervals:t.scaleIntervals??[0,2,4,5,7,9,11]},o=n.map(a=>{let l=a.pitch-i;return{at:a.at,duration:a.duration,...nt(l,t.pitchMode,r),velocity:a.velocity}}),u=Math.max(...o.map(a=>a.at+a.duration));return{schemaVersion:1,id:t.id,name:t.name,description:t.description??`Imported using ${t.pitchMode} relative analysis.`,pitchMode:t.pitchMode,sourceMeter:t.sourceMeter??{numerator:4,denominator:4},length:u,notes:o}}function A(e){return e.numerator*960*(4/e.denominator)}function K(e,t){let n=Number.isFinite(t)&&t>0?t:120;return e/960*(6e4/n)}function ot(e,t){switch(e){case"1/16":return 960/4;case"1/8":return 960/2;case"1/4":return 960;case"bar":return A(t);default:return 0}}function at(e,t){if(!Number.isFinite(e)||!Number.isFinite(t)||t<=0)return 0;let n=(e%t+t)%t;return n===0?0:t-n}function cn(e,t){if(!t)return e;let n=t.inputMin??1,i=t.inputMax??127,r=t.outputMin??1,o=t.outputMax??127,u=Math.max(.01,t.exponent??1),a=v((e-n)/Math.max(1,i-n),0,1);return r+(o-r)*a**u}function un(e,t,n){let i=cn(n,t.velocityCurve),o=(e.velocity??i)*(e.velocityScale??1);return Math.round(v(o+(e.velocityOffset??0),1,127))}function Ae(e,t,n,i){switch(i.pitchMode??t.pitchMode){case"chromatic":return et(i.triggerPitch,e.pitch+(e.accidental??0));case"hybrid":return tt(i.triggerPitch,e.pitch,e.accidental??0,n.rootNote,n.scaleIntervals);default:return Xe(i.triggerPitch,e.pitch,n.rootNote,n.scaleIntervals)}}function dn(e,t,n){let i=Math.max(.01,e.gate??n.defaultGate??1),r=e.duration*i;return e.legato&&t&&t.at>e.at&&(r=Math.max(r,t.at-e.at)),e.tie&&t&&t.at<=e.at+e.duration&&t.pitch===e.pitch&&(t.accidental??0)===(e.accidental??0)&&(r=Math.max(r,t.at+t.duration-e.at)),r}function st(e,t,n){let i=A(t.timeSignature),r=A(e.sourceMeter),o=n.meterMode==="fit-bar"?i/r:1,u=Math.round(v(n.channel,1,16)),a=Math.max(0,n.launchOffsetTicks??0),l=n.instanceId??0,c=[];for(let d=0;d<e.notes.length;d+=1){let b=e.notes[d];if(!b)continue;let N=e.notes[d+1],x=Ae(b,e,t,n),h=un(b,e,n.triggerVelocity),S=a+Math.max(0,b.at*o),R=dn(b,N,e)*o,O=Math.max(S,S+R);c.push({pitch:x,velocity:h,channel:u,offsetTicks:S,offsetMs:K(S,t.tempo),instanceId:l}),c.push({pitch:x,velocity:0,channel:u,offsetTicks:O,offsetMs:K(O,t.tempo),instanceId:l})}return c.sort((d,b)=>d.offsetTicks!==b.offsetTicks?d.offsetTicks-b.offsetTicks:d.velocity-b.velocity)}function ln(e){let t=Math.max(0,Math.min(127,Math.round(e))),n=["C","C\u266F","D","D\u266F","E","F","F\u266F","G","G\u266F","A","A\u266F","B"],i=Math.floor(t/12)-2;return`${n[t%12]??"C"}${i}`}function ct(e){let t=e.trim().match(/^([A-Ga-g])([#♯b♭]?)(-2|-1|[0-8])$/);if(!t)return;let n={C:0,D:2,E:4,F:5,G:7,A:9,B:11},i=t[1]?.toUpperCase()??"",r=t[2],o=Number(t[3]),u=r==="#"||r==="\u266F"?1:r==="b"||r==="\u266D"?-1:0,a=(o+2)*12+(n[i]??0)+u;return a>=0&&a<=127?a:void 0}function Ee(e,t,n,i,r,o=64){let u=i??e.pitchMode,a=A(e.sourceMeter),l=A(t.timeSignature),c=r==="fit-bar"?l/a:1,d=e.notes.slice(0,o).map(L=>({pitch:Ae(L,e,t,{channel:1,meterMode:r,pitchMode:u,triggerPitch:n,triggerVelocity:100}),atTicks:Math.max(0,L.at*c),durationTicks:Math.max(1,L.duration*c)})),b=d.map(L=>L.pitch),N=b.length>0?Math.min(...b):n,x=b.length>0?Math.max(...b):n,h=N===x?N-1:N,S=N===x?x+1:x,O=Math.max(1,e.length*c)/Math.max(1,r==="fit-bar"?l:a);return{notes:d,noteNames:d.map(L=>ln(L.pitch)),lowPitch:h,highPitch:S,bars:O,effectivePitchMode:u,triggerPitch:n}}function ut(e){return e===0?0:-e}function dt(e,t){if(!t.invert&&!t.reverse)return e;let i=(t.reverse?[...e.notes].reverse():e.notes).map(r=>{let o={...r};return t.invert&&(o.pitch=ut(r.pitch),r.accidental!==void 0&&(o.accidental=ut(r.accidental))),t.reverse&&(o.at=Math.max(0,e.length-r.at-r.duration)),o});return t.reverse&&i.sort((r,o)=>r.at-o.at),{...e,notes:i}}var Fe=[{schemaVersion:1,id:"chromatic-turn",name:"Chromatic Turn",description:"Fixed-interval phrase that ignores the selected scale.",pitchMode:"chromatic",sourceMeter:{numerator:4,denominator:4},length:3360,defaultGate:.82,notes:[{at:0,duration:480,pitch:0},{at:480,duration:480,pitch:2},{at:960,duration:480,pitch:3},{at:1440,duration:480,pitch:7,velocityOffset:6},{at:1920,duration:480,pitch:5},{at:2400,duration:480,pitch:2},{at:2880,duration:480,pitch:0,gate:.95}]},{schemaVersion:1,id:"scale-turn",name:"Scale Turn",description:"Compact scale-aware turn used to validate one-key phrase triggering.",pitchMode:"scale",sourceMeter:{numerator:4,denominator:4},length:3360,defaultGate:.82,notes:[{at:0,duration:480,pitch:0,velocityOffset:4},{at:480,duration:480,pitch:1},{at:960,duration:480,pitch:2,velocityOffset:3},{at:1440,duration:480,pitch:4,velocityOffset:7},{at:1920,duration:480,pitch:3},{at:2400,duration:480,pitch:1,velocityOffset:-3},{at:2880,duration:480,pitch:0,velocityOffset:2,gate:.95}]}];function re(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function H(e){return typeof e=="number"&&Number.isFinite(e)}function fn(e){return e==="scale"||e==="chromatic"||e==="hybrid"}function mn(e,t,n){if(!re(e))return n.push(`${t} must be an object`),!1;let i=!0;return(!Number.isInteger(e.numerator)||Number(e.numerator)<1)&&(n.push(`${t}.numerator must be a positive integer`),i=!1),[1,2,4,8,16,32].includes(Number(e.denominator))||(n.push(`${t}.denominator must be 1, 2, 4, 8, 16, or 32`),i=!1),i}function U(e,t,n,i,r=()=>!0,o="a finite number"){let u=e[t];u!==void 0&&(!H(u)||!r(u))&&i.push(`${n}.${t} must be ${o}`)}function pn(e,t,n){let i=`notes[${t}]`;if(!re(e))return n.push(`${i} must be an object`),!1;(!H(e.at)||e.at<0)&&n.push(`${i}.at must be a non-negative number`),(!H(e.duration)||e.duration<=0)&&n.push(`${i}.duration must be greater than zero`),H(e.pitch)||n.push(`${i}.pitch must be a number`),U(e,"accidental",i,n),U(e,"velocity",i,n,r=>r>=1&&r<=127,"between 1 and 127"),U(e,"velocityOffset",i,n),U(e,"velocityScale",i,n,r=>r>=0,"zero or greater"),U(e,"gate",i,n,r=>r>0,"greater than zero");for(let r of["legato","tie"]){let o=e[r];o!==void 0&&typeof o!="boolean"&&n.push(`${i}.${r} must be a boolean`)}return!0}function hn(e,t){if(e!==void 0){if(!re(e)){t.push("velocityCurve must be an object");return}for(let n of["inputMin","inputMax","outputMin","outputMax"])U(e,n,"velocityCurve",t);U(e,"exponent","velocityCurve",t,n=>n>0,"greater than zero")}}function Se(e){let t=[];if(!re(e))return{valid:!1,errors:["motif must be an object"]};e.schemaVersion!==1&&t.push(`schemaVersion must be ${1}`);for(let n of["id","name","description"])(typeof e[n]!="string"||e[n].trim().length===0)&&t.push(`${n} must be a non-empty string`);if(fn(e.pitchMode)||t.push("pitchMode must be scale, chromatic, or hybrid"),mn(e.sourceMeter,"sourceMeter",t),(!H(e.length)||e.length<=0)&&t.push("length must be greater than zero"),U(e,"defaultGate","motif",t,n=>n>0,"greater than zero"),hn(e.velocityCurve,t),!Array.isArray(e.notes)||e.notes.length===0)t.push("notes must be a non-empty array");else{e.notes.forEach((i,r)=>pn(i,r,t));let n=e.length;H(n)&&e.notes.forEach((i,r)=>{re(i)&&H(i.at)&&H(i.duration)&&i.at+i.duration>n&&t.push(`notes[${r}] extends beyond motif length`)})}return t.length>0?{valid:!1,errors:t}:{valid:!0,errors:t,motif:e}}function q(e,t="motif"){return e.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,72)||t}var oe=class{constructor(){this.motifs=new Map;this.builtinIds=new Set(Fe.map(t=>t.id));this.sortedList=null;this.resetToBuiltins()}invalidateSortedList(){this.sortedList=null}list(){return this.sortedList?this.sortedList:(this.sortedList=[...this.motifs.values()].sort((t,n)=>t.name.localeCompare(n.name)||t.id.localeCompare(n.id)),this.sortedList)}resetToBuiltins(){this.motifs.clear();for(let t of Fe)this.motifs.set(t.id,t);this.invalidateSortedList()}isBuiltin(t){return this.builtinIds.has(t)}has(t){return this.motifs.has(t)}uniqueId(t,n){let i=q(t),r=i,o=2;for(;this.motifs.has(r)&&r!==n||this.builtinIds.has(r)&&r!==n;)r=`${i}-${o}`,o+=1;return r}add(t){let n=Se(t);return!n.valid||!n.motif?n.errors:this.isBuiltin(n.motif.id)?[`Cannot overwrite built-in motif: ${n.motif.id}`]:(this.motifs.set(n.motif.id,n.motif),this.invalidateSortedList(),[])}update(t){return this.add(t)}get(t){return this.motifs.get(t)}remove(t){if(this.isBuiltin(t))return!1;let n=this.motifs.delete(t);return n&&this.invalidateSortedList(),n}filter(t){let n=t.trim().toLowerCase(),i=this.list();return n?i.filter(r=>r.id.toLowerCase().includes(n)||r.name.toLowerCase().includes(n)||r.description.toLowerCase().includes(n)):i}setNotes(t,n){let i=this.motifs.get(t);if(!i)return[`Unknown motif: ${t}`];if(n.length===0)return["notes must be a non-empty array"];let r=Math.max(...n.map(o=>o.at+o.duration));return this.update({...i,notes:n,length:r})}};function Re(e){return{...e,sourceMeter:{...e.sourceMeter},notes:e.notes.map(t=>({...t})),...e.velocityCurve?{velocityCurve:{...e.velocityCurve}}:{}}}var w,Ne=class{constructor(){Ke(this,w)}snapshot(){let t=C(this,w);return t?{active:!0,dirty:t.dirty,created:t.created,sourceId:t.sourceId,targetId:t.targetId}:{active:!1,dirty:!1,created:!1,sourceId:null,targetId:null}}isEditing(t){return C(this,w)!==void 0&&(t===void 0||C(this,w).targetId===t)}isDirty(){return C(this,w)?.dirty??!1}begin(t,n,i={}){if(C(this,w))return C(this,w).targetId===n?t.get(C(this,w).targetId):void 0;let r=t.get(n);if(r){if(t.isBuiltin(n)){let o=t.uniqueId(i.targetId??q(r.name,`${r.id}-copy`)),u={...Re(r),id:o};return t.add(u).length>0?void 0:(Y(this,w,{sourceId:n,targetId:o,original:Re(r),created:!0,dirty:i.dirty??!1}),u)}return Y(this,w,{sourceId:i.sourceId??n,targetId:n,original:Re(r),created:i.created??!1,dirty:i.dirty??!1}),r}}markDirty(){C(this,w)&&(C(this,w).dirty=!0)}cancel(t){let n=C(this,w);if(n)return n.created?t.remove(n.targetId):t.update(n.original),Y(this,w,void 0),n.sourceId}finishSave(){let t=C(this,w)?.targetId;return Y(this,w,void 0),t}abandon(){Y(this,w,void 0)}};w=new WeakMap;var f=new oe,y=new Ne,J=new Map,ue=new Set,j=new Map,se=new Set,Te=new Set,ee="scale-turn",gn=32,bn=32,kt=1,M=ee,te,de=!1,le=!1,ye="preserve",xe="replace",E="one-shot",Ce="immediate",fe="non-triggers",me=36,pe=84,X=!1,ft=!1,yn=1,I="",Me=!1,ve=60,It=!1,Ue=1,ce="",Q=!1,ne=0,F,$,_t,mt=0,pt=0,Mn=[.5,1,1.5,2],vn=["pitch","accidental","at","duration","gate","velocity","velocityOffset","velocityScale","legato","tie"],he=512,De=32,g={tempo:120,rootNote:0,scaleName:"Major",scaleIntervals:[0,2,4,5,7,9,11],scaleMode:!0,timeSignature:{numerator:4,denominator:4},isPlaying:!1,currentSongTime:0},B=new Map,ge=new Set;function we(){return{...g,tempo:g.tempo*Ue}}function _(...e){outlet(0,...e)}function p(...e){_("status",...e)}function s(e){_("error",e),error(`Motif: ${e}
`)}function be(){let e=f.list(),t=new Map;for(let n of e)t.set(n.name,(t.get(n.name)??0)+1);return new Map(e.map(n=>[n.id,(t.get(n.name)??0)>1?`${n.name} \xB7 ${n.id}`:n.name]))}function ie(e){let t=String(e).trim(),n=f.get(t);if(n)return n;let i=[...be()].find(([,r])=>r===t);return i?f.get(i[0]):f.list().find(r=>r.name===t)}function W(){return f.get(M)}function Ge(e){return dt(e,{invert:de,reverse:le})}function wn(e){return Number.isInteger(e)?String(e):e.toFixed(1).replace(/\.0$/,"")}function ae(e){if(f.isBuiltin(e))return"Built-ins";let t=J.get(e);if(!t||!I)return"Library";let n=I.replace(/\\/g,"/").replace(/\/+$/,""),i=t.replace(/\\/g,"/"),r=`${n}/`;if(!i.toLowerCase().startsWith(r.toLowerCase()))return"Library";let o=i.slice(r.length),u=o.lastIndexOf("/");return u<0?"Library":o.slice(0,u)}function ht(e){return[...j].filter(([,t])=>t.motifId===e).map(([t,n])=>({pitch:t,action:n.action})).sort((t,n)=>t.pitch-n.pitch)}function kn(e){return{pitch:e.pitch,accidental:e.accidental??null,at:e.at,duration:e.duration,gate:e.gate??null,velocity:e.velocity??null,velocityOffset:e.velocityOffset??null,velocityScale:e.velocityScale??null,legato:e.legato??!1,tie:e.tie??!1}}function m(){let e=ce.trim().toLowerCase(),t=new Set(f.filter(ce).map(c=>c.id)),n=f.list().filter(c=>!e||t.has(c.id)||ae(c.id).toLowerCase().includes(e)).sort((c,d)=>ae(c.id).localeCompare(ae(d.id))||c.name.localeCompare(d.name)||c.id.localeCompare(d.id)),i=W(),r=i?n.findIndex(c=>c.id===i.id):-1,o=new Map;for(let c of n)o.set(c.name,(o.get(c.name)??0)+1);let u=null,a;if(i){let c=i.notes.map(kn);c.length>De&&(pt+=1,a={id:pt,motifId:i.id,notes:c});let d=Ee(Ge(i),we(),ve,te,ye),b=`${i.sourceMeter.numerator}/${i.sourceMeter.denominator}`,N=`${wn(d.bars)} ${d.bars===1?"bar":"bars"}`,x=`${d.notes.length} notes  \u2022  ${N}  \u2022  ${b} source  \u2022  ${d.effectivePitchMode}`;u={schemaVersion:i.schemaVersion,id:i.id,name:i.name,description:i.description??"",pitchMode:i.pitchMode,sourceMeter:{...i.sourceMeter},length:i.length,defaultGate:i.defaultGate??null,velocityCurve:{inputMin:i.velocityCurve?.inputMin??null,inputMax:i.velocityCurve?.inputMax??null,outputMin:i.velocityCurve?.outputMin??null,outputMax:i.velocityCurve?.outputMax??null,exponent:i.velocityCurve?.exponent??null},stats:x,isBuiltin:f.isBuiltin(i.id),isPersisted:J.has(i.id),folder:ae(i.id),hotkeys:ht(i.id),noteCount:i.notes.length,noteLimit:he,noteTransferId:a?.id??null,notesLoading:!!a,notes:a?[]:c}}let l={query:ce,items:n.map(c=>({id:c.id,name:c.name,showId:(o.get(c.name)??0)>1,folder:ae(c.id),hotkeys:ht(c.id)})),selectedIndex:r,selected:u,editing:y.snapshot(),libraryPath:I,libraryLoaded:Me,libraryScanning:Q,alert:_t??null,scanProgress:F?{processedEntries:F.processedEntries,loadedMotifs:F.loadedMotifs}:null};if(_("ui","lib",encodeURIComponent(JSON.stringify(l))),a)for(let c=0;c<a.notes.length;c+=De)_("ui","lib",encodeURIComponent(JSON.stringify({kind:"note-chunk",transferId:a.id,motifId:a.motifId,offset:c,total:a.notes.length,notes:a.notes.slice(c,c+De)})))}function In(e,t){mt+=1,_t={id:mt,title:e,message:t},s(t),m()}function St(){let e=W();if(!e)return;let t=Ee(Ge(e),we(),ve,te,ye),n=t.notes.reduce((r,o)=>Math.max(r,o.atTicks+o.durationTicks),1),i={notes:t.notes.map(r=>({pitch:r.pitch,atTicks:r.atTicks,durationTicks:r.durationTicks})),totalTicks:n,lowPitch:t.lowPitch,highPitch:t.highPitch,noteNames:t.noteNames.join("  \xB7  ")};_("ui","preview",encodeURIComponent(JSON.stringify(i)))}function k(){m(),St()}function ke(e){let t=[];for(let n of e)Array.isArray(n)?t.push(...n):t.push(n);return t}function T(e,t=""){return typeof e=="string"?e:typeof e=="number"||typeof e=="boolean"?String(e):t}function _n(e){return ke(e).map(Number).filter(Number.isFinite)}function Ie(){_("clear"),_("panic"),se.clear(),Te.clear()}function Sn(e,t){let n=_n(t);switch(e){case"tempo":{let i=n[0];i!==void 0&&i>0&&(g.tempo=i);break}case"root_note":{let i=n[0];i!==void 0&&(g.rootNote=Math.round(i),It||(ve=60+g.rootNote),k());break}case"scale_mode":{g.scaleMode=(n[0]??0)!==0,k();break}case"scale_intervals":{n.length>0&&(g.scaleIntervals=n.map(Math.round),k());break}case"scale_name":{let i=ke(t).map(String).join(" ").trim();i&&(g.scaleName=i,k());break}case"signature_numerator":{let i=n[0];i!==void 0&&i>0&&(g.timeSignature.numerator=Math.round(i),k());break}case"signature_denominator":{let i=n[0];i!==void 0&&i>0&&(g.timeSignature.denominator=Math.round(i),k());break}case"is_playing":{let i=g.isPlaying;g.isPlaying=(n[0]??0)!==0,i&&!g.isPlaying&&(qe(),Ie());break}case"current_song_time":{let i=n[0];i!==void 0&&i>=0&&(g.currentSongTime=i);break}default:s(`Unknown Song property: ${e}`);return}}function Nn(e,...t){Sn(String(e),t)}function Ve(){f.get(M)||(M=f.list()[0]?.id??ee)}function P(){Ve();let e=be();_("motifs-reset");for(let t of f.list())_("motif-item",e.get(t.id)??t.name);_("motif-selected",e.get(M)??W()?.name??M),k()}function Nt(){_("midi-pass",fe==="none"?0:1)}function xn(){ft||(ft=!0,p("Ready"),Nt()),P(),Je()}function Tn(){St()}function Cn(){m()}function xt(e,t){let n=e.endsWith("/")||e.endsWith(":")?"":"/";return`${e}${n}${t}`}function $n(e,t){for(let i=0;i<t.length;i+=8192)e.writestring(t.slice(i,i+8192))}function Pn(){let e="Tempfolder:/uttori-motif-library-6d2cb617de3d.html",t;try{if(t=new File(e,"write"),!t.isopen)throw new Error(`could not create ${e}`);t.eof=0,t.position=0,$n(t,`<!DOCTYPE html>
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
    'meter-denominator-edit','curve-input-min','curve-input-max','curve-output-min',
    'curve-output-max','curve-exponent',
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
    setValue('id-display', selected?.id ?? '', false);
    setValue('schema-display', selected ? \`v\${selected.schemaVersion}\` : '', false);
    setValue('length-display', selected ? \`\${selected.length} ticks\` : '', false);
    setValue('pitch-mode-edit', selected?.pitchMode ?? 'scale', editing);
    setValue('default-gate-edit', selected?.defaultGate, editing);
    setValue('meter-numerator-edit', selected?.sourceMeter?.numerator ?? '', editing);
    setValue('meter-denominator-edit', selected?.sourceMeter?.denominator ?? 4, editing);
    setValue('curve-input-min', curve.inputMin, editing);
    setValue('curve-input-max', curve.inputMax, editing);
    setValue('curve-output-min', curve.outputMin, editing);
    setValue('curve-output-max', curve.outputMax, editing);
    setValue('curve-exponent', curve.exponent, editing);
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
`);let n=xt(t.foldername,"uttori-motif-library-6d2cb617de3d.html");t.close(),t=void 0;let i=new File(n,"read");if(!i.isopen)throw new Error(`could not reopen ${n}`);let r=i.eof;if(i.close(),r<44172)throw new Error(`wrote a truncated page to ${n} (${r} bytes)`);_("library-page",n)}catch(n){t?.isopen&&t.close(),s(`Library page preparation failed: ${n instanceof Error?n.message:String(n)}`)}}function Ln(e,t,n){let i=String(n);try{i=decodeURIComponent(i)}catch{}let r=`Motif jweb ${String(e)} [${String(t)}] ${i}
`;String(t).toLowerCase()==="error"?error(r):post(r)}function Tt(){if(!g.isPlaying||Ce==="immediate")return 0;let e=ot(Ce,g.timeSignature);return at(Math.max(0,g.currentSongTime*960),e)}function On(e){if(ye==="preserve")return e.length;let t=A(g.timeSignature),n=A(e.sourceMeter);return e.length*(t/n)}function gt(e){return Math.max(kt,K(On(e),we().tempo))}function Ct(e,t,n,i){_("event",e,t,n,Math.max(0,i))}function An(e,t,n){Ct(e,t,n,0)}function En(e){return fe==="all"||fe==="non-triggers"&&!e}function $t(e){let t=j.get(e);return t?.action==="trigger"?t.motifId:M}function He(e,t,n,i={}){let r=i.motifId??$t(e),o=ie(r);if(!o){s(`Unknown motif: ${r}`);return}(xe==="replace"||E==="latch")&&Ie(),ve=e,It=!0,k();let u=yn++,a={channel:Math.round(v(n,1,16)),meterMode:ye,triggerPitch:Math.round(e),triggerVelocity:Math.round(t),launchOffsetTicks:i.launchOffsetTicks??Tt(),instanceId:u};te!==void 0&&(a.pitchMode=te);for(let l of st(Ge(o),we(),a))Ct(l.pitch,l.velocity,l.channel,l.offsetMs);return p("trigger",r,e,u),u}function G(e,t=!0){let n=B.get(e);n&&(n.task.cancel(),n.task.freepeer(),B.delete(e),ge.delete(e),t&&p("repeat-stopped",n.motifId,e))}function qe(e=!1){for(let t of[...B.keys()])G(t,e);ge.clear()}function Fn(e,t,n){if(B.has(e))return;let i=$t(e),r=ie(i);if(!r){s(`Unknown motif: ${i}`);return}let o=Tt();if(He(e,t,n,{motifId:r.id,launchOffsetTicks:o})===void 0)return;let a,l=new Task(()=>{if(B.get(e)!==a)return;let d=ie(a.motifId);if(!d){G(e);return}He(e,a.velocity,a.channel,{motifId:a.motifId,launchOffsetTicks:0})===void 0||B.get(e)!==a||a.task.schedule(gt(d))});a={motifId:r.id,velocity:t,channel:n,task:l},B.set(e,a);let c=K(o,we().tempo)+gt(r);l.schedule(Math.max(kt,c)),p("repeat-started",r.id,e)}function bt(e){se.has(e)&&(Ie(),p("release",e))}function Rn(e,t,n=1){let i=Math.round(v(e,0,127)),r=Math.round(v(t,0,127)),o=Math.round(v(n,1,16)),u=j.get(i),a=!!u||B.has(i)||i>=me&&i<=pe;if(En(a)&&An(i,r,o),!!a){if(u?.action==="select"){r>0&&(We(u.motifId),M===u.motifId&&p("selected",u.motifId,i));return}if(E==="hold-repeat"||B.has(i)){r>0?E==="hold-repeat"&&Fn(i,r,o):X?ge.add(i):G(i);return}if(r>0){if(E==="toggle"&&se.has(i)){bt(i);return}He(i,r,o)!==void 0&&E!=="one-shot"&&se.add(i);return}E==="hold"?X?Te.add(i):bt(i):E==="release-tail"&&se.delete(i)}}function Pt(e,t,n=1){let i=Math.round(v(e,0,127)),r=Math.round(v(t,0,127));if(i!==64)return;let o=X;if(X=r>=64,o&&!X){for(let u of[...ge])G(u);ge.clear(),Te.size>0&&Ie(),Te.clear()}p("sustain",X?"on":"off")}function Dn(e,t=1){Pt(64,e,t)}function zn(e){let t=ie(e);if(!t){s(`Unknown motif: ${e}`);return}if(t.id!==M){if(y.isEditing()){if(y.isDirty()){s("Save or cancel the current edits before selecting another motif"),_("motif-selected",be().get(M)??W()?.name??M),m();return}if(y.cancel(f),t=ie(e),!t){s(`Unknown motif after cancelling edit: ${e}`),P();return}}M=t.id,_("motif-selected",be().get(t.id)??t.name),k(),p("Motif",t.name)}}function Bn(e){if(e==="motif")te=void 0;else if(e==="scale"||e==="chromatic"||e==="hybrid")te=e;else{s(`Unknown pitch mode: ${e}`);return}k(),p("Pitch",e)}function Lt(e){return e===!0||e===1||e==="1"||e==="true"||e==="on"}function Je(){_("ui","transforms",de?1:0,le?1:0)}function Ot(e){de=Lt(e),Je(),k(),p("invert",de?"on":"off")}function jn(){Ot(!de)}function At(e){le=Lt(e),Je(),k(),p("reverse",le?"on":"off")}function Un(){At(!le)}function Hn(e){if(e!=="preserve"&&e!=="fit-bar"){s(`Unknown meter mode: ${e}`);return}ye=e,k(),p("Meter",e)}function Gn(e){if(e===1||e==="replace")xe="replace";else if(e===0||e==="overlap")xe="overlap";else{s(`Unknown retrigger mode: ${String(e)}`);return}p("retrigger",xe)}function Vn(e){if(!["one-shot","hold","hold-repeat","toggle","latch","release-tail"].includes(e)){s(`Unknown trigger mode: ${e}`);return}let n=e;E==="hold-repeat"&&n!=="hold-repeat"&&qe(),E=n,p("trigger-mode",E)}function qn(e){if(!["immediate","1/16","1/8","1/4","bar"].includes(e)){s(`Unknown launch quantization: ${e}`);return}Ce=e,p("quantization",Ce)}function Jn(e){if(!["none","non-triggers","all"].includes(e)){s(`Unknown pass-through policy: ${e}`);return}fe=e,Nt(),p("pass-through",fe)}function Qn(e){me=Math.min(pe,Math.round(v(e,0,127))),p("trigger-zone",me,pe)}function Wn(e){pe=Math.max(me,Math.round(v(e,0,127))),p("trigger-zone",me,pe)}function Et(e){if(typeof e=="string"){let t=ct(e);if(t!==void 0)return t;let n=Number(e);return Number.isFinite(n)?Math.round(v(n,0,127)):void 0}return Number.isFinite(e)?Math.round(v(e,0,127)):void 0}function Ft(e,t,n="trigger"){let i=Et(e);if(i===void 0){s(`Cannot map invalid MIDI note: ${String(e)}`);return}let r=ie(t);if(!r){s(`Cannot map ${i}: unknown motif ${t}`);return}if(n!=="trigger"&&n!=="select"){s(`Cannot map ${i}: unknown hot-key action ${n}`);return}let o=n;G(i,!1),j.set(i,{motifId:r.id,action:o}),m(),p("mapped",i,r.id,o)}function Rt(e){let t=Et(e);if(t===void 0){s(`Cannot unmap invalid MIDI note: ${String(e)}`);return}G(t,!1),j.delete(t),m(),p("unmapped",t)}function Dt(){for(let e of j.keys())G(e,!1);j.clear(),m(),p("map-cleared")}function Qe(){for(let[e,t]of j)f.has(t.motifId)||(G(e,!1),j.delete(e))}function Yn(e){let t=new File(e,"read");if(!t.isopen)throw new Error("could not open file");try{return JSON.parse(t.readstring(t.eof))}finally{t.close()}}function Zn(e,t){let n=new File(e,"write");if(!n.isopen)throw new Error("could not open file for write");try{n.writestring(`${JSON.stringify(t,null,2)}
`)}finally{n.close()}}function zt(e){let t=I.endsWith("/")||I.endsWith(":")?"":"/";return`${I}${t}${e}.json`}function _e(e){return e.replace(/\\/g,"/").replace(/\/{2,}/g,"/").toLowerCase()}function yt(e){ue.add(_e(e))}function Bt(e){return ue.has(_e(e))}function Kn(e){let t=new File(e,"read"),n=t.isopen;return n&&t.close(),n}function jt(e){let t=q(e),n=t,i=2;for(;f.has(n)||I&&Bt(zt(n));)n=`${t}-${i}`,i+=1;return n}function Xn(e,t,n){n.candidateOccupiedPaths.add(_e(e));try{let i=Se(Yn(e));if(!i.valid||!i.motif)s(`${t}: ${i.errors.join("; ")}`);else if(n.candidateStore.isBuiltin(i.motif.id))s(`${t}: id \u201C${i.motif.id}\u201D conflicts with a built-in and was skipped`);else if(n.candidateFiles.has(i.motif.id))s(`${t}: duplicate motif id \u201C${i.motif.id}\u201D was skipped`);else{let r=n.candidateStore.add(i.motif);r.length>0?s(`${t}: ${r.join("; ")}`):(n.candidateFiles.set(i.motif.id,e),n.loadedMotifs+=1)}}catch(i){s(`${t}: ${i instanceof Error?i.message:String(i)}`)}}function ei(){ne+=1,$&&($.cancel(),$.freepeer(),$=void 0),F?.current&&F.current.folder.close(),F=void 0,Q=!1}function ti(e){if(!(e.generation!==ne||F!==e)){f.resetToBuiltins();for(let t of e.candidateStore.list())e.candidateStore.isBuiltin(t.id)||f.add(t);J.clear();for(let[t,n]of e.candidateFiles)J.set(t,n);ue.clear();for(let t of e.candidateOccupiedPaths)ue.add(t);F=void 0,Q=!1,Me=!0,$&&($.cancel(),$.freepeer(),$=void 0),Qe(),Ve(),P(),e.completionStatus==="library"?p("library",I):p("library-refreshed",f.list().length)}}function ni(){let e=F;if(!e||e.generation!==ne)return;let t=0;for(;t<gn;){if(!e.current){let o=e.pending.shift();if(!o){ti(e);return}let u=_e(o.pathname).replace(/\/+$/,"");if(e.visited.has(u))continue;e.visited.add(u);let a=new Folder(o.pathname);if(t+=1,!a.pathname){a.close();continue}e.current={...o,folder:a}}let n=e.current;if(n.folder.end){n.folder.close(),e.current=void 0;continue}let i=n.folder.filename,r=n.folder.filetype;if(i&&i!=="."&&i!==".."){let o=xt(n.folder.pathname,i),u=n.relativePath?`${n.relativePath}/${i}`:i;r==="fold"?n.depth<bn?e.pending.push({pathname:o,relativePath:u,depth:n.depth+1}):s(`${u}: maximum library folder depth exceeded`):i.toLowerCase().endsWith(".json")&&Xn(o,u,e),e.processedEntries+=1}n.folder.next(),t+=1}$&&e.generation===ne&&$.schedule(0)}function Ut(e){if(ei(),Me=!1,!I)return!1;let t=new Folder(I);return t.pathname?(ne+=1,Q=!0,F={generation:ne,completionStatus:e,pending:[],current:{pathname:I,relativePath:"",depth:0,folder:t},visited:new Set([_e(I).replace(/\/+$/,"")]),candidateStore:new oe,candidateFiles:new Map,candidateOccupiedPaths:new Set,processedEntries:0,loadedMotifs:0},m(),p("library-scanning",I),$=new Task(ni),$.schedule(0),!0):(t.close(),f.resetToBuiltins(),J.clear(),ue.clear(),s(`Library folder not found: ${I}`),Qe(),Ve(),P(),p("library-unavailable",I),!1)}function ii(e){return ke(e).map(t=>T(t)).filter(Boolean).join(" ").trim().replace(/^"|"$/g,"")}function Ht(e){return e===!0||e===1}function ri(...e){let t=ii(e);if(t){if(y.isDirty()){s("Finish or cancel editing before changing the library folder"),m();return}if(t===I&&(Me||Q)){m();return}y.abandon(),I=t,Ut("library")}}function Gt(e){if(y.isDirty()&&!Ht(e)){s("Unsaved edits must be saved or discarded before refreshing"),m();return}y.abandon(),Ut("library-refreshed")}function oi(e){let t=typeof e=="number"?e:Number(String(e).replace(/x$/i,""));if(!Mn.includes(t)){s(`Unknown tempo multiplier: ${String(e)}`);return}Ue=t,k(),p("tempo-multiplier",Ue)}function Vt(...e){ce=ke(e).map(String).map(n=>n.trim()).filter(Boolean).join(" ").trim(),m(),p("filter",ce||"(all)")}function ze(e){return e!==void 0&&e.id!==0}function $e(e){if(Array.isArray(e))return $e(e[0]);if(typeof e=="boolean")return e;if(typeof e=="number")return e!==0;if(typeof e=="string"){let t=e.trim().toLowerCase();return t!==""&&t!=="0"&&t!=="false"&&t!=="id 0"}return!!e}function Mt(e){try{if($e(e.get("is_midi_clip")))return!0;if($e(e.get("is_audio_clip")))return!1}catch{}return!0}function ai(){if(!(typeof LiveAPI>"u")){try{let e=new LiveAPI(void 0,"live_set view detail_clip");if(ze(e)&&Mt(e))return e}catch{}try{let e=new LiveAPI(void 0,"live_set view highlighted_clip_slot");if(!ze(e)||!$e(e.get("has_clip")))return;let t=new LiveAPI(void 0,"live_set view highlighted_clip_slot clip");if(ze(t)&&Mt(t))return t}catch{}}}function vt(e){if(typeof e=="object"&&e!==null&&!Array.isArray(e))return e}function si(e){if(typeof e=="string"){let n=e.trim();if(!n)return;try{return JSON.parse(n)}catch{return}}let t=e;if(t&&typeof t.stringify=="function")try{return JSON.parse(t.stringify())}catch{return}return e}function ci(e){let n=vt(si(e))?.notes;if(!Array.isArray(n))return[];let i=[];for(let r of n){let o=vt(r);if(!o)continue;let u=Number(o.pitch),a=Number(o.start_time??o.startTime),l=Number(o.duration),c=Number(o.velocity??100);!Number.isFinite(u)||!Number.isFinite(a)||!Number.isFinite(l)||o.mute===1||o.muted===1||o.mute===!0||i.push({at:Math.round(a*960),duration:Math.max(1,Math.round(l*960)),pitch:Math.round(u),velocity:Math.round(v(c,1,127))})}return i}function ui(e){let t=e.call("get_notes_extended",0,128,0,4096);return ci(t)}function qt(e="chromatic"){if(Q){s("Wait for the library scan to finish before importing a clip"),m();return}if(y.isDirty()){s("Save or cancel the current edits before importing a clip"),m();return}let t=String(e||"chromatic");if(t!=="scale"&&t!=="chromatic"&&t!=="hybrid"){s(`Unknown import pitch mode: ${t}`);return}let n=ai();if(!n){s("No clip selected - open a MIDI clip in Detail View, then Import Clip");return}let i=[];try{i=ui(n)}catch(c){s(`Clip import failed: ${c instanceof Error?c.message:String(c)}`);return}if(i.length===0){s("Selected clip has no notes");return}if(i.length>he){In("MIDI file is too long",`The selected MIDI clip contains ${i.length} notes. Motif can import up to ${he} editable notes. Shorten the clip or split it into smaller phrases, then import it again.`);return}let r=n.getstring("name"),o=String(Array.isArray(r)?r[0]:r||"Imported Clip").trim()||"Imported Clip",u;try{u=rt(i,{id:"pending-import",name:o,pitchMode:t,scaleRootNote:g.rootNote,scaleIntervals:g.scaleIntervals,sourceMeter:{...g.timeSignature},description:`Imported from Live clip \u201C${o}\u201D using ${t} relative analysis.`})}catch(c){s(`Clip import failed: ${c instanceof Error?c.message:String(c)}`);return}let a=M;y.isEditing()&&(a=y.cancel(f)??a,f.has(a)&&(M=a));let l=jt(q(o,`clip-${Date.now()}`));try{let c={...u,id:l},d=f.add(c);if(d.length>0){M=f.has(a)?a:f.list()[0]?.id??ee,P(),s(d.join("; "));return}if(!y.begin(f,l,{dirty:!0,created:!0,sourceId:a})){f.remove(l),M=f.has(a)?a:f.list()[0]?.id??ee,s("Could not start editing the imported motif"),P();return}M=l,P(),p("imported-clip",l,i.length)}catch(c){f.remove(l),M=f.has(a)?a:f.list()[0]?.id??ee,y.abandon(),P(),s(`Clip import failed: ${c instanceof Error?c.message:String(c)}`)}}function Be(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function z(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function wt(e,t){if(!["string","number","boolean"].includes(typeof e)){s(`${t} must be text`);return}let n=T(e).trim();if(!n){s(`${t} cannot be empty`);return}return n}function je(e,t,n=()=>!0,i="a finite number"){if(e==null||e==="")return;let r=Number(e);return!Number.isFinite(r)||!n(r)?(s(`${t} must be ${i}`),!1):r}function Jt(e){let t=Pe();if(!t)return!1;if(!Be(e))return s("Motif properties must be an object"),m(),!1;if(z(e,"id")&&T(e.id)!==t.id)return s("Motif ID is generated and cannot be changed"),m(),!1;if(z(e,"schemaVersion")&&Number(e.schemaVersion)!==t.schemaVersion)return s("schemaVersion is read-only"),m(),!1;if(z(e,"length")&&Number(e.length)!==t.length)return s("Motif length is derived from note timing and cannot be changed directly"),m(),!1;let n=t.name;if(z(e,"name")){let h=wt(e.name,"Motif name");if(h===void 0)return m(),!1;n=h}let i=t.description;if(z(e,"description")){let h=wt(e.description,"Motif description");if(h===void 0)return m(),!1;i=h}let r=t.pitchMode;if(z(e,"pitchMode")){let h=T(e.pitchMode);if(h!=="scale"&&h!=="chromatic"&&h!=="hybrid")return s("pitchMode must be scale, chromatic, or hybrid"),m(),!1;r=h}let o=t.sourceMeter;if(z(e,"sourceMeter")){let h=e.sourceMeter;if(!Be(h))return s("sourceMeter must be an object"),m(),!1;let S=Number(h.numerator),R=Number(h.denominator);if(!Number.isInteger(S)||S<1)return s("sourceMeter.numerator must be a positive integer"),m(),!1;if(![1,2,4,8,16,32].includes(R))return s("sourceMeter.denominator must be 1, 2, 4, 8, 16, or 32"),m(),!1;o={numerator:S,denominator:R}}let u=t.defaultGate;if(z(e,"defaultGate")){let h=je(e.defaultGate,"defaultGate",S=>S>0,"greater than zero");if(h===!1)return m(),!1;u=h}let a=t.velocityCurve;if(z(e,"velocityCurve")){let h=e.velocityCurve;if(h==null)a=void 0;else if(Be(h)){let S={};for(let O of["inputMin","inputMax","outputMin","outputMax"]){let L=je(h[O],`velocityCurve.${O}`);if(L===!1)return m(),!1;L!==void 0&&(S[O]=L)}let R=je(h.exponent,"velocityCurve.exponent",O=>O>0,"greater than zero");if(R===!1)return m(),!1;R!==void 0&&(S.exponent=R),a=Object.keys(S).length>0?S:void 0}else return s("velocityCurve must be an object"),m(),!1}let l=r===t.pitchMode?t:it(t,r,{triggerPitch:ve,rootNote:g.rootNote,scaleIntervals:g.scaleIntervals}),{defaultGate:c,velocityCurve:d,...b}=l,N={...b,name:n,description:i,pitchMode:r,sourceMeter:o,...u!==void 0?{defaultGate:u}:{},...a!==void 0?{velocityCurve:a}:{}};if(JSON.stringify(N)===JSON.stringify(t))return!0;let x=f.update(N);return x.length>0?(s(x.join("; ")),m(),!1):(y.markDirty(),!0)}function Qt(e){if(e!==void 0&&!Jt(e))return;if(!I||!Me){s("Choose a valid library folder before saving");return}let t=W();if(!t){s("No motif selected");return}if(!y.isEditing(t.id)){s("Start editing before saving"),m();return}let n=J.get(t.id),i=n??zt(t.id);if(!n&&(Bt(i)||Kn(i))){yt(i),s(`Save refused because ${t.id}.json already exists; refresh the library and try again`),m();return}try{Zn(i,t),J.set(t.id,i),yt(i),y.finishSave(),P(),p("saved",t.id,i)}catch(r){s(`Save failed: ${r instanceof Error?r.message:String(r)}`),m()}}function Pe(){let e=W();if(!e){s("No motif selected");return}if(!y.isEditing(e.id)){s("Start editing before changing this motif"),m();return}return e}function Wt(){if(Q){s("Wait for the library scan to finish before editing a motif"),m();return}if(y.isEditing(M)){m();return}let e=W(),t=e&&f.isBuiltin(e.id)?jt(q(e.name,`${e.id}-copy`)):void 0,n=y.begin(f,M,t?{targetId:t}:{});if(!n){s("Could not start editing the selected motif");return}M=n.id,P(),p("editing",n.id,n.name)}function Yt(){let e=y.cancel(f);if(!e){m();return}M=f.has(e)?e:f.list()[0]?.id??ee,Qe(),P(),p("editing-cancelled",M)}function Zt(e){Jt(e)&&(k(),p("motif-edited",M))}function We(e,t){let n=f.get(String(e));if(!n||n.id===M)return;if(y.isEditing()){if(y.isDirty()&&!Ht(t)){s("Unsaved edits must be saved or discarded before selecting another motif"),m();return}y.cancel(f)}let i=f.get(n.id);i&&(M=i.id,_("motif-selected",be().get(i.id)??i.name),k(),p("Motif",i.name))}function di(e,t,n){if(!vn.includes(t))return s(`Unknown note field: ${t}`),!1;let i=Pe();if(!i||i.notes.length===0)return!1;if(!Number.isInteger(e)||e<0||e>=i.notes.length)return s(`Unknown note row: ${e}`),!1;let r=i.notes[e];if(!r)return!1;let o={...r},u=n;if(t==="legato"||t==="tie"){let c=n===!0||n===1||n==="1"||n==="true";c?o[t]=!0:delete o[t],u=c}else{let d=n==null||n===""?void 0:Number(n);if(d!==void 0&&!Number.isFinite(d))return s(`Invalid ${t} value`),!1;switch(t){case"pitch":if(d===void 0)return s("pitch cannot be empty"),!1;o.pitch=Math.round(d),u=o.pitch;break;case"accidental":d===void 0||d===0?delete o.accidental:o.accidental=Math.round(d),u=o.accidental??null;break;case"at":if(d===void 0||d<0)return s("at must be zero or greater"),!1;o.at=Math.round(d),u=o.at;break;case"duration":if(d===void 0||d<=0)return s("duration must be greater than zero"),!1;o.duration=Math.round(d),u=o.duration;break;case"gate":if(d===void 0)delete o.gate;else{if(d<=0)return s("gate must be greater than zero"),!1;o.gate=d}u=o.gate??null;break;case"velocity":if(d===void 0)delete o.velocity;else{if(!Number.isInteger(d)||d<1||d>127)return s("velocity must be an integer between 1 and 127"),!1;o.velocity=d}u=o.velocity??null;break;case"velocityOffset":d===void 0||d===0?delete o.velocityOffset:o.velocityOffset=d,u=o.velocityOffset??null;break;case"velocityScale":if(d===void 0)delete o.velocityScale;else{if(d<0)return s("velocityScale must be zero or greater"),!1;o.velocityScale=d}u=o.velocityScale??null;break;default:break}}let a=i.notes.map((c,d)=>d===e?o:c),l=f.setNotes(i.id,a);return l.length>0?(s(l.join("; ")),!1):(y.markDirty(),k(),p("note-edited",e,t,u??"unset"),!0)}function li(e,t,n){di(Math.round(e),String(t),n)}function fi(){let e=Pe();if(!e)return;if(e.notes.length>=he){s(`Maximum ${he} notes per motif`);return}let t=e.notes.at(-1)?.at??0,n=e.notes.at(-1)?.duration??240,i={pitch:0,at:t+n,duration:240},r=f.setNotes(e.id,[...e.notes,i]);if(r.length>0){s(r.join("; "));return}y.markDirty(),k()}function mi(e){let t=Pe();if(!t)return;let n=Math.round(e);if(n<0||n>=t.notes.length)return;let i=t.notes.filter((o,u)=>u!==n),r=f.setNotes(t.id,i);if(r.length>0){s(r.join("; "));return}y.markDirty(),k()}function pi(...e){let t=ke(e).map(o=>T(o)).filter(Boolean),n=t[t.length-1];if(!n){s("lib_action: missing JSON payload");return}let i;try{i=JSON.parse(decodeURIComponent(n))}catch{s(`lib_action: invalid JSON (${n.slice(0,48)})`);return}let r=T(i.type);switch(r){case"select_browser":We(T(i.id),i.discardChanges);break;case"filter_motifs":Vt(i.query);break;case"import_clip":qt(i.pitchMode!==void 0?T(i.pitchMode):void 0);break;case"save_motif":Qt(i.properties);break;case"refresh_library":Gt(i.discardChanges);break;case"map_trigger":Ft(typeof i.pitch=="number"?i.pitch:T(i.pitch),T(i.motifId),T(i.action,"trigger"));break;case"unmap_trigger":Rt(typeof i.pitch=="number"?i.pitch:T(i.pitch));break;case"clear_trigger_map":Dt();break;case"begin_edit":Wt();break;case"cancel_edit":Yt();break;case"edit_motif":Zt(i.properties);break;case"add_note":fi();break;case"remove_note":mi(Number(i.index));break;case"edit_note_at":li(Number(i.index),T(i.field),i.value);break;default:s(`lib_action: unknown type ${r}`)}}function hi(){qe(),Ie(),p("panic")}function gi(){_("context",g.tempo,g.rootNote,g.scaleName,...g.scaleIntervals)}var bi={initialize:xn,preview_ready:Tn,library_ready:Cn,library_prepare:Pn,web_debug:Ln,note:Rn,cc:Pt,sustain:Dn,motif:zn,pitch_mode:Bn,invert:Ot,invert_toggle:jn,reverse:At,reverse_toggle:Un,meter_mode:Hn,retrigger:Gn,trigger_mode:Vn,launch_quantization:qn,pass_through:Jn,trigger_low:Qn,trigger_high:Wn,map_trigger:Ft,unmap_trigger:Rt,clear_trigger_map:Dt,library_path:ri,refresh_library:Gt,tempo_multiplier:oi,filter_motifs:Vt,import_clip:qt,save_motif:Qt,begin_edit:Wt,cancel_edit:Yt,edit_motif:Zt,select_browser:We,lib_action:pi,panic:hi,list_motifs:P,dump_context:gi,song_context:Nn};function yi(e,t){let n=bi[e];if(!n){s(`Unknown message: ${e}`);return}n(...t)}return rn(Mi);})();
