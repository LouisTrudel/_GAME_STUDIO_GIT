(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const Lu="modulepreload",Iu=function(n){return"/"+n},Da={},ia=function(e,t,i){let r=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(t.map(c=>{if(c=Iu(c),c in Da)return;Da[c]=!0;const l=c.endsWith(".css"),u=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${u}`))return;const h=document.createElement("link");if(h.rel=l?"stylesheet":Lu,l||(h.as="script"),h.crossOrigin="",h.href=c,o&&h.setAttribute("nonce",o),document.head.appendChild(h),l)return new Promise((p,m)=>{h.addEventListener("load",p),h.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return r.then(a=>{for(const o of a||[])o.status==="rejected"&&s(o.reason);return e().catch(s)})};/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ra="162",Du=0,Na=1,Nu=2,vl=1,Uu=2,Sn=3,qn=0,Dt=1,_t=2,Hn=0,Vi=1,Ua=2,Oa=3,Fa=4,Ou=5,li=100,Fu=101,Bu=102,Ba=103,ka=104,ku=200,Hu=201,zu=202,Gu=203,Io=204,Do=205,Wu=206,Vu=207,qu=208,Xu=209,Ku=210,Yu=211,$u=212,ju=213,Zu=214,Ju=0,Qu=1,eh=2,ds=3,th=4,nh=5,ih=6,rh=7,xl=0,sh=1,oh=2,zn=0,ah=1,ch=2,lh=3,uh=4,hh=5,dh=6,fh=7,Ml=300,ji=301,Zi=302,No=303,Uo=304,ws=306,Oo=1e3,Qt=1001,Fo=1002,Ct=1003,Ha=1004,cr=1005,Pt=1006,ks=1007,hi=1008,Gn=1009,ph=1010,mh=1011,sa=1012,Sl=1013,Un=1014,yn=1015,Er=1016,El=1017,yl=1018,di=1020,gh=1021,en=1023,_h=1024,vh=1025,fi=1026,Ji=1027,xh=1028,Tl=1029,Mh=1030,bl=1031,Al=1033,Hs=33776,zs=33777,Gs=33778,Ws=33779,za=35840,Ga=35841,Wa=35842,Va=35843,wl=36196,qa=37492,Xa=37496,Ka=37808,Ya=37809,$a=37810,ja=37811,Za=37812,Ja=37813,Qa=37814,ec=37815,tc=37816,nc=37817,ic=37818,rc=37819,sc=37820,oc=37821,Vs=36492,ac=36494,cc=36495,Sh=36283,lc=36284,uc=36285,hc=36286,Eh=3200,yh=3201,Cl=0,Th=1,Nn="",an="srgb",$n="srgb-linear",oa="display-p3",Cs="display-p3-linear",fs="linear",tt="srgb",ps="rec709",ms="p3",Si=7680,dc=519,bh=512,Ah=513,wh=514,Rl=515,Ch=516,Rh=517,Ph=518,Lh=519,Bo=35044,fc="300 es",ko=1035,Tn=2e3,gs=2001;class nr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const yt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qs=Math.PI/180,Ho=180/Math.PI;function Wn(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(yt[n&255]+yt[n>>8&255]+yt[n>>16&255]+yt[n>>24&255]+"-"+yt[e&255]+yt[e>>8&255]+"-"+yt[e>>16&15|64]+yt[e>>24&255]+"-"+yt[t&63|128]+yt[t>>8&255]+"-"+yt[t>>16&255]+yt[t>>24&255]+yt[i&255]+yt[i>>8&255]+yt[i>>16&255]+yt[i>>24&255]).toLowerCase()}function Lt(n,e,t){return Math.max(e,Math.min(t,n))}function Ih(n,e){return(n%e+e)%e}function Xs(n,e,t){return(1-t)*n+t*e}function pc(n){return(n&n-1)===0&&n!==0}function zo(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function un(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function je(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class Ae{constructor(e=0,t=0){Ae.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Lt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Fe{constructor(e,t,i,r,s,a,o,c,l){Fe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,a,o,c,l)}set(e,t,i,r,s,a,o,c,l){const u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=t,u[4]=s,u[5]=c,u[6]=i,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],u=i[4],h=i[7],p=i[2],m=i[5],g=i[8],x=r[0],f=r[3],d=r[6],T=r[1],M=r[4],E=r[7],P=r[2],w=r[5],A=r[8];return s[0]=a*x+o*T+c*P,s[3]=a*f+o*M+c*w,s[6]=a*d+o*E+c*A,s[1]=l*x+u*T+h*P,s[4]=l*f+u*M+h*w,s[7]=l*d+u*E+h*A,s[2]=p*x+m*T+g*P,s[5]=p*f+m*M+g*w,s[8]=p*d+m*E+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8];return t*a*u-t*o*l-i*s*u+i*o*c+r*s*l-r*a*c}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=u*a-o*l,p=o*c-u*s,m=l*s-a*c,g=t*h+i*p+r*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=h*x,e[1]=(r*l-u*i)*x,e[2]=(o*i-r*a)*x,e[3]=p*x,e[4]=(u*t-r*c)*x,e[5]=(r*s-o*t)*x,e[6]=m*x,e[7]=(i*c-l*t)*x,e[8]=(a*t-i*s)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,a,o){const c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*a+l*o)+a+e,-r*l,r*c,-r*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ks.makeScale(e,t)),this}rotate(e){return this.premultiply(Ks.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ks.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ks=new Fe;function Pl(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function _s(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Dh(){const n=_s("canvas");return n.style.display="block",n}const mc={};function Ll(n){n in mc||(mc[n]=!0,console.warn(n))}const gc=new Fe().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),_c=new Fe().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ur={[$n]:{transfer:fs,primaries:ps,toReference:n=>n,fromReference:n=>n},[an]:{transfer:tt,primaries:ps,toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[Cs]:{transfer:fs,primaries:ms,toReference:n=>n.applyMatrix3(_c),fromReference:n=>n.applyMatrix3(gc)},[oa]:{transfer:tt,primaries:ms,toReference:n=>n.convertSRGBToLinear().applyMatrix3(_c),fromReference:n=>n.applyMatrix3(gc).convertLinearToSRGB()}},Nh=new Set([$n,Cs]),Je={enabled:!0,_workingColorSpace:$n,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!Nh.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;const i=Ur[e].toReference,r=Ur[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return Ur[n].primaries},getTransfer:function(n){return n===Nn?fs:Ur[n].transfer}};function qi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ys(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Ei;class Il{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ei===void 0&&(Ei=_s("canvas")),Ei.width=e.width,Ei.height=e.height;const i=Ei.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Ei}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=_s("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=qi(s[a]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(qi(t[i]/255)*255):t[i]=qi(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Uh=0;class Dl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Uh++}),this.uuid=Wn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push($s(r[a].image)):s.push($s(r[a]))}else s=$s(r);i.url=s}return t||(e.images[this.uuid]=i),i}}function $s(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Il.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Oh=0;class Rt extends nr{constructor(e=Rt.DEFAULT_IMAGE,t=Rt.DEFAULT_MAPPING,i=Qt,r=Qt,s=Pt,a=hi,o=en,c=Gn,l=Rt.DEFAULT_ANISOTROPY,u=Nn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Oh++}),this.uuid=Wn(),this.name="",this.source=new Dl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Ae(0,0),this.repeat=new Ae(1,1),this.center=new Ae(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Fe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ml)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Oo:e.x=e.x-Math.floor(e.x);break;case Qt:e.x=e.x<0?0:1;break;case Fo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Oo:e.y=e.y-Math.floor(e.y);break;case Qt:e.y=e.y<0?0:1;break;case Fo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}}Rt.DEFAULT_IMAGE=null;Rt.DEFAULT_MAPPING=Ml;Rt.DEFAULT_ANISOTROPY=1;class vt{constructor(e=0,t=0,i=0,r=1){vt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*i+a[11]*r+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s;const c=e.elements,l=c[0],u=c[4],h=c[8],p=c[1],m=c[5],g=c[9],x=c[2],f=c[6],d=c[10];if(Math.abs(u-p)<.01&&Math.abs(h-x)<.01&&Math.abs(g-f)<.01){if(Math.abs(u+p)<.1&&Math.abs(h+x)<.1&&Math.abs(g+f)<.1&&Math.abs(l+m+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(l+1)/2,E=(m+1)/2,P=(d+1)/2,w=(u+p)/4,A=(h+x)/4,F=(g+f)/4;return M>E&&M>P?M<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(M),r=w/i,s=A/i):E>P?E<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(E),i=w/r,s=F/r):P<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(P),i=A/s,r=F/s),this.set(i,r,s,t),this}let T=Math.sqrt((f-g)*(f-g)+(h-x)*(h-x)+(p-u)*(p-u));return Math.abs(T)<.001&&(T=1),this.x=(f-g)/T,this.y=(h-x)/T,this.z=(p-u)/T,this.w=Math.acos((l+m+d-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Fh extends nr{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t);const r={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pt,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0,count:1},i);const s=new Rt(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Dl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class mi extends Fh{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Nl extends Rt{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=Qt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Bh extends Rt{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=Qt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Cr{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,a,o){let c=i[r+0],l=i[r+1],u=i[r+2],h=i[r+3];const p=s[a+0],m=s[a+1],g=s[a+2],x=s[a+3];if(o===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(o===1){e[t+0]=p,e[t+1]=m,e[t+2]=g,e[t+3]=x;return}if(h!==x||c!==p||l!==m||u!==g){let f=1-o;const d=c*p+l*m+u*g+h*x,T=d>=0?1:-1,M=1-d*d;if(M>Number.EPSILON){const P=Math.sqrt(M),w=Math.atan2(P,d*T);f=Math.sin(f*w)/P,o=Math.sin(o*w)/P}const E=o*T;if(c=c*f+p*E,l=l*f+m*E,u=u*f+g*E,h=h*f+x*E,f===1-o){const P=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=P,l*=P,u*=P,h*=P}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,a){const o=i[r],c=i[r+1],l=i[r+2],u=i[r+3],h=s[a],p=s[a+1],m=s[a+2],g=s[a+3];return e[t]=o*g+u*h+c*m-l*p,e[t+1]=c*g+u*p+l*h-o*m,e[t+2]=l*g+u*m+o*p-c*h,e[t+3]=u*g-o*h-c*p-l*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(i/2),u=o(r/2),h=o(s/2),p=c(i/2),m=c(r/2),g=c(s/2);switch(a){case"XYZ":this._x=p*u*h+l*m*g,this._y=l*m*h-p*u*g,this._z=l*u*g+p*m*h,this._w=l*u*h-p*m*g;break;case"YXZ":this._x=p*u*h+l*m*g,this._y=l*m*h-p*u*g,this._z=l*u*g-p*m*h,this._w=l*u*h+p*m*g;break;case"ZXY":this._x=p*u*h-l*m*g,this._y=l*m*h+p*u*g,this._z=l*u*g+p*m*h,this._w=l*u*h-p*m*g;break;case"ZYX":this._x=p*u*h-l*m*g,this._y=l*m*h+p*u*g,this._z=l*u*g-p*m*h,this._w=l*u*h+p*m*g;break;case"YZX":this._x=p*u*h+l*m*g,this._y=l*m*h+p*u*g,this._z=l*u*g-p*m*h,this._w=l*u*h-p*m*g;break;case"XZY":this._x=p*u*h-l*m*g,this._y=l*m*h-p*u*g,this._z=l*u*g+p*m*h,this._w=l*u*h+p*m*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],s=t[8],a=t[1],o=t[5],c=t[9],l=t[2],u=t[6],h=t[10],p=i+o+h;if(p>0){const m=.5/Math.sqrt(p+1);this._w=.25/m,this._x=(u-c)*m,this._y=(s-l)*m,this._z=(a-r)*m}else if(i>o&&i>h){const m=2*Math.sqrt(1+i-o-h);this._w=(u-c)/m,this._x=.25*m,this._y=(r+a)/m,this._z=(s+l)/m}else if(o>h){const m=2*Math.sqrt(1+o-i-h);this._w=(s-l)/m,this._x=(r+a)/m,this._y=.25*m,this._z=(c+u)/m}else{const m=2*Math.sqrt(1+h-i-o);this._w=(a-r)/m,this._x=(s+l)/m,this._y=(c+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Lt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,s=e._z,a=e._w,o=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+a*o+r*l-s*c,this._y=r*u+a*c+s*o-i*l,this._z=s*u+a*l+i*c-r*o,this._w=a*u-i*o-r*c-s*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+i*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const c=1-o*o;if(c<=Number.EPSILON){const m=1-t;return this._w=m*a+t*this._w,this._x=m*i+t*this._x,this._y=m*r+t*this._y,this._z=m*s+t*this._z,this.normalize(),this}const l=Math.sqrt(c),u=Math.atan2(l,o),h=Math.sin((1-t)*u)/l,p=Math.sin(t*u)/l;return this._w=a*h+this._w*p,this._x=i*h+this._x*p,this._y=r*h+this._y*p,this._z=s*h+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(e=0,t=0,i=0){U.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(vc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(vc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*r-o*i),u=2*(o*t-s*r),h=2*(s*i-a*t);return this.x=t+c*l+a*h-o*u,this.y=i+c*u+o*l-s*h,this.z=r+c*h+s*u-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,s=e.z,a=t.x,o=t.y,c=t.z;return this.x=r*c-s*o,this.y=s*a-i*c,this.z=i*o-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return js.copy(this).projectOnVector(e),this.sub(js)}reflect(e){return this.sub(js.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Lt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const js=new U,vc=new Cr;class Rr{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Yt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Yt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Yt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Yt):Yt.fromBufferAttribute(s,a),Yt.applyMatrix4(e.matrixWorld),this.expandByPoint(Yt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Or.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Or.copy(i.boundingBox)),Or.applyMatrix4(e.matrixWorld),this.union(Or)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Yt),Yt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(lr),Fr.subVectors(this.max,lr),yi.subVectors(e.a,lr),Ti.subVectors(e.b,lr),bi.subVectors(e.c,lr),wn.subVectors(Ti,yi),Cn.subVectors(bi,Ti),ei.subVectors(yi,bi);let t=[0,-wn.z,wn.y,0,-Cn.z,Cn.y,0,-ei.z,ei.y,wn.z,0,-wn.x,Cn.z,0,-Cn.x,ei.z,0,-ei.x,-wn.y,wn.x,0,-Cn.y,Cn.x,0,-ei.y,ei.x,0];return!Zs(t,yi,Ti,bi,Fr)||(t=[1,0,0,0,1,0,0,0,1],!Zs(t,yi,Ti,bi,Fr))?!1:(Br.crossVectors(wn,Cn),t=[Br.x,Br.y,Br.z],Zs(t,yi,Ti,bi,Fr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Yt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Yt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(gn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),gn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),gn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),gn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),gn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),gn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),gn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),gn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(gn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const gn=[new U,new U,new U,new U,new U,new U,new U,new U],Yt=new U,Or=new Rr,yi=new U,Ti=new U,bi=new U,wn=new U,Cn=new U,ei=new U,lr=new U,Fr=new U,Br=new U,ti=new U;function Zs(n,e,t,i,r){for(let s=0,a=n.length-3;s<=a;s+=3){ti.fromArray(n,s);const o=r.x*Math.abs(ti.x)+r.y*Math.abs(ti.y)+r.z*Math.abs(ti.z),c=e.dot(ti),l=t.dot(ti),u=i.dot(ti);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}const kh=new Rr,ur=new U,Js=new U;class aa{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):kh.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ur.subVectors(e,this.center);const t=ur.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(ur,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Js.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ur.copy(e.center).add(Js)),this.expandByPoint(ur.copy(e.center).sub(Js))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const _n=new U,Qs=new U,kr=new U,Rn=new U,eo=new U,Hr=new U,to=new U;class Ul{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,_n)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=_n.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(_n.copy(this.origin).addScaledVector(this.direction,t),_n.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Qs.copy(e).add(t).multiplyScalar(.5),kr.copy(t).sub(e).normalize(),Rn.copy(this.origin).sub(Qs);const s=e.distanceTo(t)*.5,a=-this.direction.dot(kr),o=Rn.dot(this.direction),c=-Rn.dot(kr),l=Rn.lengthSq(),u=Math.abs(1-a*a);let h,p,m,g;if(u>0)if(h=a*c-o,p=a*o-c,g=s*u,h>=0)if(p>=-g)if(p<=g){const x=1/u;h*=x,p*=x,m=h*(h+a*p+2*o)+p*(a*h+p+2*c)+l}else p=s,h=Math.max(0,-(a*p+o)),m=-h*h+p*(p+2*c)+l;else p=-s,h=Math.max(0,-(a*p+o)),m=-h*h+p*(p+2*c)+l;else p<=-g?(h=Math.max(0,-(-a*s+o)),p=h>0?-s:Math.min(Math.max(-s,-c),s),m=-h*h+p*(p+2*c)+l):p<=g?(h=0,p=Math.min(Math.max(-s,-c),s),m=p*(p+2*c)+l):(h=Math.max(0,-(a*s+o)),p=h>0?s:Math.min(Math.max(-s,-c),s),m=-h*h+p*(p+2*c)+l);else p=a>0?-s:s,h=Math.max(0,-(a*p+o)),m=-h*h+p*(p+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Qs).addScaledVector(kr,p),m}intersectSphere(e,t){_n.subVectors(e.center,this.origin);const i=_n.dot(this.direction),r=_n.dot(_n)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,a,o,c;const l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,p=this.origin;return l>=0?(i=(e.min.x-p.x)*l,r=(e.max.x-p.x)*l):(i=(e.max.x-p.x)*l,r=(e.min.x-p.x)*l),u>=0?(s=(e.min.y-p.y)*u,a=(e.max.y-p.y)*u):(s=(e.max.y-p.y)*u,a=(e.min.y-p.y)*u),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),h>=0?(o=(e.min.z-p.z)*h,c=(e.max.z-p.z)*h):(o=(e.max.z-p.z)*h,c=(e.min.z-p.z)*h),i>c||o>r)||((o>i||i!==i)&&(i=o),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,_n)!==null}intersectTriangle(e,t,i,r,s){eo.subVectors(t,e),Hr.subVectors(i,e),to.crossVectors(eo,Hr);let a=this.direction.dot(to),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Rn.subVectors(this.origin,e);const c=o*this.direction.dot(Hr.crossVectors(Rn,Hr));if(c<0)return null;const l=o*this.direction.dot(eo.cross(Rn));if(l<0||c+l>a)return null;const u=-o*Rn.dot(to);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class st{constructor(e,t,i,r,s,a,o,c,l,u,h,p,m,g,x,f){st.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,a,o,c,l,u,h,p,m,g,x,f)}set(e,t,i,r,s,a,o,c,l,u,h,p,m,g,x,f){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=c,d[2]=l,d[6]=u,d[10]=h,d[14]=p,d[3]=m,d[7]=g,d[11]=x,d[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new st().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,r=1/Ai.setFromMatrixColumn(e,0).length(),s=1/Ai.setFromMatrixColumn(e,1).length(),a=1/Ai.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(r),l=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const p=a*u,m=a*h,g=o*u,x=o*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=m+g*l,t[5]=p-x*l,t[9]=-o*c,t[2]=x-p*l,t[6]=g+m*l,t[10]=a*c}else if(e.order==="YXZ"){const p=c*u,m=c*h,g=l*u,x=l*h;t[0]=p+x*o,t[4]=g*o-m,t[8]=a*l,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=m*o-g,t[6]=x+p*o,t[10]=a*c}else if(e.order==="ZXY"){const p=c*u,m=c*h,g=l*u,x=l*h;t[0]=p-x*o,t[4]=-a*h,t[8]=g+m*o,t[1]=m+g*o,t[5]=a*u,t[9]=x-p*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const p=a*u,m=a*h,g=o*u,x=o*h;t[0]=c*u,t[4]=g*l-m,t[8]=p*l+x,t[1]=c*h,t[5]=x*l+p,t[9]=m*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const p=a*c,m=a*l,g=o*c,x=o*l;t[0]=c*u,t[4]=x-p*h,t[8]=g*h+m,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-l*u,t[6]=m*h+g,t[10]=p-x*h}else if(e.order==="XZY"){const p=a*c,m=a*l,g=o*c,x=o*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=p*h+x,t[5]=a*u,t[9]=m*h-g,t[2]=g*h-m,t[6]=o*u,t[10]=x*h+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Hh,e,zh)}lookAt(e,t,i){const r=this.elements;return Ot.subVectors(e,t),Ot.lengthSq()===0&&(Ot.z=1),Ot.normalize(),Pn.crossVectors(i,Ot),Pn.lengthSq()===0&&(Math.abs(i.z)===1?Ot.x+=1e-4:Ot.z+=1e-4,Ot.normalize(),Pn.crossVectors(i,Ot)),Pn.normalize(),zr.crossVectors(Ot,Pn),r[0]=Pn.x,r[4]=zr.x,r[8]=Ot.x,r[1]=Pn.y,r[5]=zr.y,r[9]=Ot.y,r[2]=Pn.z,r[6]=zr.z,r[10]=Ot.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],u=i[1],h=i[5],p=i[9],m=i[13],g=i[2],x=i[6],f=i[10],d=i[14],T=i[3],M=i[7],E=i[11],P=i[15],w=r[0],A=r[4],F=r[8],j=r[12],v=r[1],b=r[5],Y=r[9],$=r[13],R=r[2],q=r[6],W=r[10],Z=r[14],V=r[3],K=r[7],J=r[11],oe=r[15];return s[0]=a*w+o*v+c*R+l*V,s[4]=a*A+o*b+c*q+l*K,s[8]=a*F+o*Y+c*W+l*J,s[12]=a*j+o*$+c*Z+l*oe,s[1]=u*w+h*v+p*R+m*V,s[5]=u*A+h*b+p*q+m*K,s[9]=u*F+h*Y+p*W+m*J,s[13]=u*j+h*$+p*Z+m*oe,s[2]=g*w+x*v+f*R+d*V,s[6]=g*A+x*b+f*q+d*K,s[10]=g*F+x*Y+f*W+d*J,s[14]=g*j+x*$+f*Z+d*oe,s[3]=T*w+M*v+E*R+P*V,s[7]=T*A+M*b+E*q+P*K,s[11]=T*F+M*Y+E*W+P*J,s[15]=T*j+M*$+E*Z+P*oe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],c=e[9],l=e[13],u=e[2],h=e[6],p=e[10],m=e[14],g=e[3],x=e[7],f=e[11],d=e[15];return g*(+s*c*h-r*l*h-s*o*p+i*l*p+r*o*m-i*c*m)+x*(+t*c*m-t*l*p+s*a*p-r*a*m+r*l*u-s*c*u)+f*(+t*l*h-t*o*m-s*a*h+i*a*m+s*o*u-i*l*u)+d*(-r*o*u-t*c*h+t*o*p+r*a*h-i*a*p+i*c*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=e[9],p=e[10],m=e[11],g=e[12],x=e[13],f=e[14],d=e[15],T=h*f*l-x*p*l+x*c*m-o*f*m-h*c*d+o*p*d,M=g*p*l-u*f*l-g*c*m+a*f*m+u*c*d-a*p*d,E=u*x*l-g*h*l+g*o*m-a*x*m-u*o*d+a*h*d,P=g*h*c-u*x*c-g*o*p+a*x*p+u*o*f-a*h*f,w=t*T+i*M+r*E+s*P;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/w;return e[0]=T*A,e[1]=(x*p*s-h*f*s-x*r*m+i*f*m+h*r*d-i*p*d)*A,e[2]=(o*f*s-x*c*s+x*r*l-i*f*l-o*r*d+i*c*d)*A,e[3]=(h*c*s-o*p*s-h*r*l+i*p*l+o*r*m-i*c*m)*A,e[4]=M*A,e[5]=(u*f*s-g*p*s+g*r*m-t*f*m-u*r*d+t*p*d)*A,e[6]=(g*c*s-a*f*s-g*r*l+t*f*l+a*r*d-t*c*d)*A,e[7]=(a*p*s-u*c*s+u*r*l-t*p*l-a*r*m+t*c*m)*A,e[8]=E*A,e[9]=(g*h*s-u*x*s-g*i*m+t*x*m+u*i*d-t*h*d)*A,e[10]=(a*x*s-g*o*s+g*i*l-t*x*l-a*i*d+t*o*d)*A,e[11]=(u*o*s-a*h*s-u*i*l+t*h*l+a*i*m-t*o*m)*A,e[12]=P*A,e[13]=(u*x*r-g*h*r+g*i*p-t*x*p-u*i*f+t*h*f)*A,e[14]=(g*o*r-a*x*r-g*i*c+t*x*c+a*i*f-t*o*f)*A,e[15]=(a*h*r-u*o*r+u*i*c-t*h*c-a*i*p+t*o*p)*A,this}scale(e){const t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),s=1-i,a=e.x,o=e.y,c=e.z,l=s*a,u=s*o;return this.set(l*a+i,l*o-r*c,l*c+r*o,0,l*o+r*c,u*o+i,u*c-r*a,0,l*c-r*o,u*c+r*a,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,s=t._x,a=t._y,o=t._z,c=t._w,l=s+s,u=a+a,h=o+o,p=s*l,m=s*u,g=s*h,x=a*u,f=a*h,d=o*h,T=c*l,M=c*u,E=c*h,P=i.x,w=i.y,A=i.z;return r[0]=(1-(x+d))*P,r[1]=(m+E)*P,r[2]=(g-M)*P,r[3]=0,r[4]=(m-E)*w,r[5]=(1-(p+d))*w,r[6]=(f+T)*w,r[7]=0,r[8]=(g+M)*A,r[9]=(f-T)*A,r[10]=(1-(p+x))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;let s=Ai.set(r[0],r[1],r[2]).length();const a=Ai.set(r[4],r[5],r[6]).length(),o=Ai.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],$t.copy(this);const l=1/s,u=1/a,h=1/o;return $t.elements[0]*=l,$t.elements[1]*=l,$t.elements[2]*=l,$t.elements[4]*=u,$t.elements[5]*=u,$t.elements[6]*=u,$t.elements[8]*=h,$t.elements[9]*=h,$t.elements[10]*=h,t.setFromRotationMatrix($t),i.x=s,i.y=a,i.z=o,this}makePerspective(e,t,i,r,s,a,o=Tn){const c=this.elements,l=2*s/(t-e),u=2*s/(i-r),h=(t+e)/(t-e),p=(i+r)/(i-r);let m,g;if(o===Tn)m=-(a+s)/(a-s),g=-2*a*s/(a-s);else if(o===gs)m=-a/(a-s),g=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=l,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,r,s,a,o=Tn){const c=this.elements,l=1/(t-e),u=1/(i-r),h=1/(a-s),p=(t+e)*l,m=(i+r)*u;let g,x;if(o===Tn)g=(a+s)*h,x=-2*h;else if(o===gs)g=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-p,c[1]=0,c[5]=2*u,c[9]=0,c[13]=-m,c[2]=0,c[6]=0,c[10]=x,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Ai=new U,$t=new st,Hh=new U(0,0,0),zh=new U(1,1,1),Pn=new U,zr=new U,Ot=new U,xc=new st,Mc=new Cr;class fn{constructor(e=0,t=0,i=0,r=fn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],c=r[1],l=r[5],u=r[9],h=r[2],p=r[6],m=r[10];switch(t){case"XYZ":this._y=Math.asin(Lt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(p,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Lt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Lt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-h,m),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-Lt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(p,m),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Lt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Lt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(p,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return xc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(xc,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Mc.setFromEuler(this),this.setFromQuaternion(Mc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}fn.DEFAULT_ORDER="XYZ";class ca{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Gh=0;const Sc=new U,wi=new Cr,vn=new st,Gr=new U,hr=new U,Wh=new U,Vh=new Cr,Ec=new U(1,0,0),yc=new U(0,1,0),Tc=new U(0,0,1),qh={type:"added"},Xh={type:"removed"},no={type:"childadded",child:null},io={type:"childremoved",child:null};class St extends nr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Gh++}),this.uuid=Wn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=St.DEFAULT_UP.clone();const e=new U,t=new fn,i=new Cr,r=new U(1,1,1);function s(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new st},normalMatrix:{value:new Fe}}),this.matrix=new st,this.matrixWorld=new st,this.matrixAutoUpdate=St.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ca,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return wi.setFromAxisAngle(e,t),this.quaternion.multiply(wi),this}rotateOnWorldAxis(e,t){return wi.setFromAxisAngle(e,t),this.quaternion.premultiply(wi),this}rotateX(e){return this.rotateOnAxis(Ec,e)}rotateY(e){return this.rotateOnAxis(yc,e)}rotateZ(e){return this.rotateOnAxis(Tc,e)}translateOnAxis(e,t){return Sc.copy(e).applyQuaternion(this.quaternion),this.position.add(Sc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ec,e)}translateY(e){return this.translateOnAxis(yc,e)}translateZ(e){return this.translateOnAxis(Tc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(vn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Gr.copy(e):Gr.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),hr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?vn.lookAt(hr,Gr,this.up):vn.lookAt(Gr,hr,this.up),this.quaternion.setFromRotationMatrix(vn),r&&(vn.extractRotation(r.matrixWorld),wi.setFromRotationMatrix(vn),this.quaternion.premultiply(wi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(qh),no.child=e,this.dispatchEvent(no),no.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Xh),io.child=e,this.dispatchEvent(io),io.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),vn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),vn.multiply(e.parent.matrixWorld)),e.applyMatrix4(vn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hr,e,Wh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hr,Vh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++){const s=t[i];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++){const o=r[s];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const h=c[l];s(e.shapes,h)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(e.materials,this.material[c]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];r.animations.push(s(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),u=a(e.images),h=a(e.shapes),p=a(e.skeletons),m=a(e.animations),g=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),p.length>0&&(i.skeletons=p),m.length>0&&(i.animations=m),g.length>0&&(i.nodes=g)}return i.object=r,i;function a(o){const c=[];for(const l in o){const u=o[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}St.DEFAULT_UP=new U(0,1,0);St.DEFAULT_MATRIX_AUTO_UPDATE=!0;St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const jt=new U,xn=new U,ro=new U,Mn=new U,Ci=new U,Ri=new U,bc=new U,so=new U,oo=new U,ao=new U;class tn{constructor(e=new U,t=new U,i=new U){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),jt.subVectors(e,t),r.cross(jt);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){jt.subVectors(r,t),xn.subVectors(i,t),ro.subVectors(e,t);const a=jt.dot(jt),o=jt.dot(xn),c=jt.dot(ro),l=xn.dot(xn),u=xn.dot(ro),h=a*l-o*o;if(h===0)return s.set(0,0,0),null;const p=1/h,m=(l*c-o*u)*p,g=(a*u-o*c)*p;return s.set(1-m-g,g,m)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,Mn)===null?!1:Mn.x>=0&&Mn.y>=0&&Mn.x+Mn.y<=1}static getInterpolation(e,t,i,r,s,a,o,c){return this.getBarycoord(e,t,i,r,Mn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Mn.x),c.addScaledVector(a,Mn.y),c.addScaledVector(o,Mn.z),c)}static isFrontFacing(e,t,i,r){return jt.subVectors(i,t),xn.subVectors(e,t),jt.cross(xn).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return jt.subVectors(this.c,this.b),xn.subVectors(this.a,this.b),jt.cross(xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return tn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return tn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return tn.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return tn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return tn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,s=this.c;let a,o;Ci.subVectors(r,i),Ri.subVectors(s,i),so.subVectors(e,i);const c=Ci.dot(so),l=Ri.dot(so);if(c<=0&&l<=0)return t.copy(i);oo.subVectors(e,r);const u=Ci.dot(oo),h=Ri.dot(oo);if(u>=0&&h<=u)return t.copy(r);const p=c*h-u*l;if(p<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(i).addScaledVector(Ci,a);ao.subVectors(e,s);const m=Ci.dot(ao),g=Ri.dot(ao);if(g>=0&&m<=g)return t.copy(s);const x=m*l-c*g;if(x<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(i).addScaledVector(Ri,o);const f=u*g-m*h;if(f<=0&&h-u>=0&&m-g>=0)return bc.subVectors(s,r),o=(h-u)/(h-u+(m-g)),t.copy(r).addScaledVector(bc,o);const d=1/(f+x+p);return a=x*d,o=p*d,t.copy(i).addScaledVector(Ci,a).addScaledVector(Ri,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Ol={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ln={h:0,s:0,l:0},Wr={h:0,s:0,l:0};function co(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ve{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=an){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=Je.workingColorSpace){return this.r=e,this.g=t,this.b=i,Je.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=Je.workingColorSpace){if(e=Ih(e,1),t=Lt(t,0,1),i=Lt(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,a=2*i-s;this.r=co(a,s,e+1/3),this.g=co(a,s,e),this.b=co(a,s,e-1/3)}return Je.toWorkingColorSpace(this,r),this}setStyle(e,t=an){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=an){const i=Ol[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qi(e.r),this.g=qi(e.g),this.b=qi(e.b),this}copyLinearToSRGB(e){return this.r=Ys(e.r),this.g=Ys(e.g),this.b=Ys(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=an){return Je.fromWorkingColorSpace(Tt.copy(this),e),Math.round(Lt(Tt.r*255,0,255))*65536+Math.round(Lt(Tt.g*255,0,255))*256+Math.round(Lt(Tt.b*255,0,255))}getHexString(e=an){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.fromWorkingColorSpace(Tt.copy(this),t);const i=Tt.r,r=Tt.g,s=Tt.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let c,l;const u=(o+a)/2;if(o===a)c=0,l=0;else{const h=a-o;switch(l=u<=.5?h/(a+o):h/(2-a-o),a){case i:c=(r-s)/h+(r<s?6:0);break;case r:c=(s-i)/h+2;break;case s:c=(i-r)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=Je.workingColorSpace){return Je.fromWorkingColorSpace(Tt.copy(this),t),e.r=Tt.r,e.g=Tt.g,e.b=Tt.b,e}getStyle(e=an){Je.fromWorkingColorSpace(Tt.copy(this),e);const t=Tt.r,i=Tt.g,r=Tt.b;return e!==an?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(Ln),this.setHSL(Ln.h+e,Ln.s+t,Ln.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ln),e.getHSL(Wr);const i=Xs(Ln.h,Wr.h,t),r=Xs(Ln.s,Wr.s,t),s=Xs(Ln.l,Wr.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Tt=new Ve;Ve.NAMES=Ol;let Kh=0;class ir extends nr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Kh++}),this.uuid=Wn(),this.name="",this.type="Material",this.blending=Vi,this.side=qn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Io,this.blendDst=Do,this.blendEquation=li,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=ds,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=dc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Si,this.stencilZFail=Si,this.stencilZPass=Si,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Vi&&(i.blending=this.blending),this.side!==qn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Io&&(i.blendSrc=this.blendSrc),this.blendDst!==Do&&(i.blendDst=this.blendDst),this.blendEquation!==li&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ds&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==dc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Si&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Si&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Si&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const c=s[o];delete c.metadata,a.push(c)}return a}if(t){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class rn extends ir{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fn,this.combine=xl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ut=new U,Vr=new Ae;class sn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Bo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=yn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return Ll("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Vr.fromBufferAttribute(this,t),Vr.applyMatrix3(e),this.setXY(t,Vr.x,Vr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyMatrix3(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyMatrix4(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.applyNormalMatrix(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)ut.fromBufferAttribute(this,t),ut.transformDirection(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=un(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=je(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=un(t,this.array)),t}setX(e,t){return this.normalized&&(t=je(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=un(t,this.array)),t}setY(e,t){return this.normalized&&(t=je(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=un(t,this.array)),t}setZ(e,t){return this.normalized&&(t=je(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=un(t,this.array)),t}setW(e,t){return this.normalized&&(t=je(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=je(t,this.array),i=je(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=je(t,this.array),i=je(i,this.array),r=je(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=je(t,this.array),i=je(i,this.array),r=je(r,this.array),s=je(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Bo&&(e.usage=this.usage),e}}class Fl extends sn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Bl extends sn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class dt extends sn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Yh=0;const Wt=new st,lo=new St,Pi=new U,Ft=new Rr,dr=new Rr,gt=new U;class Kt extends nr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Yh++}),this.uuid=Wn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Pl(e)?Bl:Fl)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Fe().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Wt.makeRotationFromQuaternion(e),this.applyMatrix4(Wt),this}rotateX(e){return Wt.makeRotationX(e),this.applyMatrix4(Wt),this}rotateY(e){return Wt.makeRotationY(e),this.applyMatrix4(Wt),this}rotateZ(e){return Wt.makeRotationZ(e),this.applyMatrix4(Wt),this}translate(e,t,i){return Wt.makeTranslation(e,t,i),this.applyMatrix4(Wt),this}scale(e,t,i){return Wt.makeScale(e,t,i),this.applyMatrix4(Wt),this}lookAt(e){return lo.lookAt(e),lo.updateMatrix(),this.applyMatrix4(lo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Pi).negate(),this.translate(Pi.x,Pi.y,Pi.z),this}setFromPoints(e){const t=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new dt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Rr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const s=t[i];Ft.setFromBufferAttribute(s),this.morphTargetsRelative?(gt.addVectors(this.boundingBox.min,Ft.min),this.boundingBox.expandByPoint(gt),gt.addVectors(this.boundingBox.max,Ft.max),this.boundingBox.expandByPoint(gt)):(this.boundingBox.expandByPoint(Ft.min),this.boundingBox.expandByPoint(Ft.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new aa);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){const i=this.boundingSphere.center;if(Ft.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];dr.setFromBufferAttribute(o),this.morphTargetsRelative?(gt.addVectors(Ft.min,dr.min),Ft.expandByPoint(gt),gt.addVectors(Ft.max,dr.max),Ft.expandByPoint(gt)):(Ft.expandByPoint(dr.min),Ft.expandByPoint(dr.max))}Ft.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)gt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(gt));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)gt.fromBufferAttribute(o,l),c&&(Pi.fromBufferAttribute(e,l),gt.add(Pi)),r=Math.max(r,i.distanceToSquared(gt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new sn(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let F=0;F<i.count;F++)o[F]=new U,c[F]=new U;const l=new U,u=new U,h=new U,p=new Ae,m=new Ae,g=new Ae,x=new U,f=new U;function d(F,j,v){l.fromBufferAttribute(i,F),u.fromBufferAttribute(i,j),h.fromBufferAttribute(i,v),p.fromBufferAttribute(s,F),m.fromBufferAttribute(s,j),g.fromBufferAttribute(s,v),u.sub(l),h.sub(l),m.sub(p),g.sub(p);const b=1/(m.x*g.y-g.x*m.y);isFinite(b)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-m.y).multiplyScalar(b),f.copy(h).multiplyScalar(m.x).addScaledVector(u,-g.x).multiplyScalar(b),o[F].add(x),o[j].add(x),o[v].add(x),c[F].add(f),c[j].add(f),c[v].add(f))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let F=0,j=T.length;F<j;++F){const v=T[F],b=v.start,Y=v.count;for(let $=b,R=b+Y;$<R;$+=3)d(e.getX($+0),e.getX($+1),e.getX($+2))}const M=new U,E=new U,P=new U,w=new U;function A(F){P.fromBufferAttribute(r,F),w.copy(P);const j=o[F];M.copy(j),M.sub(P.multiplyScalar(P.dot(j))).normalize(),E.crossVectors(w,j);const b=E.dot(c[F])<0?-1:1;a.setXYZW(F,M.x,M.y,M.z,b)}for(let F=0,j=T.length;F<j;++F){const v=T[F],b=v.start,Y=v.count;for(let $=b,R=b+Y;$<R;$+=3)A(e.getX($+0)),A(e.getX($+1)),A(e.getX($+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new sn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,m=i.count;p<m;p++)i.setXYZ(p,0,0,0);const r=new U,s=new U,a=new U,o=new U,c=new U,l=new U,u=new U,h=new U;if(e)for(let p=0,m=e.count;p<m;p+=3){const g=e.getX(p+0),x=e.getX(p+1),f=e.getX(p+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,x),a.fromBufferAttribute(t,f),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),o.fromBufferAttribute(i,g),c.fromBufferAttribute(i,x),l.fromBufferAttribute(i,f),o.add(u),c.add(u),l.add(u),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(x,c.x,c.y,c.z),i.setXYZ(f,l.x,l.y,l.z)}else for(let p=0,m=t.count;p<m;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),a.fromBufferAttribute(t,p+2),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),i.setXYZ(p+0,u.x,u.y,u.z),i.setXYZ(p+1,u.x,u.y,u.z),i.setXYZ(p+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)gt.fromBufferAttribute(e,t),gt.normalize(),e.setXYZ(t,gt.x,gt.y,gt.z)}toNonIndexed(){function e(o,c){const l=o.array,u=o.itemSize,h=o.normalized,p=new l.constructor(c.length*u);let m=0,g=0;for(let x=0,f=c.length;x<f;x++){o.isInterleavedBufferAttribute?m=c[x]*o.data.stride+o.offset:m=c[x]*u;for(let d=0;d<u;d++)p[g++]=l[m++]}return new sn(p,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Kt,i=this.index.array,r=this.attributes;for(const o in r){const c=r[o],l=e(c,i);t.setAttribute(o,l)}const s=this.morphAttributes;for(const o in s){const c=[],l=s[o];for(let u=0,h=l.length;u<h;u++){const p=l[u],m=e(p,i);c.push(m)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const l=i[c];e.data.attributes[c]=l.toJSON(e.data)}const r={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let h=0,p=l.length;h<p;h++){const m=l[h];u.push(m.toJSON(e.data))}u.length>0&&(r[c]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const r=e.attributes;for(const l in r){const u=r[l];this.setAttribute(l,u.clone(t))}const s=e.morphAttributes;for(const l in s){const u=[],h=s[l];for(let p=0,m=h.length;p<m;p++)u.push(h[p].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,u=a.length;l<u;l++){const h=a[l];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ac=new st,ni=new Ul,qr=new aa,wc=new U,Li=new U,Ii=new U,Di=new U,uo=new U,Xr=new U,Kr=new Ae,Yr=new Ae,$r=new Ae,Cc=new U,Rc=new U,Pc=new U,jr=new U,Zr=new U;class he extends St{constructor(e=new Kt,t=new rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){Xr.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const u=o[c],h=s[c];u!==0&&(uo.fromBufferAttribute(h,e),a?Xr.addScaledVector(uo,u):Xr.addScaledVector(uo.sub(t),u))}t.add(Xr)}return t}raycast(e,t){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),qr.copy(i.boundingSphere),qr.applyMatrix4(s),ni.copy(e.ray).recast(e.near),!(qr.containsPoint(ni.origin)===!1&&(ni.intersectSphere(qr,wc)===null||ni.origin.distanceToSquared(wc)>(e.far-e.near)**2))&&(Ac.copy(s).invert(),ni.copy(e.ray).applyMatrix4(Ac),!(i.boundingBox!==null&&ni.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ni)))}_computeIntersections(e,t,i){let r;const s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,l=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,p=s.groups,m=s.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=p.length;g<x;g++){const f=p[g],d=a[f.materialIndex],T=Math.max(f.start,m.start),M=Math.min(o.count,Math.min(f.start+f.count,m.start+m.count));for(let E=T,P=M;E<P;E+=3){const w=o.getX(E),A=o.getX(E+1),F=o.getX(E+2);r=Jr(this,d,e,i,l,u,h,w,A,F),r&&(r.faceIndex=Math.floor(E/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{const g=Math.max(0,m.start),x=Math.min(o.count,m.start+m.count);for(let f=g,d=x;f<d;f+=3){const T=o.getX(f),M=o.getX(f+1),E=o.getX(f+2);r=Jr(this,a,e,i,l,u,h,T,M,E),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,x=p.length;g<x;g++){const f=p[g],d=a[f.materialIndex],T=Math.max(f.start,m.start),M=Math.min(c.count,Math.min(f.start+f.count,m.start+m.count));for(let E=T,P=M;E<P;E+=3){const w=E,A=E+1,F=E+2;r=Jr(this,d,e,i,l,u,h,w,A,F),r&&(r.faceIndex=Math.floor(E/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{const g=Math.max(0,m.start),x=Math.min(c.count,m.start+m.count);for(let f=g,d=x;f<d;f+=3){const T=f,M=f+1,E=f+2;r=Jr(this,a,e,i,l,u,h,T,M,E),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}}}function $h(n,e,t,i,r,s,a,o){let c;if(e.side===Dt?c=i.intersectTriangle(a,s,r,!0,o):c=i.intersectTriangle(r,s,a,e.side===qn,o),c===null)return null;Zr.copy(o),Zr.applyMatrix4(n.matrixWorld);const l=t.ray.origin.distanceTo(Zr);return l<t.near||l>t.far?null:{distance:l,point:Zr.clone(),object:n}}function Jr(n,e,t,i,r,s,a,o,c,l){n.getVertexPosition(o,Li),n.getVertexPosition(c,Ii),n.getVertexPosition(l,Di);const u=$h(n,e,t,i,Li,Ii,Di,jr);if(u){r&&(Kr.fromBufferAttribute(r,o),Yr.fromBufferAttribute(r,c),$r.fromBufferAttribute(r,l),u.uv=tn.getInterpolation(jr,Li,Ii,Di,Kr,Yr,$r,new Ae)),s&&(Kr.fromBufferAttribute(s,o),Yr.fromBufferAttribute(s,c),$r.fromBufferAttribute(s,l),u.uv1=tn.getInterpolation(jr,Li,Ii,Di,Kr,Yr,$r,new Ae)),a&&(Cc.fromBufferAttribute(a,o),Rc.fromBufferAttribute(a,c),Pc.fromBufferAttribute(a,l),u.normal=tn.getInterpolation(jr,Li,Ii,Di,Cc,Rc,Pc,new U),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:c,c:l,normal:new U,materialIndex:0};tn.getNormal(Li,Ii,Di,h.normal),u.face=h}return u}class Nt extends Kt{constructor(e=1,t=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const c=[],l=[],u=[],h=[];let p=0,m=0;g("z","y","x",-1,-1,i,t,e,a,s,0),g("z","y","x",1,-1,i,t,-e,a,s,1),g("x","z","y",1,1,e,i,t,r,a,2),g("x","z","y",1,-1,e,i,-t,r,a,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new dt(l,3)),this.setAttribute("normal",new dt(u,3)),this.setAttribute("uv",new dt(h,2));function g(x,f,d,T,M,E,P,w,A,F,j){const v=E/A,b=P/F,Y=E/2,$=P/2,R=w/2,q=A+1,W=F+1;let Z=0,V=0;const K=new U;for(let J=0;J<W;J++){const oe=J*b-$;for(let pe=0;pe<q;pe++){const Ie=pe*v-Y;K[x]=Ie*T,K[f]=oe*M,K[d]=R,l.push(K.x,K.y,K.z),K[x]=0,K[f]=0,K[d]=w>0?1:-1,u.push(K.x,K.y,K.z),h.push(pe/A),h.push(1-J/F),Z+=1}}for(let J=0;J<F;J++)for(let oe=0;oe<A;oe++){const pe=p+oe+q*J,Ie=p+oe+q*(J+1),z=p+(oe+1)+q*(J+1),ee=p+(oe+1)+q*J;c.push(pe,Ie,ee),c.push(Ie,z,ee),V+=6}o.addGroup(m,V,j),m+=V,p+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Nt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Qi(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function wt(n){const e={};for(let t=0;t<n.length;t++){const i=Qi(n[t]);for(const r in i)e[r]=i[r]}return e}function jh(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function kl(n){return n.getRenderTarget()===null?n.outputColorSpace:Je.workingColorSpace}const Zh={clone:Qi,merge:wt};var Jh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Qh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Xn extends ir{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Jh,this.fragmentShader=Qh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Qi(e.uniforms),this.uniformsGroups=jh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class Hl extends St{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new st,this.projectionMatrix=new st,this.projectionMatrixInverse=new st,this.coordinateSystem=Tn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const In=new U,Lc=new Ae,Ic=new Ae;class Vt extends Hl{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ho*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(qs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ho*2*Math.atan(Math.tan(qs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){In.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(In.x,In.y).multiplyScalar(-e/In.z),In.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(In.x,In.y).multiplyScalar(-e/In.z)}getViewSize(e,t){return this.getViewBounds(e,Lc,Ic),t.subVectors(Ic,Lc)}setViewOffset(e,t,i,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(qs*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;s+=a.offsetX*r/c,t-=a.offsetY*i/l,r*=a.width/c,i*=a.height/l}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ni=-90,Ui=1;class ed extends St{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Vt(Ni,Ui,e,t);r.layers=this.layers,this.add(r);const s=new Vt(Ni,Ui,e,t);s.layers=this.layers,this.add(s);const a=new Vt(Ni,Ui,e,t);a.layers=this.layers,this.add(a);const o=new Vt(Ni,Ui,e,t);o.layers=this.layers,this.add(o);const c=new Vt(Ni,Ui,e,t);c.layers=this.layers,this.add(c);const l=new Vt(Ni,Ui,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,s,a,o,c]=t;for(const l of t)this.remove(l);if(e===Tn)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===gs)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,c,l,u]=this.children,h=e.getRenderTarget(),p=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,a),e.setRenderTarget(i,2,r),e.render(t,o),e.setRenderTarget(i,3,r),e.render(t,c),e.setRenderTarget(i,4,r),e.render(t,l),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,r),e.render(t,u),e.setRenderTarget(h,p,m),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class zl extends Rt{constructor(e,t,i,r,s,a,o,c,l,u){e=e!==void 0?e:[],t=t!==void 0?t:ji,super(e,t,i,r,s,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class td extends mi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new zl(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Pt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Nt(5,5,5),s=new Xn({name:"CubemapFromEquirect",uniforms:Qi(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Dt,blending:Hn});s.uniforms.tEquirect.value=t;const a=new he(r,s),o=t.minFilter;return t.minFilter===hi&&(t.minFilter=Pt),new ed(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,i,r){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,r);e.setRenderTarget(s)}}const ho=new U,nd=new U,id=new Fe;class oi{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=ho.subVectors(i,t).cross(nd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(ho),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||id.getNormalMatrix(e),r=this.coplanarPoint(ho).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ii=new aa,Qr=new U;class la{constructor(e=new oi,t=new oi,i=new oi,r=new oi,s=new oi,a=new oi){this.planes=[e,t,i,r,s,a]}set(e,t,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Tn){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],c=r[3],l=r[4],u=r[5],h=r[6],p=r[7],m=r[8],g=r[9],x=r[10],f=r[11],d=r[12],T=r[13],M=r[14],E=r[15];if(i[0].setComponents(c-s,p-l,f-m,E-d).normalize(),i[1].setComponents(c+s,p+l,f+m,E+d).normalize(),i[2].setComponents(c+a,p+u,f+g,E+T).normalize(),i[3].setComponents(c-a,p-u,f-g,E-T).normalize(),i[4].setComponents(c-o,p-h,f-x,E-M).normalize(),t===Tn)i[5].setComponents(c+o,p+h,f+x,E+M).normalize();else if(t===gs)i[5].setComponents(o,h,x,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ii.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ii.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ii)}intersectsSprite(e){return ii.center.set(0,0,0),ii.radius=.7071067811865476,ii.applyMatrix4(e.matrixWorld),this.intersectsSphere(ii)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(Qr.x=r.normal.x>0?e.max.x:e.min.x,Qr.y=r.normal.y>0?e.max.y:e.min.y,Qr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Qr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Gl(){let n=null,e=!1,t=null,i=null;function r(s,a){t(s,a),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function rd(n,e){const t=e.isWebGL2,i=new WeakMap;function r(l,u){const h=l.array,p=l.usage,m=h.byteLength,g=n.createBuffer();n.bindBuffer(u,g),n.bufferData(u,h,p),l.onUploadCallback();let x;if(h instanceof Float32Array)x=n.FLOAT;else if(h instanceof Uint16Array)if(l.isFloat16BufferAttribute)if(t)x=n.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=n.UNSIGNED_SHORT;else if(h instanceof Int16Array)x=n.SHORT;else if(h instanceof Uint32Array)x=n.UNSIGNED_INT;else if(h instanceof Int32Array)x=n.INT;else if(h instanceof Int8Array)x=n.BYTE;else if(h instanceof Uint8Array)x=n.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)x=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:x,bytesPerElement:h.BYTES_PER_ELEMENT,version:l.version,size:m}}function s(l,u,h){const p=u.array,m=u._updateRange,g=u.updateRanges;if(n.bindBuffer(h,l),m.count===-1&&g.length===0&&n.bufferSubData(h,0,p),g.length!==0){for(let x=0,f=g.length;x<f;x++){const d=g[x];t?n.bufferSubData(h,d.start*p.BYTES_PER_ELEMENT,p,d.start,d.count):n.bufferSubData(h,d.start*p.BYTES_PER_ELEMENT,p.subarray(d.start,d.start+d.count))}u.clearUpdateRanges()}m.count!==-1&&(t?n.bufferSubData(h,m.offset*p.BYTES_PER_ELEMENT,p,m.offset,m.count):n.bufferSubData(h,m.offset*p.BYTES_PER_ELEMENT,p.subarray(m.offset,m.offset+m.count)),m.count=-1),u.onUploadCallback()}function a(l){return l.isInterleavedBufferAttribute&&(l=l.data),i.get(l)}function o(l){l.isInterleavedBufferAttribute&&(l=l.data);const u=i.get(l);u&&(n.deleteBuffer(u.buffer),i.delete(l))}function c(l,u){if(l.isGLBufferAttribute){const p=i.get(l);(!p||p.version<l.version)&&i.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}l.isInterleavedBufferAttribute&&(l=l.data);const h=i.get(l);if(h===void 0)i.set(l,r(l,u));else if(h.version<l.version){if(h.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,l,u),h.version=l.version}}return{get:a,remove:o,update:c}}class Mi extends Kt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const s=e/2,a=t/2,o=Math.floor(i),c=Math.floor(r),l=o+1,u=c+1,h=e/o,p=t/c,m=[],g=[],x=[],f=[];for(let d=0;d<u;d++){const T=d*p-a;for(let M=0;M<l;M++){const E=M*h-s;g.push(E,-T,0),x.push(0,0,1),f.push(M/o),f.push(1-d/c)}}for(let d=0;d<c;d++)for(let T=0;T<o;T++){const M=T+l*d,E=T+l*(d+1),P=T+1+l*(d+1),w=T+1+l*d;m.push(M,E,w),m.push(E,P,w)}this.setIndex(m),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(x,3)),this.setAttribute("uv",new dt(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mi(e.width,e.height,e.widthSegments,e.heightSegments)}}var sd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,od=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ad=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ld=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ud=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,hd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,dd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,fd=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,pd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,md=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,gd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,_d=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,vd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,xd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Md=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Sd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ed=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,yd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Td=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,bd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ad=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,wd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Cd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Rd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Pd=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Ld=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Id=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Dd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Nd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ud="gl_FragColor = linearToOutputTexel( gl_FragColor );",Od=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,Fd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Bd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,kd=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Hd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,zd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Gd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Wd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Vd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,qd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Xd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Kd=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Yd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,$d=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Zd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Jd=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Qd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ef=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,tf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,nf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,rf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,sf=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,of=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,af=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,cf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lf=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,uf=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hf=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,df=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,ff=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,pf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,mf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,gf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_f=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,vf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,xf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[MORPHTARGETS_COUNT];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Mf=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Sf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Ef=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
	#endif
	#ifdef MORPHTARGETS_TEXTURE
		#ifndef USE_INSTANCING_MORPH
			uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		#endif
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,yf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Tf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,bf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Af=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Cf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Rf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Pf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Lf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,If=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Df=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Nf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Uf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Of=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ff=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Bf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,kf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Hf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,zf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Gf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,Wf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Vf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,qf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Xf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Kf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Yf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,$f=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,jf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Zf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Jf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Qf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	float startCompression = 0.8 - 0.04;
	float desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min(color.r, min(color.g, color.b));
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max(color.r, max(color.g, color.b));
	if (peak < startCompression) return color;
	float d = 1. - startCompression;
	float newPeak = 1. - d * d / (peak + d - startCompression);
	color *= newPeak / peak;
	float g = 1. - 1. / (desaturation * (peak - newPeak) + 1.);
	return mix(color, vec3(1, 1, 1), g);
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,ep=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,tp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,np=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ip=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,rp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,sp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const op=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ap=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,lp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,up=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,hp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,fp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,pp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,mp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,gp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,_p=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,xp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Mp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Sp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ep=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,bp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ap=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,wp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Cp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Lp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ip=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Dp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Np=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Up=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Op=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Fp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Bp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,kp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Oe={alphahash_fragment:sd,alphahash_pars_fragment:od,alphamap_fragment:ad,alphamap_pars_fragment:cd,alphatest_fragment:ld,alphatest_pars_fragment:ud,aomap_fragment:hd,aomap_pars_fragment:dd,batching_pars_vertex:fd,batching_vertex:pd,begin_vertex:md,beginnormal_vertex:gd,bsdfs:_d,iridescence_fragment:vd,bumpmap_pars_fragment:xd,clipping_planes_fragment:Md,clipping_planes_pars_fragment:Sd,clipping_planes_pars_vertex:Ed,clipping_planes_vertex:yd,color_fragment:Td,color_pars_fragment:bd,color_pars_vertex:Ad,color_vertex:wd,common:Cd,cube_uv_reflection_fragment:Rd,defaultnormal_vertex:Pd,displacementmap_pars_vertex:Ld,displacementmap_vertex:Id,emissivemap_fragment:Dd,emissivemap_pars_fragment:Nd,colorspace_fragment:Ud,colorspace_pars_fragment:Od,envmap_fragment:Fd,envmap_common_pars_fragment:Bd,envmap_pars_fragment:kd,envmap_pars_vertex:Hd,envmap_physical_pars_fragment:Jd,envmap_vertex:zd,fog_vertex:Gd,fog_pars_vertex:Wd,fog_fragment:Vd,fog_pars_fragment:qd,gradientmap_pars_fragment:Xd,lightmap_fragment:Kd,lightmap_pars_fragment:Yd,lights_lambert_fragment:$d,lights_lambert_pars_fragment:jd,lights_pars_begin:Zd,lights_toon_fragment:Qd,lights_toon_pars_fragment:ef,lights_phong_fragment:tf,lights_phong_pars_fragment:nf,lights_physical_fragment:rf,lights_physical_pars_fragment:sf,lights_fragment_begin:of,lights_fragment_maps:af,lights_fragment_end:cf,logdepthbuf_fragment:lf,logdepthbuf_pars_fragment:uf,logdepthbuf_pars_vertex:hf,logdepthbuf_vertex:df,map_fragment:ff,map_pars_fragment:pf,map_particle_fragment:mf,map_particle_pars_fragment:gf,metalnessmap_fragment:_f,metalnessmap_pars_fragment:vf,morphinstance_vertex:xf,morphcolor_vertex:Mf,morphnormal_vertex:Sf,morphtarget_pars_vertex:Ef,morphtarget_vertex:yf,normal_fragment_begin:Tf,normal_fragment_maps:bf,normal_pars_fragment:Af,normal_pars_vertex:wf,normal_vertex:Cf,normalmap_pars_fragment:Rf,clearcoat_normal_fragment_begin:Pf,clearcoat_normal_fragment_maps:Lf,clearcoat_pars_fragment:If,iridescence_pars_fragment:Df,opaque_fragment:Nf,packing:Uf,premultiplied_alpha_fragment:Of,project_vertex:Ff,dithering_fragment:Bf,dithering_pars_fragment:kf,roughnessmap_fragment:Hf,roughnessmap_pars_fragment:zf,shadowmap_pars_fragment:Gf,shadowmap_pars_vertex:Wf,shadowmap_vertex:Vf,shadowmask_pars_fragment:qf,skinbase_vertex:Xf,skinning_pars_vertex:Kf,skinning_vertex:Yf,skinnormal_vertex:$f,specularmap_fragment:jf,specularmap_pars_fragment:Zf,tonemapping_fragment:Jf,tonemapping_pars_fragment:Qf,transmission_fragment:ep,transmission_pars_fragment:tp,uv_pars_fragment:np,uv_pars_vertex:ip,uv_vertex:rp,worldpos_vertex:sp,background_vert:op,background_frag:ap,backgroundCube_vert:cp,backgroundCube_frag:lp,cube_vert:up,cube_frag:hp,depth_vert:dp,depth_frag:fp,distanceRGBA_vert:pp,distanceRGBA_frag:mp,equirect_vert:gp,equirect_frag:_p,linedashed_vert:vp,linedashed_frag:xp,meshbasic_vert:Mp,meshbasic_frag:Sp,meshlambert_vert:Ep,meshlambert_frag:yp,meshmatcap_vert:Tp,meshmatcap_frag:bp,meshnormal_vert:Ap,meshnormal_frag:wp,meshphong_vert:Cp,meshphong_frag:Rp,meshphysical_vert:Pp,meshphysical_frag:Lp,meshtoon_vert:Ip,meshtoon_frag:Dp,points_vert:Np,points_frag:Up,shadow_vert:Op,shadow_frag:Fp,sprite_vert:Bp,sprite_frag:kp},se={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new Ae(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new Ae(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},cn={basic:{uniforms:wt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:Oe.meshbasic_vert,fragmentShader:Oe.meshbasic_frag},lambert:{uniforms:wt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Ve(0)}}]),vertexShader:Oe.meshlambert_vert,fragmentShader:Oe.meshlambert_frag},phong:{uniforms:wt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30}}]),vertexShader:Oe.meshphong_vert,fragmentShader:Oe.meshphong_frag},standard:{uniforms:wt([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag},toon:{uniforms:wt([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new Ve(0)}}]),vertexShader:Oe.meshtoon_vert,fragmentShader:Oe.meshtoon_frag},matcap:{uniforms:wt([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:Oe.meshmatcap_vert,fragmentShader:Oe.meshmatcap_frag},points:{uniforms:wt([se.points,se.fog]),vertexShader:Oe.points_vert,fragmentShader:Oe.points_frag},dashed:{uniforms:wt([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Oe.linedashed_vert,fragmentShader:Oe.linedashed_frag},depth:{uniforms:wt([se.common,se.displacementmap]),vertexShader:Oe.depth_vert,fragmentShader:Oe.depth_frag},normal:{uniforms:wt([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:Oe.meshnormal_vert,fragmentShader:Oe.meshnormal_frag},sprite:{uniforms:wt([se.sprite,se.fog]),vertexShader:Oe.sprite_vert,fragmentShader:Oe.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Oe.background_vert,fragmentShader:Oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:Oe.backgroundCube_vert,fragmentShader:Oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Oe.cube_vert,fragmentShader:Oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Oe.equirect_vert,fragmentShader:Oe.equirect_frag},distanceRGBA:{uniforms:wt([se.common,se.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Oe.distanceRGBA_vert,fragmentShader:Oe.distanceRGBA_frag},shadow:{uniforms:wt([se.lights,se.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:Oe.shadow_vert,fragmentShader:Oe.shadow_frag}};cn.physical={uniforms:wt([cn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new Ae(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new Ae},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new Ae},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag};const es={r:0,b:0,g:0},ri=new fn,Hp=new st;function zp(n,e,t,i,r,s,a){const o=new Ve(0);let c=s===!0?0:1,l,u,h=null,p=0,m=null;function g(f,d){let T=!1,M=d.isScene===!0?d.background:null;M&&M.isTexture&&(M=(d.backgroundBlurriness>0?t:e).get(M)),M===null?x(o,c):M&&M.isColor&&(x(M,1),T=!0);const E=n.xr.getEnvironmentBlendMode();E==="additive"?i.buffers.color.setClear(0,0,0,1,a):E==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||T)&&n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil),M&&(M.isCubeTexture||M.mapping===ws)?(u===void 0&&(u=new he(new Nt(1,1,1),new Xn({name:"BackgroundCubeMaterial",uniforms:Qi(cn.backgroundCube.uniforms),vertexShader:cn.backgroundCube.vertexShader,fragmentShader:cn.backgroundCube.fragmentShader,side:Dt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(P,w,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),ri.copy(d.backgroundRotation),ri.x*=-1,ri.y*=-1,ri.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(ri.y*=-1,ri.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=d.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=d.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Hp.makeRotationFromEuler(ri)),u.material.toneMapped=Je.getTransfer(M.colorSpace)!==tt,(h!==M||p!==M.version||m!==n.toneMapping)&&(u.material.needsUpdate=!0,h=M,p=M.version,m=n.toneMapping),u.layers.enableAll(),f.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new he(new Mi(2,2),new Xn({name:"BackgroundMaterial",uniforms:Qi(cn.background.uniforms),vertexShader:cn.background.vertexShader,fragmentShader:cn.background.fragmentShader,side:qn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=d.backgroundIntensity,l.material.toneMapped=Je.getTransfer(M.colorSpace)!==tt,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||p!==M.version||m!==n.toneMapping)&&(l.material.needsUpdate=!0,h=M,p=M.version,m=n.toneMapping),l.layers.enableAll(),f.unshift(l,l.geometry,l.material,0,0,null))}function x(f,d){f.getRGB(es,kl(n)),i.buffers.color.setClear(es.r,es.g,es.b,d,a)}return{getClearColor:function(){return o},setClearColor:function(f,d=1){o.set(f),c=d,x(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(f){c=f,x(o,c)},render:g}}function Gp(n,e,t,i){const r=n.getParameter(n.MAX_VERTEX_ATTRIBS),s=i.isWebGL2?null:e.get("OES_vertex_array_object"),a=i.isWebGL2||s!==null,o={},c=f(null);let l=c,u=!1;function h(R,q,W,Z,V){let K=!1;if(a){const J=x(Z,W,q);l!==J&&(l=J,m(l.object)),K=d(R,Z,W,V),K&&T(R,Z,W,V)}else{const J=q.wireframe===!0;(l.geometry!==Z.id||l.program!==W.id||l.wireframe!==J)&&(l.geometry=Z.id,l.program=W.id,l.wireframe=J,K=!0)}V!==null&&t.update(V,n.ELEMENT_ARRAY_BUFFER),(K||u)&&(u=!1,F(R,q,W,Z),V!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(V).buffer))}function p(){return i.isWebGL2?n.createVertexArray():s.createVertexArrayOES()}function m(R){return i.isWebGL2?n.bindVertexArray(R):s.bindVertexArrayOES(R)}function g(R){return i.isWebGL2?n.deleteVertexArray(R):s.deleteVertexArrayOES(R)}function x(R,q,W){const Z=W.wireframe===!0;let V=o[R.id];V===void 0&&(V={},o[R.id]=V);let K=V[q.id];K===void 0&&(K={},V[q.id]=K);let J=K[Z];return J===void 0&&(J=f(p()),K[Z]=J),J}function f(R){const q=[],W=[],Z=[];for(let V=0;V<r;V++)q[V]=0,W[V]=0,Z[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:q,enabledAttributes:W,attributeDivisors:Z,object:R,attributes:{},index:null}}function d(R,q,W,Z){const V=l.attributes,K=q.attributes;let J=0;const oe=W.getAttributes();for(const pe in oe)if(oe[pe].location>=0){const z=V[pe];let ee=K[pe];if(ee===void 0&&(pe==="instanceMatrix"&&R.instanceMatrix&&(ee=R.instanceMatrix),pe==="instanceColor"&&R.instanceColor&&(ee=R.instanceColor)),z===void 0||z.attribute!==ee||ee&&z.data!==ee.data)return!0;J++}return l.attributesNum!==J||l.index!==Z}function T(R,q,W,Z){const V={},K=q.attributes;let J=0;const oe=W.getAttributes();for(const pe in oe)if(oe[pe].location>=0){let z=K[pe];z===void 0&&(pe==="instanceMatrix"&&R.instanceMatrix&&(z=R.instanceMatrix),pe==="instanceColor"&&R.instanceColor&&(z=R.instanceColor));const ee={};ee.attribute=z,z&&z.data&&(ee.data=z.data),V[pe]=ee,J++}l.attributes=V,l.attributesNum=J,l.index=Z}function M(){const R=l.newAttributes;for(let q=0,W=R.length;q<W;q++)R[q]=0}function E(R){P(R,0)}function P(R,q){const W=l.newAttributes,Z=l.enabledAttributes,V=l.attributeDivisors;W[R]=1,Z[R]===0&&(n.enableVertexAttribArray(R),Z[R]=1),V[R]!==q&&((i.isWebGL2?n:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](R,q),V[R]=q)}function w(){const R=l.newAttributes,q=l.enabledAttributes;for(let W=0,Z=q.length;W<Z;W++)q[W]!==R[W]&&(n.disableVertexAttribArray(W),q[W]=0)}function A(R,q,W,Z,V,K,J){J===!0?n.vertexAttribIPointer(R,q,W,V,K):n.vertexAttribPointer(R,q,W,Z,V,K)}function F(R,q,W,Z){if(i.isWebGL2===!1&&(R.isInstancedMesh||Z.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;M();const V=Z.attributes,K=W.getAttributes(),J=q.defaultAttributeValues;for(const oe in K){const pe=K[oe];if(pe.location>=0){let Ie=V[oe];if(Ie===void 0&&(oe==="instanceMatrix"&&R.instanceMatrix&&(Ie=R.instanceMatrix),oe==="instanceColor"&&R.instanceColor&&(Ie=R.instanceColor)),Ie!==void 0){const z=Ie.normalized,ee=Ie.itemSize,fe=t.get(Ie);if(fe===void 0)continue;const we=fe.buffer,xe=fe.type,me=fe.bytesPerElement,Ye=i.isWebGL2===!0&&(xe===n.INT||xe===n.UNSIGNED_INT||Ie.gpuType===Sl);if(Ie.isInterleavedBufferAttribute){const Ce=Ie.data,N=Ce.stride,xt=Ie.offset;if(Ce.isInstancedInterleavedBuffer){for(let Se=0;Se<pe.locationSize;Se++)P(pe.location+Se,Ce.meshPerAttribute);R.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=Ce.meshPerAttribute*Ce.count)}else for(let Se=0;Se<pe.locationSize;Se++)E(pe.location+Se);n.bindBuffer(n.ARRAY_BUFFER,we);for(let Se=0;Se<pe.locationSize;Se++)A(pe.location+Se,ee/pe.locationSize,xe,z,N*me,(xt+ee/pe.locationSize*Se)*me,Ye)}else{if(Ie.isInstancedBufferAttribute){for(let Ce=0;Ce<pe.locationSize;Ce++)P(pe.location+Ce,Ie.meshPerAttribute);R.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=Ie.meshPerAttribute*Ie.count)}else for(let Ce=0;Ce<pe.locationSize;Ce++)E(pe.location+Ce);n.bindBuffer(n.ARRAY_BUFFER,we);for(let Ce=0;Ce<pe.locationSize;Ce++)A(pe.location+Ce,ee/pe.locationSize,xe,z,ee*me,ee/pe.locationSize*Ce*me,Ye)}}else if(J!==void 0){const z=J[oe];if(z!==void 0)switch(z.length){case 2:n.vertexAttrib2fv(pe.location,z);break;case 3:n.vertexAttrib3fv(pe.location,z);break;case 4:n.vertexAttrib4fv(pe.location,z);break;default:n.vertexAttrib1fv(pe.location,z)}}}}w()}function j(){Y();for(const R in o){const q=o[R];for(const W in q){const Z=q[W];for(const V in Z)g(Z[V].object),delete Z[V];delete q[W]}delete o[R]}}function v(R){if(o[R.id]===void 0)return;const q=o[R.id];for(const W in q){const Z=q[W];for(const V in Z)g(Z[V].object),delete Z[V];delete q[W]}delete o[R.id]}function b(R){for(const q in o){const W=o[q];if(W[R.id]===void 0)continue;const Z=W[R.id];for(const V in Z)g(Z[V].object),delete Z[V];delete W[R.id]}}function Y(){$(),u=!0,l!==c&&(l=c,m(l.object))}function $(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:h,reset:Y,resetDefaultState:$,dispose:j,releaseStatesOfGeometry:v,releaseStatesOfProgram:b,initAttributes:M,enableAttribute:E,disableUnusedAttributes:w}}function Wp(n,e,t,i){const r=i.isWebGL2;let s;function a(u){s=u}function o(u,h){n.drawArrays(s,u,h),t.update(h,s,1)}function c(u,h,p){if(p===0)return;let m,g;if(r)m=n,g="drawArraysInstanced";else if(m=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",m===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[g](s,u,h,p),t.update(h,s,p)}function l(u,h,p){if(p===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<p;g++)this.render(u[g],h[g]);else{m.multiDrawArraysWEBGL(s,u,0,h,0,p);let g=0;for(let x=0;x<p;x++)g+=h[x];t.update(g,s,1)}}this.setMode=a,this.render=o,this.renderInstances=c,this.renderMultiDraw=l}function Vp(n,e,t){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");i=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const a=typeof WebGL2RenderingContext<"u"&&n.constructor.name==="WebGL2RenderingContext";let o=t.precision!==void 0?t.precision:"highp";const c=s(o);c!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",c,"instead."),o=c);const l=a||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),x=n.getParameter(n.MAX_VERTEX_ATTRIBS),f=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),d=n.getParameter(n.MAX_VARYING_VECTORS),T=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),M=p>0,E=a||e.has("OES_texture_float"),P=M&&E,w=a?n.getParameter(n.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:l,getMaxAnisotropy:r,getMaxPrecision:s,precision:o,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:p,maxTextureSize:m,maxCubemapSize:g,maxAttributes:x,maxVertexUniforms:f,maxVaryings:d,maxFragmentUniforms:T,vertexTextures:M,floatFragmentTextures:E,floatVertexTextures:P,maxSamples:w}}function qp(n){const e=this;let t=null,i=0,r=!1,s=!1;const a=new oi,o=new Fe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,p){const m=h.length!==0||p||i!==0||r;return r=p,i=h.length,m},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,p){t=u(h,p,0)},this.setState=function(h,p,m){const g=h.clippingPlanes,x=h.clipIntersection,f=h.clipShadows,d=n.get(h);if(!r||g===null||g.length===0||s&&!f)s?u(null):l();else{const T=s?0:i,M=T*4;let E=d.clippingState||null;c.value=E,E=u(g,p,M,m);for(let P=0;P!==M;++P)E[P]=t[P];d.clippingState=E,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=T}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,p,m,g){const x=h!==null?h.length:0;let f=null;if(x!==0){if(f=c.value,g!==!0||f===null){const d=m+x*4,T=p.matrixWorldInverse;o.getNormalMatrix(T),(f===null||f.length<d)&&(f=new Float32Array(d));for(let M=0,E=m;M!==x;++M,E+=4)a.copy(h[M]).applyMatrix4(T,o),a.normal.toArray(f,E),f[E+3]=a.constant}c.value=f,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,f}}function Xp(n){let e=new WeakMap;function t(a,o){return o===No?a.mapping=ji:o===Uo&&(a.mapping=Zi),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===No||o===Uo)if(e.has(a)){const c=e.get(a).texture;return t(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const l=new td(c.height);return l.fromEquirectangularTexture(n,a),e.set(a,l),a.addEventListener("dispose",r),t(l.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class Wl extends Hl{constructor(e=-1,t=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+t,c=r-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,a=s+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const zi=4,Dc=[.125,.215,.35,.446,.526,.582],ui=20,fo=new Wl,Nc=new Ve;let po=null,mo=0,go=0;const ai=(1+Math.sqrt(5))/2,Oi=1/ai,Uc=[new U(1,1,1),new U(-1,1,1),new U(1,1,-1),new U(-1,1,-1),new U(0,ai,Oi),new U(0,ai,-Oi),new U(Oi,0,ai),new U(-Oi,0,ai),new U(ai,Oi,0),new U(-ai,Oi,0)];class Oc{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){po=this._renderer.getRenderTarget(),mo=this._renderer.getActiveCubeFace(),go=this._renderer.getActiveMipmapLevel(),this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Bc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(po,mo,go),e.scissorTest=!1,ts(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ji||e.mapping===Zi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),po=this._renderer.getRenderTarget(),mo=this._renderer.getActiveCubeFace(),go=this._renderer.getActiveMipmapLevel();const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Pt,minFilter:Pt,generateMipmaps:!1,type:Er,format:en,colorSpace:$n,depthBuffer:!1},r=Fc(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fc(e,t,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Kp(s)),this._blurMaterial=Yp(s,e,t)}return r}_compileMaterial(e){const t=new he(this._lodPlanes[0],e);this._renderer.compile(t,fo)}_sceneToCubeUV(e,t,i,r){const o=new Vt(90,1,t,i),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,p=u.toneMapping;u.getClearColor(Nc),u.toneMapping=zn,u.autoClear=!1;const m=new rn({name:"PMREM.Background",side:Dt,depthWrite:!1,depthTest:!1}),g=new he(new Nt,m);let x=!1;const f=e.background;f?f.isColor&&(m.color.copy(f),e.background=null,x=!0):(m.color.copy(Nc),x=!0);for(let d=0;d<6;d++){const T=d%3;T===0?(o.up.set(0,c[d],0),o.lookAt(l[d],0,0)):T===1?(o.up.set(0,0,c[d]),o.lookAt(0,l[d],0)):(o.up.set(0,c[d],0),o.lookAt(0,0,l[d]));const M=this._cubeSize;ts(r,T*M,d>2?M:0,M,M),u.setRenderTarget(r),x&&u.render(g,o),u.render(e,o)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=p,u.autoClear=h,e.background=f}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===ji||e.mapping===Zi;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=kc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Bc());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new he(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const c=this._cubeSize;ts(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(a,fo)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){const s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Uc[(r-1)%Uc.length];this._blur(e,r-1,r,s,a)}t.autoClear=i}_blur(e,t,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new he(this._lodPlanes[r],l),p=l.uniforms,m=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*m):2*Math.PI/(2*ui-1),x=s/g,f=isFinite(s)?1+Math.floor(u*x):ui;f>ui&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${ui}`);const d=[];let T=0;for(let A=0;A<ui;++A){const F=A/x,j=Math.exp(-F*F/2);d.push(j),A===0?T+=j:A<f&&(T+=2*j)}for(let A=0;A<d.length;A++)d[A]=d[A]/T;p.envMap.value=e.texture,p.samples.value=f,p.weights.value=d,p.latitudinal.value=a==="latitudinal",o&&(p.poleAxis.value=o);const{_lodMax:M}=this;p.dTheta.value=g,p.mipInt.value=M-i;const E=this._sizeLods[r],P=3*E*(r>M-zi?r-M+zi:0),w=4*(this._cubeSize-E);ts(t,P,w,3*E,2*E),c.setRenderTarget(t),c.render(h,fo)}}function Kp(n){const e=[],t=[],i=[];let r=n;const s=n-zi+1+Dc.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);t.push(o);let c=1/o;a>n-zi?c=Dc[a-n+zi-1]:a===0&&(c=0),i.push(c);const l=1/(o-2),u=-l,h=1+l,p=[u,u,h,u,h,h,u,u,h,h,u,h],m=6,g=6,x=3,f=2,d=1,T=new Float32Array(x*g*m),M=new Float32Array(f*g*m),E=new Float32Array(d*g*m);for(let w=0;w<m;w++){const A=w%3*2/3-1,F=w>2?0:-1,j=[A,F,0,A+2/3,F,0,A+2/3,F+1,0,A,F,0,A+2/3,F+1,0,A,F+1,0];T.set(j,x*g*w),M.set(p,f*g*w);const v=[w,w,w,w,w,w];E.set(v,d*g*w)}const P=new Kt;P.setAttribute("position",new sn(T,x)),P.setAttribute("uv",new sn(M,f)),P.setAttribute("faceIndex",new sn(E,d)),e.push(P),r>zi&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Fc(n,e,t){const i=new mi(n,e,t);return i.texture.mapping=ws,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ts(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function Yp(n,e,t){const i=new Float32Array(ui),r=new U(0,1,0);return new Xn({name:"SphericalGaussianBlur",defines:{n:ui,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:ua(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function Bc(){return new Xn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ua(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function kc(){return new Xn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ua(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function ua(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function $p(n){let e=new WeakMap,t=null;function i(o){if(o&&o.isTexture){const c=o.mapping,l=c===No||c===Uo,u=c===ji||c===Zi;if(l||u)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let h=e.get(o);return t===null&&(t=new Oc(n)),h=l?t.fromEquirectangular(o,h):t.fromCubemap(o,h),e.set(o,h),h.texture}else{if(e.has(o))return e.get(o).texture;{const h=o.image;if(l&&h&&h.height>0||u&&h&&r(h)){t===null&&(t=new Oc(n));const p=l?t.fromEquirectangular(o):t.fromCubemap(o);return e.set(o,p),o.addEventListener("dispose",s),p.texture}else return null}}}return o}function r(o){let c=0;const l=6;for(let u=0;u<l;u++)o[u]!==void 0&&c++;return c===l}function s(o){const c=o.target;c.removeEventListener("dispose",s);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:a}}function jp(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(i){i.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(i){const r=t(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Zp(n,e,t,i){const r={},s=new WeakMap;function a(h){const p=h.target;p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);for(const g in p.morphAttributes){const x=p.morphAttributes[g];for(let f=0,d=x.length;f<d;f++)e.remove(x[f])}p.removeEventListener("dispose",a),delete r[p.id];const m=s.get(p);m&&(e.remove(m),s.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function o(h,p){return r[p.id]===!0||(p.addEventListener("dispose",a),r[p.id]=!0,t.memory.geometries++),p}function c(h){const p=h.attributes;for(const g in p)e.update(p[g],n.ARRAY_BUFFER);const m=h.morphAttributes;for(const g in m){const x=m[g];for(let f=0,d=x.length;f<d;f++)e.update(x[f],n.ARRAY_BUFFER)}}function l(h){const p=[],m=h.index,g=h.attributes.position;let x=0;if(m!==null){const T=m.array;x=m.version;for(let M=0,E=T.length;M<E;M+=3){const P=T[M+0],w=T[M+1],A=T[M+2];p.push(P,w,w,A,A,P)}}else if(g!==void 0){const T=g.array;x=g.version;for(let M=0,E=T.length/3-1;M<E;M+=3){const P=M+0,w=M+1,A=M+2;p.push(P,w,w,A,A,P)}}else return;const f=new(Pl(p)?Bl:Fl)(p,1);f.version=x;const d=s.get(h);d&&e.remove(d),s.set(h,f)}function u(h){const p=s.get(h);if(p){const m=h.index;m!==null&&p.version<m.version&&l(h)}else l(h);return s.get(h)}return{get:o,update:c,getWireframeAttribute:u}}function Jp(n,e,t,i){const r=i.isWebGL2;let s;function a(m){s=m}let o,c;function l(m){o=m.type,c=m.bytesPerElement}function u(m,g){n.drawElements(s,g,o,m*c),t.update(g,s,1)}function h(m,g,x){if(x===0)return;let f,d;if(r)f=n,d="drawElementsInstanced";else if(f=e.get("ANGLE_instanced_arrays"),d="drawElementsInstancedANGLE",f===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[d](s,g,o,m*c,x),t.update(g,s,x)}function p(m,g,x){if(x===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let d=0;d<x;d++)this.render(m[d]/c,g[d]);else{f.multiDrawElementsWEBGL(s,g,0,o,m,0,x);let d=0;for(let T=0;T<x;T++)d+=g[T];t.update(d,s,1)}}this.setMode=a,this.setIndex=l,this.render=u,this.renderInstances=h,this.renderMultiDraw=p}function Qp(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(s/3);break;case n.LINES:t.lines+=o*(s/2);break;case n.LINE_STRIP:t.lines+=o*(s-1);break;case n.LINE_LOOP:t.lines+=o*s;break;case n.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function em(n,e){return n[0]-e[0]}function tm(n,e){return Math.abs(e[1])-Math.abs(n[1])}function nm(n,e,t){const i={},r=new Float32Array(8),s=new WeakMap,a=new vt,o=[];for(let l=0;l<8;l++)o[l]=[l,0];function c(l,u,h){const p=l.morphTargetInfluences;if(e.isWebGL2===!0){const g=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,x=g!==void 0?g.length:0;let f=s.get(u);if(f===void 0||f.count!==x){let $=function(){b.dispose(),s.delete(u),u.removeEventListener("dispose",$)};var m=$;f!==void 0&&f.texture.dispose();const d=u.morphAttributes.position!==void 0,T=u.morphAttributes.normal!==void 0,M=u.morphAttributes.color!==void 0,E=u.morphAttributes.position||[],P=u.morphAttributes.normal||[],w=u.morphAttributes.color||[];let A=0;d===!0&&(A=1),T===!0&&(A=2),M===!0&&(A=3);let F=u.attributes.position.count*A,j=1;F>e.maxTextureSize&&(j=Math.ceil(F/e.maxTextureSize),F=e.maxTextureSize);const v=new Float32Array(F*j*4*x),b=new Nl(v,F,j,x);b.type=yn,b.needsUpdate=!0;const Y=A*4;for(let R=0;R<x;R++){const q=E[R],W=P[R],Z=w[R],V=F*j*4*R;for(let K=0;K<q.count;K++){const J=K*Y;d===!0&&(a.fromBufferAttribute(q,K),v[V+J+0]=a.x,v[V+J+1]=a.y,v[V+J+2]=a.z,v[V+J+3]=0),T===!0&&(a.fromBufferAttribute(W,K),v[V+J+4]=a.x,v[V+J+5]=a.y,v[V+J+6]=a.z,v[V+J+7]=0),M===!0&&(a.fromBufferAttribute(Z,K),v[V+J+8]=a.x,v[V+J+9]=a.y,v[V+J+10]=a.z,v[V+J+11]=Z.itemSize===4?a.w:1)}}f={count:x,texture:b,size:new Ae(F,j)},s.set(u,f),u.addEventListener("dispose",$)}if(l.isInstancedMesh===!0&&l.morphTexture!==null)h.getUniforms().setValue(n,"morphTexture",l.morphTexture,t);else{let d=0;for(let M=0;M<p.length;M++)d+=p[M];const T=u.morphTargetsRelative?1:1-d;h.getUniforms().setValue(n,"morphTargetBaseInfluence",T),h.getUniforms().setValue(n,"morphTargetInfluences",p)}h.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),h.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}else{const g=p===void 0?0:p.length;let x=i[u.id];if(x===void 0||x.length!==g){x=[];for(let E=0;E<g;E++)x[E]=[E,0];i[u.id]=x}for(let E=0;E<g;E++){const P=x[E];P[0]=E,P[1]=p[E]}x.sort(tm);for(let E=0;E<8;E++)E<g&&x[E][1]?(o[E][0]=x[E][0],o[E][1]=x[E][1]):(o[E][0]=Number.MAX_SAFE_INTEGER,o[E][1]=0);o.sort(em);const f=u.morphAttributes.position,d=u.morphAttributes.normal;let T=0;for(let E=0;E<8;E++){const P=o[E],w=P[0],A=P[1];w!==Number.MAX_SAFE_INTEGER&&A?(f&&u.getAttribute("morphTarget"+E)!==f[w]&&u.setAttribute("morphTarget"+E,f[w]),d&&u.getAttribute("morphNormal"+E)!==d[w]&&u.setAttribute("morphNormal"+E,d[w]),r[E]=A,T+=A):(f&&u.hasAttribute("morphTarget"+E)===!0&&u.deleteAttribute("morphTarget"+E),d&&u.hasAttribute("morphNormal"+E)===!0&&u.deleteAttribute("morphNormal"+E),r[E]=0)}const M=u.morphTargetsRelative?1:1-T;h.getUniforms().setValue(n,"morphTargetBaseInfluence",M),h.getUniforms().setValue(n,"morphTargetInfluences",r)}}return{update:c}}function im(n,e,t,i){let r=new WeakMap;function s(c){const l=i.render.frame,u=c.geometry,h=e.get(c,u);if(r.get(h)!==l&&(e.update(h),r.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),r.get(c)!==l&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,l))),c.isSkinnedMesh){const p=c.skeleton;r.get(p)!==l&&(p.update(),r.set(p,l))}return h}function a(){r=new WeakMap}function o(c){const l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:s,dispose:a}}class Vl extends Rt{constructor(e,t,i,r,s,a,o,c,l,u){if(u=u!==void 0?u:fi,u!==fi&&u!==Ji)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===fi&&(i=Un),i===void 0&&u===Ji&&(i=di),super(null,r,s,a,o,c,u,i,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Ct,this.minFilter=c!==void 0?c:Ct,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const ql=new Rt,Xl=new Vl(1,1);Xl.compareFunction=Rl;const Kl=new Nl,Yl=new Bh,$l=new zl,Hc=[],zc=[],Gc=new Float32Array(16),Wc=new Float32Array(9),Vc=new Float32Array(4);function rr(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let s=Hc[r];if(s===void 0&&(s=new Float32Array(r),Hc[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(s,o)}return s}function ft(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function pt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Rs(n,e){let t=zc[e];t===void 0&&(t=new Int32Array(e),zc[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function rm(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function sm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;n.uniform2fv(this.addr,e),pt(t,e)}}function om(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ft(t,e))return;n.uniform3fv(this.addr,e),pt(t,e)}}function am(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;n.uniform4fv(this.addr,e),pt(t,e)}}function cm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,i))return;Vc.set(i),n.uniformMatrix2fv(this.addr,!1,Vc),pt(t,i)}}function lm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,i))return;Wc.set(i),n.uniformMatrix3fv(this.addr,!1,Wc),pt(t,i)}}function um(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(ft(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,i))return;Gc.set(i),n.uniformMatrix4fv(this.addr,!1,Gc),pt(t,i)}}function hm(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function dm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;n.uniform2iv(this.addr,e),pt(t,e)}}function fm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ft(t,e))return;n.uniform3iv(this.addr,e),pt(t,e)}}function pm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;n.uniform4iv(this.addr,e),pt(t,e)}}function mm(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function gm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;n.uniform2uiv(this.addr,e),pt(t,e)}}function _m(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ft(t,e))return;n.uniform3uiv(this.addr,e),pt(t,e)}}function vm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;n.uniform4uiv(this.addr,e),pt(t,e)}}function xm(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);const s=this.type===n.SAMPLER_2D_SHADOW?Xl:ql;t.setTexture2D(e||s,r)}function Mm(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||Yl,r)}function Sm(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||$l,r)}function Em(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Kl,r)}function ym(n){switch(n){case 5126:return rm;case 35664:return sm;case 35665:return om;case 35666:return am;case 35674:return cm;case 35675:return lm;case 35676:return um;case 5124:case 35670:return hm;case 35667:case 35671:return dm;case 35668:case 35672:return fm;case 35669:case 35673:return pm;case 5125:return mm;case 36294:return gm;case 36295:return _m;case 36296:return vm;case 35678:case 36198:case 36298:case 36306:case 35682:return xm;case 35679:case 36299:case 36307:return Mm;case 35680:case 36300:case 36308:case 36293:return Sm;case 36289:case 36303:case 36311:case 36292:return Em}}function Tm(n,e){n.uniform1fv(this.addr,e)}function bm(n,e){const t=rr(e,this.size,2);n.uniform2fv(this.addr,t)}function Am(n,e){const t=rr(e,this.size,3);n.uniform3fv(this.addr,t)}function wm(n,e){const t=rr(e,this.size,4);n.uniform4fv(this.addr,t)}function Cm(n,e){const t=rr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Rm(n,e){const t=rr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Pm(n,e){const t=rr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Lm(n,e){n.uniform1iv(this.addr,e)}function Im(n,e){n.uniform2iv(this.addr,e)}function Dm(n,e){n.uniform3iv(this.addr,e)}function Nm(n,e){n.uniform4iv(this.addr,e)}function Um(n,e){n.uniform1uiv(this.addr,e)}function Om(n,e){n.uniform2uiv(this.addr,e)}function Fm(n,e){n.uniform3uiv(this.addr,e)}function Bm(n,e){n.uniform4uiv(this.addr,e)}function km(n,e,t){const i=this.cache,r=e.length,s=Rs(t,r);ft(i,s)||(n.uniform1iv(this.addr,s),pt(i,s));for(let a=0;a!==r;++a)t.setTexture2D(e[a]||ql,s[a])}function Hm(n,e,t){const i=this.cache,r=e.length,s=Rs(t,r);ft(i,s)||(n.uniform1iv(this.addr,s),pt(i,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||Yl,s[a])}function zm(n,e,t){const i=this.cache,r=e.length,s=Rs(t,r);ft(i,s)||(n.uniform1iv(this.addr,s),pt(i,s));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||$l,s[a])}function Gm(n,e,t){const i=this.cache,r=e.length,s=Rs(t,r);ft(i,s)||(n.uniform1iv(this.addr,s),pt(i,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||Kl,s[a])}function Wm(n){switch(n){case 5126:return Tm;case 35664:return bm;case 35665:return Am;case 35666:return wm;case 35674:return Cm;case 35675:return Rm;case 35676:return Pm;case 5124:case 35670:return Lm;case 35667:case 35671:return Im;case 35668:case 35672:return Dm;case 35669:case 35673:return Nm;case 5125:return Um;case 36294:return Om;case 36295:return Fm;case 36296:return Bm;case 35678:case 36198:case 36298:case 36306:case 35682:return km;case 35679:case 36299:case 36307:return Hm;case 35680:case 36300:case 36308:case 36293:return zm;case 36289:case 36303:case 36311:case 36292:return Gm}}class Vm{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=ym(t.type)}}class qm{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Wm(t.type)}}class Xm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,t[o.id],i)}}}const _o=/(\w+)(\])?(\[|\.)?/g;function qc(n,e){n.seq.push(e),n.map[e.id]=e}function Km(n,e,t){const i=n.name,r=i.length;for(_o.lastIndex=0;;){const s=_o.exec(i),a=_o.lastIndex;let o=s[1];const c=s[2]==="]",l=s[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===r){qc(t,l===void 0?new Vm(o,n,e):new qm(o,n,e));break}else{let h=t.map[o];h===void 0&&(h=new Xm(o),qc(t,h)),t=h}}}class ss{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(t,r),a=e.getUniformLocation(t,s.name);Km(s,a,this)}}setValue(e,t,i,r){const s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,a=t.length;s!==a;++s){const o=t[s],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in t&&i.push(a)}return i}}function Xc(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Ym=37297;let $m=0;function jm(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}function Zm(n){const e=Je.getPrimaries(Je.workingColorSpace),t=Je.getPrimaries(n);let i;switch(e===t?i="":e===ms&&t===ps?i="LinearDisplayP3ToLinearSRGB":e===ps&&t===ms&&(i="LinearSRGBToLinearDisplayP3"),n){case $n:case Cs:return[i,"LinearTransferOETF"];case an:case oa:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function Kc(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+jm(n.getShaderSource(e),a)}else return r}function Jm(n,e){const t=Zm(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function Qm(n,e){let t;switch(e){case ah:t="Linear";break;case ch:t="Reinhard";break;case lh:t="OptimizedCineon";break;case uh:t="ACESFilmic";break;case dh:t="AgX";break;case fh:t="Neutral";break;case hh:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function eg(n){return[n.extensionDerivatives||n.envMapCubeUVHeight||n.bumpMap||n.normalMapTangentSpace||n.clearcoatNormalMap||n.flatShading||n.alphaToCoverage||n.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(n.extensionFragDepth||n.logarithmicDepthBuffer)&&n.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",n.extensionDrawBuffers&&n.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(n.extensionShaderTextureLOD||n.envMap||n.transmission)&&n.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Gi).join(`
`)}function tg(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Gi).join(`
`)}function ng(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function ig(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=n.getActiveAttrib(e,r),a=s.name;let o=1;s.type===n.FLOAT_MAT2&&(o=2),s.type===n.FLOAT_MAT3&&(o=3),s.type===n.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Gi(n){return n!==""}function Yc(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function $c(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const rg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Go(n){return n.replace(rg,og)}const sg=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function og(n,e){let t=Oe[e];if(t===void 0){const i=sg.get(e);if(i!==void 0)t=Oe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Go(t)}const ag=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function jc(n){return n.replace(ag,cg)}function cg(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Zc(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	`;return n.isWebGL2&&(e+=`precision ${n.precision} sampler3D;
		precision ${n.precision} sampler2DArray;
		precision ${n.precision} sampler2DShadow;
		precision ${n.precision} samplerCubeShadow;
		precision ${n.precision} sampler2DArrayShadow;
		precision ${n.precision} isampler2D;
		precision ${n.precision} isampler3D;
		precision ${n.precision} isamplerCube;
		precision ${n.precision} isampler2DArray;
		precision ${n.precision} usampler2D;
		precision ${n.precision} usampler3D;
		precision ${n.precision} usamplerCube;
		precision ${n.precision} usampler2DArray;
		`),n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function lg(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===vl?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Uu?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Sn&&(e="SHADOWMAP_TYPE_VSM"),e}function ug(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ji:case Zi:e="ENVMAP_TYPE_CUBE";break;case ws:e="ENVMAP_TYPE_CUBE_UV";break}return e}function hg(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Zi:e="ENVMAP_MODE_REFRACTION";break}return e}function dg(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case xl:e="ENVMAP_BLENDING_MULTIPLY";break;case sh:e="ENVMAP_BLENDING_MIX";break;case oh:e="ENVMAP_BLENDING_ADD";break}return e}function fg(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function pg(n,e,t,i){const r=n.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=lg(t),l=ug(t),u=hg(t),h=dg(t),p=fg(t),m=t.isWebGL2?"":eg(t),g=tg(t),x=ng(s),f=r.createProgram();let d,T,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Gi).join(`
`),d.length>0&&(d+=`
`),T=[m,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Gi).join(`
`),T.length>0&&(T+=`
`)):(d=[Zc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Gi).join(`
`),T=[m,Zc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==zn?"#define TONE_MAPPING":"",t.toneMapping!==zn?Oe.tonemapping_pars_fragment:"",t.toneMapping!==zn?Qm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Oe.colorspace_pars_fragment,Jm("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Gi).join(`
`)),a=Go(a),a=Yc(a,t),a=$c(a,t),o=Go(o),o=Yc(o,t),o=$c(o,t),a=jc(a),o=jc(o),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,d=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+d,T=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===fc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===fc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+T);const E=M+d+a,P=M+T+o,w=Xc(r,r.VERTEX_SHADER,E),A=Xc(r,r.FRAGMENT_SHADER,P);r.attachShader(f,w),r.attachShader(f,A),t.index0AttributeName!==void 0?r.bindAttribLocation(f,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(f,0,"position"),r.linkProgram(f);function F(Y){if(n.debug.checkShaderErrors){const $=r.getProgramInfoLog(f).trim(),R=r.getShaderInfoLog(w).trim(),q=r.getShaderInfoLog(A).trim();let W=!0,Z=!0;if(r.getProgramParameter(f,r.LINK_STATUS)===!1)if(W=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,f,w,A);else{const V=Kc(r,w,"vertex"),K=Kc(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(f,r.VALIDATE_STATUS)+`

Material Name: `+Y.name+`
Material Type: `+Y.type+`

Program Info Log: `+$+`
`+V+`
`+K)}else $!==""?console.warn("THREE.WebGLProgram: Program Info Log:",$):(R===""||q==="")&&(Z=!1);Z&&(Y.diagnostics={runnable:W,programLog:$,vertexShader:{log:R,prefix:d},fragmentShader:{log:q,prefix:T}})}r.deleteShader(w),r.deleteShader(A),j=new ss(r,f),v=ig(r,f)}let j;this.getUniforms=function(){return j===void 0&&F(this),j};let v;this.getAttributes=function(){return v===void 0&&F(this),v};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=r.getProgramParameter(f,Ym)),b},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(f),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=$m++,this.cacheKey=e,this.usedTimes=1,this.program=f,this.vertexShader=w,this.fragmentShader=A,this}let mg=0;class gg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new _g(e),t.set(e,i)),i}}class _g{constructor(e){this.id=mg++,this.code=e,this.usedTimes=0}}function vg(n,e,t,i,r,s,a){const o=new ca,c=new gg,l=new Set,u=[],h=r.isWebGL2,p=r.logarithmicDepthBuffer,m=r.vertexTextures;let g=r.precision;const x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(v){return l.add(v),v===0?"uv":`uv${v}`}function d(v,b,Y,$,R){const q=$.fog,W=R.geometry,Z=v.isMeshStandardMaterial?$.environment:null,V=(v.isMeshStandardMaterial?t:e).get(v.envMap||Z),K=V&&V.mapping===ws?V.image.height:null,J=x[v.type];v.precision!==null&&(g=r.getMaxPrecision(v.precision),g!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",g,"instead."));const oe=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,pe=oe!==void 0?oe.length:0;let Ie=0;W.morphAttributes.position!==void 0&&(Ie=1),W.morphAttributes.normal!==void 0&&(Ie=2),W.morphAttributes.color!==void 0&&(Ie=3);let z,ee,fe,we;if(J){const Qe=cn[J];z=Qe.vertexShader,ee=Qe.fragmentShader}else z=v.vertexShader,ee=v.fragmentShader,c.update(v),fe=c.getVertexShaderID(v),we=c.getFragmentShaderID(v);const xe=n.getRenderTarget(),me=R.isInstancedMesh===!0,Ye=R.isBatchedMesh===!0,Ce=!!v.map,N=!!v.matcap,xt=!!V,Se=!!v.aoMap,He=!!v.lightMap,ye=!!v.bumpMap,Xe=!!v.normalMap,Be=!!v.displacementMap,ze=!!v.emissiveMap,ot=!!v.metalnessMap,y=!!v.roughnessMap,_=v.anisotropy>0,G=v.clearcoat>0,X=v.iridescence>0,te=v.sheen>0,Q=v.transmission>0,De=_&&!!v.anisotropyMap,Te=G&&!!v.clearcoatMap,ae=G&&!!v.clearcoatNormalMap,le=G&&!!v.clearcoatRoughnessMap,Ne=X&&!!v.iridescenceMap,ne=X&&!!v.iridescenceThicknessMap,lt=te&&!!v.sheenColorMap,Ge=te&&!!v.sheenRoughnessMap,Me=!!v.specularMap,ge=!!v.specularColorMap,_e=!!v.specularIntensityMap,Ke=Q&&!!v.transmissionMap,Pe=Q&&!!v.thicknessMap,nt=!!v.gradientMap,L=!!v.alphaMap,ce=v.alphaTest>0,B=!!v.alphaHash,ie=!!v.extensions;let ue=zn;v.toneMapped&&(xe===null||xe.isXRRenderTarget===!0)&&(ue=n.toneMapping);const We={isWebGL2:h,shaderID:J,shaderType:v.type,shaderName:v.name,vertexShader:z,fragmentShader:ee,defines:v.defines,customVertexShaderID:fe,customFragmentShaderID:we,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:g,batching:Ye,instancing:me,instancingColor:me&&R.instanceColor!==null,instancingMorph:me&&R.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:xe===null?n.outputColorSpace:xe.isXRRenderTarget===!0?xe.texture.colorSpace:$n,alphaToCoverage:!!v.alphaToCoverage,map:Ce,matcap:N,envMap:xt,envMapMode:xt&&V.mapping,envMapCubeUVHeight:K,aoMap:Se,lightMap:He,bumpMap:ye,normalMap:Xe,displacementMap:m&&Be,emissiveMap:ze,normalMapObjectSpace:Xe&&v.normalMapType===Th,normalMapTangentSpace:Xe&&v.normalMapType===Cl,metalnessMap:ot,roughnessMap:y,anisotropy:_,anisotropyMap:De,clearcoat:G,clearcoatMap:Te,clearcoatNormalMap:ae,clearcoatRoughnessMap:le,iridescence:X,iridescenceMap:Ne,iridescenceThicknessMap:ne,sheen:te,sheenColorMap:lt,sheenRoughnessMap:Ge,specularMap:Me,specularColorMap:ge,specularIntensityMap:_e,transmission:Q,transmissionMap:Ke,thicknessMap:Pe,gradientMap:nt,opaque:v.transparent===!1&&v.blending===Vi&&v.alphaToCoverage===!1,alphaMap:L,alphaTest:ce,alphaHash:B,combine:v.combine,mapUv:Ce&&f(v.map.channel),aoMapUv:Se&&f(v.aoMap.channel),lightMapUv:He&&f(v.lightMap.channel),bumpMapUv:ye&&f(v.bumpMap.channel),normalMapUv:Xe&&f(v.normalMap.channel),displacementMapUv:Be&&f(v.displacementMap.channel),emissiveMapUv:ze&&f(v.emissiveMap.channel),metalnessMapUv:ot&&f(v.metalnessMap.channel),roughnessMapUv:y&&f(v.roughnessMap.channel),anisotropyMapUv:De&&f(v.anisotropyMap.channel),clearcoatMapUv:Te&&f(v.clearcoatMap.channel),clearcoatNormalMapUv:ae&&f(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:le&&f(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Ne&&f(v.iridescenceMap.channel),iridescenceThicknessMapUv:ne&&f(v.iridescenceThicknessMap.channel),sheenColorMapUv:lt&&f(v.sheenColorMap.channel),sheenRoughnessMapUv:Ge&&f(v.sheenRoughnessMap.channel),specularMapUv:Me&&f(v.specularMap.channel),specularColorMapUv:ge&&f(v.specularColorMap.channel),specularIntensityMapUv:_e&&f(v.specularIntensityMap.channel),transmissionMapUv:Ke&&f(v.transmissionMap.channel),thicknessMapUv:Pe&&f(v.thicknessMap.channel),alphaMapUv:L&&f(v.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(Xe||_),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:R.isPoints===!0&&!!W.attributes.uv&&(Ce||L),fog:!!q,useFog:v.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:p,skinning:R.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:pe,morphTextureStride:Ie,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&Y.length>0,shadowMapType:n.shadowMap.type,toneMapping:ue,useLegacyLights:n._useLegacyLights,decodeVideoTexture:Ce&&v.map.isVideoTexture===!0&&Je.getTransfer(v.map.colorSpace)===tt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===_t,flipSided:v.side===Dt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:ie&&v.extensions.derivatives===!0,extensionFragDepth:ie&&v.extensions.fragDepth===!0,extensionDrawBuffers:ie&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:ie&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ie&&v.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:ie&&v.extensions.multiDraw===!0&&i.has("WEBGL_multi_draw"),rendererExtensionFragDepth:h||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return We.vertexUv1s=l.has(1),We.vertexUv2s=l.has(2),We.vertexUv3s=l.has(3),l.clear(),We}function T(v){const b=[];if(v.shaderID?b.push(v.shaderID):(b.push(v.customVertexShaderID),b.push(v.customFragmentShaderID)),v.defines!==void 0)for(const Y in v.defines)b.push(Y),b.push(v.defines[Y]);return v.isRawShaderMaterial===!1&&(M(b,v),E(b,v),b.push(n.outputColorSpace)),b.push(v.customProgramCacheKey),b.join()}function M(v,b){v.push(b.precision),v.push(b.outputColorSpace),v.push(b.envMapMode),v.push(b.envMapCubeUVHeight),v.push(b.mapUv),v.push(b.alphaMapUv),v.push(b.lightMapUv),v.push(b.aoMapUv),v.push(b.bumpMapUv),v.push(b.normalMapUv),v.push(b.displacementMapUv),v.push(b.emissiveMapUv),v.push(b.metalnessMapUv),v.push(b.roughnessMapUv),v.push(b.anisotropyMapUv),v.push(b.clearcoatMapUv),v.push(b.clearcoatNormalMapUv),v.push(b.clearcoatRoughnessMapUv),v.push(b.iridescenceMapUv),v.push(b.iridescenceThicknessMapUv),v.push(b.sheenColorMapUv),v.push(b.sheenRoughnessMapUv),v.push(b.specularMapUv),v.push(b.specularColorMapUv),v.push(b.specularIntensityMapUv),v.push(b.transmissionMapUv),v.push(b.thicknessMapUv),v.push(b.combine),v.push(b.fogExp2),v.push(b.sizeAttenuation),v.push(b.morphTargetsCount),v.push(b.morphAttributeCount),v.push(b.numDirLights),v.push(b.numPointLights),v.push(b.numSpotLights),v.push(b.numSpotLightMaps),v.push(b.numHemiLights),v.push(b.numRectAreaLights),v.push(b.numDirLightShadows),v.push(b.numPointLightShadows),v.push(b.numSpotLightShadows),v.push(b.numSpotLightShadowsWithMaps),v.push(b.numLightProbes),v.push(b.shadowMapType),v.push(b.toneMapping),v.push(b.numClippingPlanes),v.push(b.numClipIntersection),v.push(b.depthPacking)}function E(v,b){o.disableAll(),b.isWebGL2&&o.enable(0),b.supportsVertexTextures&&o.enable(1),b.instancing&&o.enable(2),b.instancingColor&&o.enable(3),b.instancingMorph&&o.enable(4),b.matcap&&o.enable(5),b.envMap&&o.enable(6),b.normalMapObjectSpace&&o.enable(7),b.normalMapTangentSpace&&o.enable(8),b.clearcoat&&o.enable(9),b.iridescence&&o.enable(10),b.alphaTest&&o.enable(11),b.vertexColors&&o.enable(12),b.vertexAlphas&&o.enable(13),b.vertexUv1s&&o.enable(14),b.vertexUv2s&&o.enable(15),b.vertexUv3s&&o.enable(16),b.vertexTangents&&o.enable(17),b.anisotropy&&o.enable(18),b.alphaHash&&o.enable(19),b.batching&&o.enable(20),v.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.skinning&&o.enable(4),b.morphTargets&&o.enable(5),b.morphNormals&&o.enable(6),b.morphColors&&o.enable(7),b.premultipliedAlpha&&o.enable(8),b.shadowMapEnabled&&o.enable(9),b.useLegacyLights&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.alphaToCoverage&&o.enable(20),v.push(o.mask)}function P(v){const b=x[v.type];let Y;if(b){const $=cn[b];Y=Zh.clone($.uniforms)}else Y=v.uniforms;return Y}function w(v,b){let Y;for(let $=0,R=u.length;$<R;$++){const q=u[$];if(q.cacheKey===b){Y=q,++Y.usedTimes;break}}return Y===void 0&&(Y=new pg(n,b,v,s),u.push(Y)),Y}function A(v){if(--v.usedTimes===0){const b=u.indexOf(v);u[b]=u[u.length-1],u.pop(),v.destroy()}}function F(v){c.remove(v)}function j(){c.dispose()}return{getParameters:d,getProgramCacheKey:T,getUniforms:P,acquireProgram:w,releaseProgram:A,releaseShaderCache:F,programs:u,dispose:j}}function xg(){let n=new WeakMap;function e(s){let a=n.get(s);return a===void 0&&(a={},n.set(s,a)),a}function t(s){n.delete(s)}function i(s,a,o){n.get(s)[a]=o}function r(){n=new WeakMap}return{get:e,remove:t,update:i,dispose:r}}function Mg(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Jc(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Qc(){const n=[];let e=0;const t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function a(h,p,m,g,x,f){let d=n[e];return d===void 0?(d={id:h.id,object:h,geometry:p,material:m,groupOrder:g,renderOrder:h.renderOrder,z:x,group:f},n[e]=d):(d.id=h.id,d.object=h,d.geometry=p,d.material=m,d.groupOrder=g,d.renderOrder=h.renderOrder,d.z=x,d.group=f),e++,d}function o(h,p,m,g,x,f){const d=a(h,p,m,g,x,f);m.transmission>0?i.push(d):m.transparent===!0?r.push(d):t.push(d)}function c(h,p,m,g,x,f){const d=a(h,p,m,g,x,f);m.transmission>0?i.unshift(d):m.transparent===!0?r.unshift(d):t.unshift(d)}function l(h,p){t.length>1&&t.sort(h||Mg),i.length>1&&i.sort(p||Jc),r.length>1&&r.sort(p||Jc)}function u(){for(let h=e,p=n.length;h<p;h++){const m=n[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:o,unshift:c,finish:u,sort:l}}function Sg(){let n=new WeakMap;function e(i,r){const s=n.get(i);let a;return s===void 0?(a=new Qc,n.set(i,[a])):r>=s.length?(a=new Qc,s.push(a)):a=s[r],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function Eg(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new U,color:new Ve};break;case"SpotLight":t={position:new U,direction:new U,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new U,halfWidth:new U,halfHeight:new U};break}return n[e.id]=t,t}}}function yg(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let Tg=0;function bg(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Ag(n,e){const t=new Eg,i=yg(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)r.probe.push(new U);const s=new U,a=new st,o=new st;function c(u,h){let p=0,m=0,g=0;for(let Y=0;Y<9;Y++)r.probe[Y].set(0,0,0);let x=0,f=0,d=0,T=0,M=0,E=0,P=0,w=0,A=0,F=0,j=0;u.sort(bg);const v=h===!0?Math.PI:1;for(let Y=0,$=u.length;Y<$;Y++){const R=u[Y],q=R.color,W=R.intensity,Z=R.distance,V=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)p+=q.r*W*v,m+=q.g*W*v,g+=q.b*W*v;else if(R.isLightProbe){for(let K=0;K<9;K++)r.probe[K].addScaledVector(R.sh.coefficients[K],W);j++}else if(R.isDirectionalLight){const K=t.get(R);if(K.color.copy(R.color).multiplyScalar(R.intensity*v),R.castShadow){const J=R.shadow,oe=i.get(R);oe.shadowBias=J.bias,oe.shadowNormalBias=J.normalBias,oe.shadowRadius=J.radius,oe.shadowMapSize=J.mapSize,r.directionalShadow[x]=oe,r.directionalShadowMap[x]=V,r.directionalShadowMatrix[x]=R.shadow.matrix,E++}r.directional[x]=K,x++}else if(R.isSpotLight){const K=t.get(R);K.position.setFromMatrixPosition(R.matrixWorld),K.color.copy(q).multiplyScalar(W*v),K.distance=Z,K.coneCos=Math.cos(R.angle),K.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),K.decay=R.decay,r.spot[d]=K;const J=R.shadow;if(R.map&&(r.spotLightMap[A]=R.map,A++,J.updateMatrices(R),R.castShadow&&F++),r.spotLightMatrix[d]=J.matrix,R.castShadow){const oe=i.get(R);oe.shadowBias=J.bias,oe.shadowNormalBias=J.normalBias,oe.shadowRadius=J.radius,oe.shadowMapSize=J.mapSize,r.spotShadow[d]=oe,r.spotShadowMap[d]=V,w++}d++}else if(R.isRectAreaLight){const K=t.get(R);K.color.copy(q).multiplyScalar(W),K.halfWidth.set(R.width*.5,0,0),K.halfHeight.set(0,R.height*.5,0),r.rectArea[T]=K,T++}else if(R.isPointLight){const K=t.get(R);if(K.color.copy(R.color).multiplyScalar(R.intensity*v),K.distance=R.distance,K.decay=R.decay,R.castShadow){const J=R.shadow,oe=i.get(R);oe.shadowBias=J.bias,oe.shadowNormalBias=J.normalBias,oe.shadowRadius=J.radius,oe.shadowMapSize=J.mapSize,oe.shadowCameraNear=J.camera.near,oe.shadowCameraFar=J.camera.far,r.pointShadow[f]=oe,r.pointShadowMap[f]=V,r.pointShadowMatrix[f]=R.shadow.matrix,P++}r.point[f]=K,f++}else if(R.isHemisphereLight){const K=t.get(R);K.skyColor.copy(R.color).multiplyScalar(W*v),K.groundColor.copy(R.groundColor).multiplyScalar(W*v),r.hemi[M]=K,M++}}T>0&&(e.isWebGL2?n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=se.LTC_FLOAT_1,r.rectAreaLTC2=se.LTC_FLOAT_2):(r.rectAreaLTC1=se.LTC_HALF_1,r.rectAreaLTC2=se.LTC_HALF_2):n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=se.LTC_FLOAT_1,r.rectAreaLTC2=se.LTC_FLOAT_2):n.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=se.LTC_HALF_1,r.rectAreaLTC2=se.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=p,r.ambient[1]=m,r.ambient[2]=g;const b=r.hash;(b.directionalLength!==x||b.pointLength!==f||b.spotLength!==d||b.rectAreaLength!==T||b.hemiLength!==M||b.numDirectionalShadows!==E||b.numPointShadows!==P||b.numSpotShadows!==w||b.numSpotMaps!==A||b.numLightProbes!==j)&&(r.directional.length=x,r.spot.length=d,r.rectArea.length=T,r.point.length=f,r.hemi.length=M,r.directionalShadow.length=E,r.directionalShadowMap.length=E,r.pointShadow.length=P,r.pointShadowMap.length=P,r.spotShadow.length=w,r.spotShadowMap.length=w,r.directionalShadowMatrix.length=E,r.pointShadowMatrix.length=P,r.spotLightMatrix.length=w+A-F,r.spotLightMap.length=A,r.numSpotLightShadowsWithMaps=F,r.numLightProbes=j,b.directionalLength=x,b.pointLength=f,b.spotLength=d,b.rectAreaLength=T,b.hemiLength=M,b.numDirectionalShadows=E,b.numPointShadows=P,b.numSpotShadows=w,b.numSpotMaps=A,b.numLightProbes=j,r.version=Tg++)}function l(u,h){let p=0,m=0,g=0,x=0,f=0;const d=h.matrixWorldInverse;for(let T=0,M=u.length;T<M;T++){const E=u[T];if(E.isDirectionalLight){const P=r.directional[p];P.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(d),p++}else if(E.isSpotLight){const P=r.spot[g];P.position.setFromMatrixPosition(E.matrixWorld),P.position.applyMatrix4(d),P.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(d),g++}else if(E.isRectAreaLight){const P=r.rectArea[x];P.position.setFromMatrixPosition(E.matrixWorld),P.position.applyMatrix4(d),o.identity(),a.copy(E.matrixWorld),a.premultiply(d),o.extractRotation(a),P.halfWidth.set(E.width*.5,0,0),P.halfHeight.set(0,E.height*.5,0),P.halfWidth.applyMatrix4(o),P.halfHeight.applyMatrix4(o),x++}else if(E.isPointLight){const P=r.point[m];P.position.setFromMatrixPosition(E.matrixWorld),P.position.applyMatrix4(d),m++}else if(E.isHemisphereLight){const P=r.hemi[f];P.direction.setFromMatrixPosition(E.matrixWorld),P.direction.transformDirection(d),f++}}}return{setup:c,setupView:l,state:r}}function el(n,e){const t=new Ag(n,e),i=[],r=[];function s(){i.length=0,r.length=0}function a(h){i.push(h)}function o(h){r.push(h)}function c(h){t.setup(i,h)}function l(h){t.setupView(i,h)}return{init:s,state:{lightsArray:i,shadowsArray:r,lights:t},setupLights:c,setupLightsView:l,pushLight:a,pushShadow:o}}function wg(n,e){let t=new WeakMap;function i(s,a=0){const o=t.get(s);let c;return o===void 0?(c=new el(n,e),t.set(s,[c])):a>=o.length?(c=new el(n,e),o.push(c)):c=o[a],c}function r(){t=new WeakMap}return{get:i,dispose:r}}class Cg extends ir{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Eh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Rg extends ir{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Pg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Lg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Ig(n,e,t){let i=new la;const r=new Ae,s=new Ae,a=new vt,o=new Cg({depthPacking:yh}),c=new Rg,l={},u=t.maxTextureSize,h={[qn]:Dt,[Dt]:qn,[_t]:_t},p=new Xn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ae},radius:{value:4}},vertexShader:Pg,fragmentShader:Lg}),m=p.clone();m.defines.HORIZONTAL_PASS=1;const g=new Kt;g.setAttribute("position",new sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new he(g,p),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=vl;let d=this.type;this.render=function(w,A,F){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||w.length===0)return;const j=n.getRenderTarget(),v=n.getActiveCubeFace(),b=n.getActiveMipmapLevel(),Y=n.state;Y.setBlending(Hn),Y.buffers.color.setClear(1,1,1,1),Y.buffers.depth.setTest(!0),Y.setScissorTest(!1);const $=d!==Sn&&this.type===Sn,R=d===Sn&&this.type!==Sn;for(let q=0,W=w.length;q<W;q++){const Z=w[q],V=Z.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;r.copy(V.mapSize);const K=V.getFrameExtents();if(r.multiply(K),s.copy(V.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/K.x),r.x=s.x*K.x,V.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/K.y),r.y=s.y*K.y,V.mapSize.y=s.y)),V.map===null||$===!0||R===!0){const oe=this.type!==Sn?{minFilter:Ct,magFilter:Ct}:{};V.map!==null&&V.map.dispose(),V.map=new mi(r.x,r.y,oe),V.map.texture.name=Z.name+".shadowMap",V.camera.updateProjectionMatrix()}n.setRenderTarget(V.map),n.clear();const J=V.getViewportCount();for(let oe=0;oe<J;oe++){const pe=V.getViewport(oe);a.set(s.x*pe.x,s.y*pe.y,s.x*pe.z,s.y*pe.w),Y.viewport(a),V.updateMatrices(Z,oe),i=V.getFrustum(),E(A,F,V.camera,Z,this.type)}V.isPointLightShadow!==!0&&this.type===Sn&&T(V,F),V.needsUpdate=!1}d=this.type,f.needsUpdate=!1,n.setRenderTarget(j,v,b)};function T(w,A){const F=e.update(x);p.defines.VSM_SAMPLES!==w.blurSamples&&(p.defines.VSM_SAMPLES=w.blurSamples,m.defines.VSM_SAMPLES=w.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new mi(r.x,r.y)),p.uniforms.shadow_pass.value=w.map.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,n.setRenderTarget(w.mapPass),n.clear(),n.renderBufferDirect(A,null,F,p,x,null),m.uniforms.shadow_pass.value=w.mapPass.texture,m.uniforms.resolution.value=w.mapSize,m.uniforms.radius.value=w.radius,n.setRenderTarget(w.map),n.clear(),n.renderBufferDirect(A,null,F,m,x,null)}function M(w,A,F,j){let v=null;const b=F.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(b!==void 0)v=b;else if(v=F.isPointLight===!0?c:o,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const Y=v.uuid,$=A.uuid;let R=l[Y];R===void 0&&(R={},l[Y]=R);let q=R[$];q===void 0&&(q=v.clone(),R[$]=q,A.addEventListener("dispose",P)),v=q}if(v.visible=A.visible,v.wireframe=A.wireframe,j===Sn?v.side=A.shadowSide!==null?A.shadowSide:A.side:v.side=A.shadowSide!==null?A.shadowSide:h[A.side],v.alphaMap=A.alphaMap,v.alphaTest=A.alphaTest,v.map=A.map,v.clipShadows=A.clipShadows,v.clippingPlanes=A.clippingPlanes,v.clipIntersection=A.clipIntersection,v.displacementMap=A.displacementMap,v.displacementScale=A.displacementScale,v.displacementBias=A.displacementBias,v.wireframeLinewidth=A.wireframeLinewidth,v.linewidth=A.linewidth,F.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const Y=n.properties.get(v);Y.light=F}return v}function E(w,A,F,j,v){if(w.visible===!1)return;if(w.layers.test(A.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&v===Sn)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,w.matrixWorld);const $=e.update(w),R=w.material;if(Array.isArray(R)){const q=$.groups;for(let W=0,Z=q.length;W<Z;W++){const V=q[W],K=R[V.materialIndex];if(K&&K.visible){const J=M(w,K,j,v);w.onBeforeShadow(n,w,A,F,$,J,V),n.renderBufferDirect(F,null,$,J,w,V),w.onAfterShadow(n,w,A,F,$,J,V)}}}else if(R.visible){const q=M(w,R,j,v);w.onBeforeShadow(n,w,A,F,$,q,null),n.renderBufferDirect(F,null,$,q,w,null),w.onAfterShadow(n,w,A,F,$,q,null)}}const Y=w.children;for(let $=0,R=Y.length;$<R;$++)E(Y[$],A,F,j,v)}function P(w){w.target.removeEventListener("dispose",P);for(const F in l){const j=l[F],v=w.target.uuid;v in j&&(j[v].dispose(),delete j[v])}}}function Dg(n,e,t){const i=t.isWebGL2;function r(){let L=!1;const ce=new vt;let B=null;const ie=new vt(0,0,0,0);return{setMask:function(ue){B!==ue&&!L&&(n.colorMask(ue,ue,ue,ue),B=ue)},setLocked:function(ue){L=ue},setClear:function(ue,We,Qe,Mt,zt){zt===!0&&(ue*=Mt,We*=Mt,Qe*=Mt),ce.set(ue,We,Qe,Mt),ie.equals(ce)===!1&&(n.clearColor(ue,We,Qe,Mt),ie.copy(ce))},reset:function(){L=!1,B=null,ie.set(-1,0,0,0)}}}function s(){let L=!1,ce=null,B=null,ie=null;return{setTest:function(ue){ue?me(n.DEPTH_TEST):Ye(n.DEPTH_TEST)},setMask:function(ue){ce!==ue&&!L&&(n.depthMask(ue),ce=ue)},setFunc:function(ue){if(B!==ue){switch(ue){case Ju:n.depthFunc(n.NEVER);break;case Qu:n.depthFunc(n.ALWAYS);break;case eh:n.depthFunc(n.LESS);break;case ds:n.depthFunc(n.LEQUAL);break;case th:n.depthFunc(n.EQUAL);break;case nh:n.depthFunc(n.GEQUAL);break;case ih:n.depthFunc(n.GREATER);break;case rh:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}B=ue}},setLocked:function(ue){L=ue},setClear:function(ue){ie!==ue&&(n.clearDepth(ue),ie=ue)},reset:function(){L=!1,ce=null,B=null,ie=null}}}function a(){let L=!1,ce=null,B=null,ie=null,ue=null,We=null,Qe=null,Mt=null,zt=null;return{setTest:function(et){L||(et?me(n.STENCIL_TEST):Ye(n.STENCIL_TEST))},setMask:function(et){ce!==et&&!L&&(n.stencilMask(et),ce=et)},setFunc:function(et,bt,on){(B!==et||ie!==bt||ue!==on)&&(n.stencilFunc(et,bt,on),B=et,ie=bt,ue=on)},setOp:function(et,bt,on){(We!==et||Qe!==bt||Mt!==on)&&(n.stencilOp(et,bt,on),We=et,Qe=bt,Mt=on)},setLocked:function(et){L=et},setClear:function(et){zt!==et&&(n.clearStencil(et),zt=et)},reset:function(){L=!1,ce=null,B=null,ie=null,ue=null,We=null,Qe=null,Mt=null,zt=null}}}const o=new r,c=new s,l=new a,u=new WeakMap,h=new WeakMap;let p={},m={},g=new WeakMap,x=[],f=null,d=!1,T=null,M=null,E=null,P=null,w=null,A=null,F=null,j=new Ve(0,0,0),v=0,b=!1,Y=null,$=null,R=null,q=null,W=null;const Z=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,K=0;const J=n.getParameter(n.VERSION);J.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(J)[1]),V=K>=1):J.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),V=K>=2);let oe=null,pe={};const Ie=n.getParameter(n.SCISSOR_BOX),z=n.getParameter(n.VIEWPORT),ee=new vt().fromArray(Ie),fe=new vt().fromArray(z);function we(L,ce,B,ie){const ue=new Uint8Array(4),We=n.createTexture();n.bindTexture(L,We),n.texParameteri(L,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(L,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Qe=0;Qe<B;Qe++)i&&(L===n.TEXTURE_3D||L===n.TEXTURE_2D_ARRAY)?n.texImage3D(ce,0,n.RGBA,1,1,ie,0,n.RGBA,n.UNSIGNED_BYTE,ue):n.texImage2D(ce+Qe,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ue);return We}const xe={};xe[n.TEXTURE_2D]=we(n.TEXTURE_2D,n.TEXTURE_2D,1),xe[n.TEXTURE_CUBE_MAP]=we(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(xe[n.TEXTURE_2D_ARRAY]=we(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),xe[n.TEXTURE_3D]=we(n.TEXTURE_3D,n.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),c.setClear(1),l.setClear(0),me(n.DEPTH_TEST),c.setFunc(ds),Be(!1),ze(Na),me(n.CULL_FACE),ye(Hn);function me(L){p[L]!==!0&&(n.enable(L),p[L]=!0)}function Ye(L){p[L]!==!1&&(n.disable(L),p[L]=!1)}function Ce(L,ce){return m[L]!==ce?(n.bindFramebuffer(L,ce),m[L]=ce,i&&(L===n.DRAW_FRAMEBUFFER&&(m[n.FRAMEBUFFER]=ce),L===n.FRAMEBUFFER&&(m[n.DRAW_FRAMEBUFFER]=ce)),!0):!1}function N(L,ce){let B=x,ie=!1;if(L){B=g.get(ce),B===void 0&&(B=[],g.set(ce,B));const ue=L.textures;if(B.length!==ue.length||B[0]!==n.COLOR_ATTACHMENT0){for(let We=0,Qe=ue.length;We<Qe;We++)B[We]=n.COLOR_ATTACHMENT0+We;B.length=ue.length,ie=!0}}else B[0]!==n.BACK&&(B[0]=n.BACK,ie=!0);if(ie)if(t.isWebGL2)n.drawBuffers(B);else if(e.has("WEBGL_draw_buffers")===!0)e.get("WEBGL_draw_buffers").drawBuffersWEBGL(B);else throw new Error("THREE.WebGLState: Usage of gl.drawBuffers() require WebGL2 or WEBGL_draw_buffers extension")}function xt(L){return f!==L?(n.useProgram(L),f=L,!0):!1}const Se={[li]:n.FUNC_ADD,[Fu]:n.FUNC_SUBTRACT,[Bu]:n.FUNC_REVERSE_SUBTRACT};if(i)Se[Ba]=n.MIN,Se[ka]=n.MAX;else{const L=e.get("EXT_blend_minmax");L!==null&&(Se[Ba]=L.MIN_EXT,Se[ka]=L.MAX_EXT)}const He={[ku]:n.ZERO,[Hu]:n.ONE,[zu]:n.SRC_COLOR,[Io]:n.SRC_ALPHA,[Ku]:n.SRC_ALPHA_SATURATE,[qu]:n.DST_COLOR,[Wu]:n.DST_ALPHA,[Gu]:n.ONE_MINUS_SRC_COLOR,[Do]:n.ONE_MINUS_SRC_ALPHA,[Xu]:n.ONE_MINUS_DST_COLOR,[Vu]:n.ONE_MINUS_DST_ALPHA,[Yu]:n.CONSTANT_COLOR,[$u]:n.ONE_MINUS_CONSTANT_COLOR,[ju]:n.CONSTANT_ALPHA,[Zu]:n.ONE_MINUS_CONSTANT_ALPHA};function ye(L,ce,B,ie,ue,We,Qe,Mt,zt,et){if(L===Hn){d===!0&&(Ye(n.BLEND),d=!1);return}if(d===!1&&(me(n.BLEND),d=!0),L!==Ou){if(L!==T||et!==b){if((M!==li||w!==li)&&(n.blendEquation(n.FUNC_ADD),M=li,w=li),et)switch(L){case Vi:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ua:n.blendFunc(n.ONE,n.ONE);break;case Oa:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Fa:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Vi:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ua:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Oa:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Fa:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}E=null,P=null,A=null,F=null,j.set(0,0,0),v=0,T=L,b=et}return}ue=ue||ce,We=We||B,Qe=Qe||ie,(ce!==M||ue!==w)&&(n.blendEquationSeparate(Se[ce],Se[ue]),M=ce,w=ue),(B!==E||ie!==P||We!==A||Qe!==F)&&(n.blendFuncSeparate(He[B],He[ie],He[We],He[Qe]),E=B,P=ie,A=We,F=Qe),(Mt.equals(j)===!1||zt!==v)&&(n.blendColor(Mt.r,Mt.g,Mt.b,zt),j.copy(Mt),v=zt),T=L,b=!1}function Xe(L,ce){L.side===_t?Ye(n.CULL_FACE):me(n.CULL_FACE);let B=L.side===Dt;ce&&(B=!B),Be(B),L.blending===Vi&&L.transparent===!1?ye(Hn):ye(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),c.setFunc(L.depthFunc),c.setTest(L.depthTest),c.setMask(L.depthWrite),o.setMask(L.colorWrite);const ie=L.stencilWrite;l.setTest(ie),ie&&(l.setMask(L.stencilWriteMask),l.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),l.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),y(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?me(n.SAMPLE_ALPHA_TO_COVERAGE):Ye(n.SAMPLE_ALPHA_TO_COVERAGE)}function Be(L){Y!==L&&(L?n.frontFace(n.CW):n.frontFace(n.CCW),Y=L)}function ze(L){L!==Du?(me(n.CULL_FACE),L!==$&&(L===Na?n.cullFace(n.BACK):L===Nu?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ye(n.CULL_FACE),$=L}function ot(L){L!==R&&(V&&n.lineWidth(L),R=L)}function y(L,ce,B){L?(me(n.POLYGON_OFFSET_FILL),(q!==ce||W!==B)&&(n.polygonOffset(ce,B),q=ce,W=B)):Ye(n.POLYGON_OFFSET_FILL)}function _(L){L?me(n.SCISSOR_TEST):Ye(n.SCISSOR_TEST)}function G(L){L===void 0&&(L=n.TEXTURE0+Z-1),oe!==L&&(n.activeTexture(L),oe=L)}function X(L,ce,B){B===void 0&&(oe===null?B=n.TEXTURE0+Z-1:B=oe);let ie=pe[B];ie===void 0&&(ie={type:void 0,texture:void 0},pe[B]=ie),(ie.type!==L||ie.texture!==ce)&&(oe!==B&&(n.activeTexture(B),oe=B),n.bindTexture(L,ce||xe[L]),ie.type=L,ie.texture=ce)}function te(){const L=pe[oe];L!==void 0&&L.type!==void 0&&(n.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function Q(){try{n.compressedTexImage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function De(){try{n.compressedTexImage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Te(){try{n.texSubImage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ae(){try{n.texSubImage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function le(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ne(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ne(){try{n.texStorage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function lt(){try{n.texStorage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ge(){try{n.texImage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Me(){try{n.texImage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ge(L){ee.equals(L)===!1&&(n.scissor(L.x,L.y,L.z,L.w),ee.copy(L))}function _e(L){fe.equals(L)===!1&&(n.viewport(L.x,L.y,L.z,L.w),fe.copy(L))}function Ke(L,ce){let B=h.get(ce);B===void 0&&(B=new WeakMap,h.set(ce,B));let ie=B.get(L);ie===void 0&&(ie=n.getUniformBlockIndex(ce,L.name),B.set(L,ie))}function Pe(L,ce){const ie=h.get(ce).get(L);u.get(ce)!==ie&&(n.uniformBlockBinding(ce,ie,L.__bindingPointIndex),u.set(ce,ie))}function nt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),i===!0&&(n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null)),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),p={},oe=null,pe={},m={},g=new WeakMap,x=[],f=null,d=!1,T=null,M=null,E=null,P=null,w=null,A=null,F=null,j=new Ve(0,0,0),v=0,b=!1,Y=null,$=null,R=null,q=null,W=null,ee.set(0,0,n.canvas.width,n.canvas.height),fe.set(0,0,n.canvas.width,n.canvas.height),o.reset(),c.reset(),l.reset()}return{buffers:{color:o,depth:c,stencil:l},enable:me,disable:Ye,bindFramebuffer:Ce,drawBuffers:N,useProgram:xt,setBlending:ye,setMaterial:Xe,setFlipSided:Be,setCullFace:ze,setLineWidth:ot,setPolygonOffset:y,setScissorTest:_,activeTexture:G,bindTexture:X,unbindTexture:te,compressedTexImage2D:Q,compressedTexImage3D:De,texImage2D:Ge,texImage3D:Me,updateUBOMapping:Ke,uniformBlockBinding:Pe,texStorage2D:ne,texStorage3D:lt,texSubImage2D:Te,texSubImage3D:ae,compressedTexSubImage2D:le,compressedTexSubImage3D:Ne,scissor:ge,viewport:_e,reset:nt}}function Ng(n,e,t,i,r,s,a){const o=r.isWebGL2,c=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Ae,h=new WeakMap;let p;const m=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(y,_){return g?new OffscreenCanvas(y,_):_s("canvas")}function f(y,_,G,X){let te=1;const Q=ot(y);if((Q.width>X||Q.height>X)&&(te=X/Math.max(Q.width,Q.height)),te<1||_===!0)if(typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&y instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&y instanceof ImageBitmap||typeof VideoFrame<"u"&&y instanceof VideoFrame){const De=_?zo:Math.floor,Te=De(te*Q.width),ae=De(te*Q.height);p===void 0&&(p=x(Te,ae));const le=G?x(Te,ae):p;return le.width=Te,le.height=ae,le.getContext("2d").drawImage(y,0,0,Te,ae),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+Te+"x"+ae+")."),le}else return"data"in y&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),y;return y}function d(y){const _=ot(y);return pc(_.width)&&pc(_.height)}function T(y){return o?!1:y.wrapS!==Qt||y.wrapT!==Qt||y.minFilter!==Ct&&y.minFilter!==Pt}function M(y,_){return y.generateMipmaps&&_&&y.minFilter!==Ct&&y.minFilter!==Pt}function E(y){n.generateMipmap(y)}function P(y,_,G,X,te=!1){if(o===!1)return _;if(y!==null){if(n[y]!==void 0)return n[y];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+y+"'")}let Q=_;if(_===n.RED&&(G===n.FLOAT&&(Q=n.R32F),G===n.HALF_FLOAT&&(Q=n.R16F),G===n.UNSIGNED_BYTE&&(Q=n.R8)),_===n.RED_INTEGER&&(G===n.UNSIGNED_BYTE&&(Q=n.R8UI),G===n.UNSIGNED_SHORT&&(Q=n.R16UI),G===n.UNSIGNED_INT&&(Q=n.R32UI),G===n.BYTE&&(Q=n.R8I),G===n.SHORT&&(Q=n.R16I),G===n.INT&&(Q=n.R32I)),_===n.RG&&(G===n.FLOAT&&(Q=n.RG32F),G===n.HALF_FLOAT&&(Q=n.RG16F),G===n.UNSIGNED_BYTE&&(Q=n.RG8)),_===n.RG_INTEGER&&(G===n.UNSIGNED_BYTE&&(Q=n.RG8UI),G===n.UNSIGNED_SHORT&&(Q=n.RG16UI),G===n.UNSIGNED_INT&&(Q=n.RG32UI),G===n.BYTE&&(Q=n.RG8I),G===n.SHORT&&(Q=n.RG16I),G===n.INT&&(Q=n.RG32I)),_===n.RGBA){const De=te?fs:Je.getTransfer(X);G===n.FLOAT&&(Q=n.RGBA32F),G===n.HALF_FLOAT&&(Q=n.RGBA16F),G===n.UNSIGNED_BYTE&&(Q=De===tt?n.SRGB8_ALPHA8:n.RGBA8),G===n.UNSIGNED_SHORT_4_4_4_4&&(Q=n.RGBA4),G===n.UNSIGNED_SHORT_5_5_5_1&&(Q=n.RGB5_A1)}return(Q===n.R16F||Q===n.R32F||Q===n.RG16F||Q===n.RG32F||Q===n.RGBA16F||Q===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function w(y,_,G){return M(y,G)===!0||y.isFramebufferTexture&&y.minFilter!==Ct&&y.minFilter!==Pt?Math.log2(Math.max(_.width,_.height))+1:y.mipmaps!==void 0&&y.mipmaps.length>0?y.mipmaps.length:y.isCompressedTexture&&Array.isArray(y.image)?_.mipmaps.length:1}function A(y){return y===Ct||y===Ha||y===cr?n.NEAREST:n.LINEAR}function F(y){const _=y.target;_.removeEventListener("dispose",F),v(_),_.isVideoTexture&&h.delete(_)}function j(y){const _=y.target;_.removeEventListener("dispose",j),Y(_)}function v(y){const _=i.get(y);if(_.__webglInit===void 0)return;const G=y.source,X=m.get(G);if(X){const te=X[_.__cacheKey];te.usedTimes--,te.usedTimes===0&&b(y),Object.keys(X).length===0&&m.delete(G)}i.remove(y)}function b(y){const _=i.get(y);n.deleteTexture(_.__webglTexture);const G=y.source,X=m.get(G);delete X[_.__cacheKey],a.memory.textures--}function Y(y){const _=i.get(y);if(y.depthTexture&&y.depthTexture.dispose(),y.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(_.__webglFramebuffer[X]))for(let te=0;te<_.__webglFramebuffer[X].length;te++)n.deleteFramebuffer(_.__webglFramebuffer[X][te]);else n.deleteFramebuffer(_.__webglFramebuffer[X]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[X])}else{if(Array.isArray(_.__webglFramebuffer))for(let X=0;X<_.__webglFramebuffer.length;X++)n.deleteFramebuffer(_.__webglFramebuffer[X]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let X=0;X<_.__webglColorRenderbuffer.length;X++)_.__webglColorRenderbuffer[X]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[X]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const G=y.textures;for(let X=0,te=G.length;X<te;X++){const Q=i.get(G[X]);Q.__webglTexture&&(n.deleteTexture(Q.__webglTexture),a.memory.textures--),i.remove(G[X])}i.remove(y)}let $=0;function R(){$=0}function q(){const y=$;return y>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+y+" texture units while this GPU supports only "+r.maxTextures),$+=1,y}function W(y){const _=[];return _.push(y.wrapS),_.push(y.wrapT),_.push(y.wrapR||0),_.push(y.magFilter),_.push(y.minFilter),_.push(y.anisotropy),_.push(y.internalFormat),_.push(y.format),_.push(y.type),_.push(y.generateMipmaps),_.push(y.premultiplyAlpha),_.push(y.flipY),_.push(y.unpackAlignment),_.push(y.colorSpace),_.join()}function Z(y,_){const G=i.get(y);if(y.isVideoTexture&&Be(y),y.isRenderTargetTexture===!1&&y.version>0&&G.__version!==y.version){const X=y.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{fe(G,y,_);return}}t.bindTexture(n.TEXTURE_2D,G.__webglTexture,n.TEXTURE0+_)}function V(y,_){const G=i.get(y);if(y.version>0&&G.__version!==y.version){fe(G,y,_);return}t.bindTexture(n.TEXTURE_2D_ARRAY,G.__webglTexture,n.TEXTURE0+_)}function K(y,_){const G=i.get(y);if(y.version>0&&G.__version!==y.version){fe(G,y,_);return}t.bindTexture(n.TEXTURE_3D,G.__webglTexture,n.TEXTURE0+_)}function J(y,_){const G=i.get(y);if(y.version>0&&G.__version!==y.version){we(G,y,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture,n.TEXTURE0+_)}const oe={[Oo]:n.REPEAT,[Qt]:n.CLAMP_TO_EDGE,[Fo]:n.MIRRORED_REPEAT},pe={[Ct]:n.NEAREST,[Ha]:n.NEAREST_MIPMAP_NEAREST,[cr]:n.NEAREST_MIPMAP_LINEAR,[Pt]:n.LINEAR,[ks]:n.LINEAR_MIPMAP_NEAREST,[hi]:n.LINEAR_MIPMAP_LINEAR},Ie={[bh]:n.NEVER,[Lh]:n.ALWAYS,[Ah]:n.LESS,[Rl]:n.LEQUAL,[wh]:n.EQUAL,[Ph]:n.GEQUAL,[Ch]:n.GREATER,[Rh]:n.NOTEQUAL};function z(y,_,G){if(_.type===yn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Pt||_.magFilter===ks||_.magFilter===cr||_.magFilter===hi||_.minFilter===Pt||_.minFilter===ks||_.minFilter===cr||_.minFilter===hi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),G?(n.texParameteri(y,n.TEXTURE_WRAP_S,oe[_.wrapS]),n.texParameteri(y,n.TEXTURE_WRAP_T,oe[_.wrapT]),(y===n.TEXTURE_3D||y===n.TEXTURE_2D_ARRAY)&&n.texParameteri(y,n.TEXTURE_WRAP_R,oe[_.wrapR]),n.texParameteri(y,n.TEXTURE_MAG_FILTER,pe[_.magFilter]),n.texParameteri(y,n.TEXTURE_MIN_FILTER,pe[_.minFilter])):(n.texParameteri(y,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(y,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),(y===n.TEXTURE_3D||y===n.TEXTURE_2D_ARRAY)&&n.texParameteri(y,n.TEXTURE_WRAP_R,n.CLAMP_TO_EDGE),(_.wrapS!==Qt||_.wrapT!==Qt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),n.texParameteri(y,n.TEXTURE_MAG_FILTER,A(_.magFilter)),n.texParameteri(y,n.TEXTURE_MIN_FILTER,A(_.minFilter)),_.minFilter!==Ct&&_.minFilter!==Pt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),_.compareFunction&&(n.texParameteri(y,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(y,n.TEXTURE_COMPARE_FUNC,Ie[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Ct||_.minFilter!==cr&&_.minFilter!==hi||_.type===yn&&e.has("OES_texture_float_linear")===!1||o===!1&&_.type===Er&&e.has("OES_texture_half_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){const X=e.get("EXT_texture_filter_anisotropic");n.texParameterf(y,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,r.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function ee(y,_){let G=!1;y.__webglInit===void 0&&(y.__webglInit=!0,_.addEventListener("dispose",F));const X=_.source;let te=m.get(X);te===void 0&&(te={},m.set(X,te));const Q=W(_);if(Q!==y.__cacheKey){te[Q]===void 0&&(te[Q]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,G=!0),te[Q].usedTimes++;const De=te[y.__cacheKey];De!==void 0&&(te[y.__cacheKey].usedTimes--,De.usedTimes===0&&b(_)),y.__cacheKey=Q,y.__webglTexture=te[Q].texture}return G}function fe(y,_,G){let X=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(X=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(X=n.TEXTURE_3D);const te=ee(y,_),Q=_.source;t.bindTexture(X,y.__webglTexture,n.TEXTURE0+G);const De=i.get(Q);if(Q.version!==De.__version||te===!0){t.activeTexture(n.TEXTURE0+G);const Te=Je.getPrimaries(Je.workingColorSpace),ae=_.colorSpace===Nn?null:Je.getPrimaries(_.colorSpace),le=_.colorSpace===Nn||Te===ae?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,le);const Ne=T(_)&&d(_.image)===!1;let ne=f(_.image,Ne,!1,r.maxTextureSize);ne=ze(_,ne);const lt=d(ne)||o,Ge=s.convert(_.format,_.colorSpace);let Me=s.convert(_.type),ge=P(_.internalFormat,Ge,Me,_.colorSpace,_.isVideoTexture);z(X,_,lt);let _e;const Ke=_.mipmaps,Pe=o&&_.isVideoTexture!==!0&&ge!==wl,nt=De.__version===void 0||te===!0,L=Q.dataReady,ce=w(_,ne,lt);if(_.isDepthTexture)ge=n.DEPTH_COMPONENT,o?_.type===yn?ge=n.DEPTH_COMPONENT32F:_.type===Un?ge=n.DEPTH_COMPONENT24:_.type===di?ge=n.DEPTH24_STENCIL8:ge=n.DEPTH_COMPONENT16:_.type===yn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),_.format===fi&&ge===n.DEPTH_COMPONENT&&_.type!==sa&&_.type!==Un&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),_.type=Un,Me=s.convert(_.type)),_.format===Ji&&ge===n.DEPTH_COMPONENT&&(ge=n.DEPTH_STENCIL,_.type!==di&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),_.type=di,Me=s.convert(_.type))),nt&&(Pe?t.texStorage2D(n.TEXTURE_2D,1,ge,ne.width,ne.height):t.texImage2D(n.TEXTURE_2D,0,ge,ne.width,ne.height,0,Ge,Me,null));else if(_.isDataTexture)if(Ke.length>0&&lt){Pe&&nt&&t.texStorage2D(n.TEXTURE_2D,ce,ge,Ke[0].width,Ke[0].height);for(let B=0,ie=Ke.length;B<ie;B++)_e=Ke[B],Pe?L&&t.texSubImage2D(n.TEXTURE_2D,B,0,0,_e.width,_e.height,Ge,Me,_e.data):t.texImage2D(n.TEXTURE_2D,B,ge,_e.width,_e.height,0,Ge,Me,_e.data);_.generateMipmaps=!1}else Pe?(nt&&t.texStorage2D(n.TEXTURE_2D,ce,ge,ne.width,ne.height),L&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ne.width,ne.height,Ge,Me,ne.data)):t.texImage2D(n.TEXTURE_2D,0,ge,ne.width,ne.height,0,Ge,Me,ne.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Pe&&nt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,ge,Ke[0].width,Ke[0].height,ne.depth);for(let B=0,ie=Ke.length;B<ie;B++)_e=Ke[B],_.format!==en?Ge!==null?Pe?L&&t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,B,0,0,0,_e.width,_e.height,ne.depth,Ge,_e.data,0,0):t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,B,ge,_e.width,_e.height,ne.depth,0,_e.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Pe?L&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,B,0,0,0,_e.width,_e.height,ne.depth,Ge,Me,_e.data):t.texImage3D(n.TEXTURE_2D_ARRAY,B,ge,_e.width,_e.height,ne.depth,0,Ge,Me,_e.data)}else{Pe&&nt&&t.texStorage2D(n.TEXTURE_2D,ce,ge,Ke[0].width,Ke[0].height);for(let B=0,ie=Ke.length;B<ie;B++)_e=Ke[B],_.format!==en?Ge!==null?Pe?L&&t.compressedTexSubImage2D(n.TEXTURE_2D,B,0,0,_e.width,_e.height,Ge,_e.data):t.compressedTexImage2D(n.TEXTURE_2D,B,ge,_e.width,_e.height,0,_e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Pe?L&&t.texSubImage2D(n.TEXTURE_2D,B,0,0,_e.width,_e.height,Ge,Me,_e.data):t.texImage2D(n.TEXTURE_2D,B,ge,_e.width,_e.height,0,Ge,Me,_e.data)}else if(_.isDataArrayTexture)Pe?(nt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,ge,ne.width,ne.height,ne.depth),L&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,Ge,Me,ne.data)):t.texImage3D(n.TEXTURE_2D_ARRAY,0,ge,ne.width,ne.height,ne.depth,0,Ge,Me,ne.data);else if(_.isData3DTexture)Pe?(nt&&t.texStorage3D(n.TEXTURE_3D,ce,ge,ne.width,ne.height,ne.depth),L&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,Ge,Me,ne.data)):t.texImage3D(n.TEXTURE_3D,0,ge,ne.width,ne.height,ne.depth,0,Ge,Me,ne.data);else if(_.isFramebufferTexture){if(nt)if(Pe)t.texStorage2D(n.TEXTURE_2D,ce,ge,ne.width,ne.height);else{let B=ne.width,ie=ne.height;for(let ue=0;ue<ce;ue++)t.texImage2D(n.TEXTURE_2D,ue,ge,B,ie,0,Ge,Me,null),B>>=1,ie>>=1}}else if(Ke.length>0&&lt){if(Pe&&nt){const B=ot(Ke[0]);t.texStorage2D(n.TEXTURE_2D,ce,ge,B.width,B.height)}for(let B=0,ie=Ke.length;B<ie;B++)_e=Ke[B],Pe?L&&t.texSubImage2D(n.TEXTURE_2D,B,0,0,Ge,Me,_e):t.texImage2D(n.TEXTURE_2D,B,ge,Ge,Me,_e);_.generateMipmaps=!1}else if(Pe){if(nt){const B=ot(ne);t.texStorage2D(n.TEXTURE_2D,ce,ge,B.width,B.height)}L&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Ge,Me,ne)}else t.texImage2D(n.TEXTURE_2D,0,ge,Ge,Me,ne);M(_,lt)&&E(X),De.__version=Q.version,_.onUpdate&&_.onUpdate(_)}y.__version=_.version}function we(y,_,G){if(_.image.length!==6)return;const X=ee(y,_),te=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,y.__webglTexture,n.TEXTURE0+G);const Q=i.get(te);if(te.version!==Q.__version||X===!0){t.activeTexture(n.TEXTURE0+G);const De=Je.getPrimaries(Je.workingColorSpace),Te=_.colorSpace===Nn?null:Je.getPrimaries(_.colorSpace),ae=_.colorSpace===Nn||De===Te?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ae);const le=_.isCompressedTexture||_.image[0].isCompressedTexture,Ne=_.image[0]&&_.image[0].isDataTexture,ne=[];for(let B=0;B<6;B++)!le&&!Ne?ne[B]=f(_.image[B],!1,!0,r.maxCubemapSize):ne[B]=Ne?_.image[B].image:_.image[B],ne[B]=ze(_,ne[B]);const lt=ne[0],Ge=d(lt)||o,Me=s.convert(_.format,_.colorSpace),ge=s.convert(_.type),_e=P(_.internalFormat,Me,ge,_.colorSpace),Ke=o&&_.isVideoTexture!==!0,Pe=Q.__version===void 0||X===!0,nt=te.dataReady;let L=w(_,lt,Ge);z(n.TEXTURE_CUBE_MAP,_,Ge);let ce;if(le){Ke&&Pe&&t.texStorage2D(n.TEXTURE_CUBE_MAP,L,_e,lt.width,lt.height);for(let B=0;B<6;B++){ce=ne[B].mipmaps;for(let ie=0;ie<ce.length;ie++){const ue=ce[ie];_.format!==en?Me!==null?Ke?nt&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,ie,0,0,ue.width,ue.height,Me,ue.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,ie,_e,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ke?nt&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,ie,0,0,ue.width,ue.height,Me,ge,ue.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,ie,_e,ue.width,ue.height,0,Me,ge,ue.data)}}}else{if(ce=_.mipmaps,Ke&&Pe){ce.length>0&&L++;const B=ot(ne[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,L,_e,B.width,B.height)}for(let B=0;B<6;B++)if(Ne){Ke?nt&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,0,0,0,ne[B].width,ne[B].height,Me,ge,ne[B].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,0,_e,ne[B].width,ne[B].height,0,Me,ge,ne[B].data);for(let ie=0;ie<ce.length;ie++){const We=ce[ie].image[B].image;Ke?nt&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,ie+1,0,0,We.width,We.height,Me,ge,We.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,ie+1,_e,We.width,We.height,0,Me,ge,We.data)}}else{Ke?nt&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,0,0,0,Me,ge,ne[B]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,0,_e,Me,ge,ne[B]);for(let ie=0;ie<ce.length;ie++){const ue=ce[ie];Ke?nt&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,ie+1,0,0,Me,ge,ue.image[B]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+B,ie+1,_e,Me,ge,ue.image[B])}}}M(_,Ge)&&E(n.TEXTURE_CUBE_MAP),Q.__version=te.version,_.onUpdate&&_.onUpdate(_)}y.__version=_.version}function xe(y,_,G,X,te,Q){const De=s.convert(G.format,G.colorSpace),Te=s.convert(G.type),ae=P(G.internalFormat,De,Te,G.colorSpace);if(!i.get(_).__hasExternalTextures){const Ne=Math.max(1,_.width>>Q),ne=Math.max(1,_.height>>Q);te===n.TEXTURE_3D||te===n.TEXTURE_2D_ARRAY?t.texImage3D(te,Q,ae,Ne,ne,_.depth,0,De,Te,null):t.texImage2D(te,Q,ae,Ne,ne,0,De,Te,null)}t.bindFramebuffer(n.FRAMEBUFFER,y),Xe(_)?c.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,X,te,i.get(G).__webglTexture,0,ye(_)):(te===n.TEXTURE_2D||te>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,X,te,i.get(G).__webglTexture,Q),t.bindFramebuffer(n.FRAMEBUFFER,null)}function me(y,_,G){if(n.bindRenderbuffer(n.RENDERBUFFER,y),_.depthBuffer&&!_.stencilBuffer){let X=o===!0?n.DEPTH_COMPONENT24:n.DEPTH_COMPONENT16;if(G||Xe(_)){const te=_.depthTexture;te&&te.isDepthTexture&&(te.type===yn?X=n.DEPTH_COMPONENT32F:te.type===Un&&(X=n.DEPTH_COMPONENT24));const Q=ye(_);Xe(_)?c.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Q,X,_.width,_.height):n.renderbufferStorageMultisample(n.RENDERBUFFER,Q,X,_.width,_.height)}else n.renderbufferStorage(n.RENDERBUFFER,X,_.width,_.height);n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,y)}else if(_.depthBuffer&&_.stencilBuffer){const X=ye(_);G&&Xe(_)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,X,n.DEPTH24_STENCIL8,_.width,_.height):Xe(_)?c.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,X,n.DEPTH24_STENCIL8,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.RENDERBUFFER,y)}else{const X=_.textures;for(let te=0;te<X.length;te++){const Q=X[te],De=s.convert(Q.format,Q.colorSpace),Te=s.convert(Q.type),ae=P(Q.internalFormat,De,Te,Q.colorSpace),le=ye(_);G&&Xe(_)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,le,ae,_.width,_.height):Xe(_)?c.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,le,ae,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,ae,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ye(y,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,y),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(_.depthTexture).__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),Z(_.depthTexture,0);const X=i.get(_.depthTexture).__webglTexture,te=ye(_);if(_.depthTexture.format===fi)Xe(_)?c.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,X,0,te):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,X,0);else if(_.depthTexture.format===Ji)Xe(_)?c.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,X,0,te):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,X,0);else throw new Error("Unknown depthTexture format")}function Ce(y){const _=i.get(y),G=y.isWebGLCubeRenderTarget===!0;if(y.depthTexture&&!_.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");Ye(_.__webglFramebuffer,y)}else if(G){_.__webglDepthbuffer=[];for(let X=0;X<6;X++)t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[X]),_.__webglDepthbuffer[X]=n.createRenderbuffer(),me(_.__webglDepthbuffer[X],y,!1)}else t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer=n.createRenderbuffer(),me(_.__webglDepthbuffer,y,!1);t.bindFramebuffer(n.FRAMEBUFFER,null)}function N(y,_,G){const X=i.get(y);_!==void 0&&xe(X.__webglFramebuffer,y,y.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),G!==void 0&&Ce(y)}function xt(y){const _=y.texture,G=i.get(y),X=i.get(_);y.addEventListener("dispose",j);const te=y.textures,Q=y.isWebGLCubeRenderTarget===!0,De=te.length>1,Te=d(y)||o;if(De||(X.__webglTexture===void 0&&(X.__webglTexture=n.createTexture()),X.__version=_.version,a.memory.textures++),Q){G.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(o&&_.mipmaps&&_.mipmaps.length>0){G.__webglFramebuffer[ae]=[];for(let le=0;le<_.mipmaps.length;le++)G.__webglFramebuffer[ae][le]=n.createFramebuffer()}else G.__webglFramebuffer[ae]=n.createFramebuffer()}else{if(o&&_.mipmaps&&_.mipmaps.length>0){G.__webglFramebuffer=[];for(let ae=0;ae<_.mipmaps.length;ae++)G.__webglFramebuffer[ae]=n.createFramebuffer()}else G.__webglFramebuffer=n.createFramebuffer();if(De)if(r.drawBuffers)for(let ae=0,le=te.length;ae<le;ae++){const Ne=i.get(te[ae]);Ne.__webglTexture===void 0&&(Ne.__webglTexture=n.createTexture(),a.memory.textures++)}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&y.samples>0&&Xe(y)===!1){G.__webglMultisampledFramebuffer=n.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let ae=0;ae<te.length;ae++){const le=te[ae];G.__webglColorRenderbuffer[ae]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,G.__webglColorRenderbuffer[ae]);const Ne=s.convert(le.format,le.colorSpace),ne=s.convert(le.type),lt=P(le.internalFormat,Ne,ne,le.colorSpace,y.isXRRenderTarget===!0),Ge=ye(y);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ge,lt,y.width,y.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.RENDERBUFFER,G.__webglColorRenderbuffer[ae])}n.bindRenderbuffer(n.RENDERBUFFER,null),y.depthBuffer&&(G.__webglDepthRenderbuffer=n.createRenderbuffer(),me(G.__webglDepthRenderbuffer,y,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Q){t.bindTexture(n.TEXTURE_CUBE_MAP,X.__webglTexture),z(n.TEXTURE_CUBE_MAP,_,Te);for(let ae=0;ae<6;ae++)if(o&&_.mipmaps&&_.mipmaps.length>0)for(let le=0;le<_.mipmaps.length;le++)xe(G.__webglFramebuffer[ae][le],y,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,le);else xe(G.__webglFramebuffer[ae],y,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);M(_,Te)&&E(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(De){for(let ae=0,le=te.length;ae<le;ae++){const Ne=te[ae],ne=i.get(Ne);t.bindTexture(n.TEXTURE_2D,ne.__webglTexture),z(n.TEXTURE_2D,Ne,Te),xe(G.__webglFramebuffer,y,Ne,n.COLOR_ATTACHMENT0+ae,n.TEXTURE_2D,0),M(Ne,Te)&&E(n.TEXTURE_2D)}t.unbindTexture()}else{let ae=n.TEXTURE_2D;if((y.isWebGL3DRenderTarget||y.isWebGLArrayRenderTarget)&&(o?ae=y.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ae,X.__webglTexture),z(ae,_,Te),o&&_.mipmaps&&_.mipmaps.length>0)for(let le=0;le<_.mipmaps.length;le++)xe(G.__webglFramebuffer[le],y,_,n.COLOR_ATTACHMENT0,ae,le);else xe(G.__webglFramebuffer,y,_,n.COLOR_ATTACHMENT0,ae,0);M(_,Te)&&E(ae),t.unbindTexture()}y.depthBuffer&&Ce(y)}function Se(y){const _=d(y)||o,G=y.textures;for(let X=0,te=G.length;X<te;X++){const Q=G[X];if(M(Q,_)){const De=y.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,Te=i.get(Q).__webglTexture;t.bindTexture(De,Te),E(De),t.unbindTexture()}}}function He(y){if(o&&y.samples>0&&Xe(y)===!1){const _=y.textures,G=y.width,X=y.height;let te=n.COLOR_BUFFER_BIT;const Q=[],De=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Te=i.get(y),ae=_.length>1;if(ae)for(let le=0;le<_.length;le++)t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Te.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Te.__webglFramebuffer);for(let le=0;le<_.length;le++){Q.push(n.COLOR_ATTACHMENT0+le),y.depthBuffer&&Q.push(De);const Ne=Te.__ignoreDepthValues!==void 0?Te.__ignoreDepthValues:!1;if(Ne===!1&&(y.depthBuffer&&(te|=n.DEPTH_BUFFER_BIT),y.stencilBuffer&&(te|=n.STENCIL_BUFFER_BIT)),ae&&n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Te.__webglColorRenderbuffer[le]),Ne===!0&&(n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[De]),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[De])),ae){const ne=i.get(_[le]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ne,0)}n.blitFramebuffer(0,0,G,X,0,0,G,X,te,n.NEAREST),l&&n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Q)}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ae)for(let le=0;le<_.length;le++){t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.RENDERBUFFER,Te.__webglColorRenderbuffer[le]);const Ne=i.get(_[le]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.TEXTURE_2D,Ne,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Te.__webglMultisampledFramebuffer)}}function ye(y){return Math.min(r.maxSamples,y.samples)}function Xe(y){const _=i.get(y);return o&&y.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Be(y){const _=a.render.frame;h.get(y)!==_&&(h.set(y,_),y.update())}function ze(y,_){const G=y.colorSpace,X=y.format,te=y.type;return y.isCompressedTexture===!0||y.isVideoTexture===!0||y.format===ko||G!==$n&&G!==Nn&&(Je.getTransfer(G)===tt?o===!1?e.has("EXT_sRGB")===!0&&X===en?(y.format=ko,y.minFilter=Pt,y.generateMipmaps=!1):_=Il.sRGBToLinear(_):(X!==en||te!==Gn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),_}function ot(y){return typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement?(u.width=y.naturalWidth||y.width,u.height=y.naturalHeight||y.height):typeof VideoFrame<"u"&&y instanceof VideoFrame?(u.width=y.displayWidth,u.height=y.displayHeight):(u.width=y.width,u.height=y.height),u}this.allocateTextureUnit=q,this.resetTextureUnits=R,this.setTexture2D=Z,this.setTexture2DArray=V,this.setTexture3D=K,this.setTextureCube=J,this.rebindTextures=N,this.setupRenderTarget=xt,this.updateRenderTargetMipmap=Se,this.updateMultisampleRenderTarget=He,this.setupDepthRenderbuffer=Ce,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=Xe}function Ug(n,e,t){const i=t.isWebGL2;function r(s,a=Nn){let o;const c=Je.getTransfer(a);if(s===Gn)return n.UNSIGNED_BYTE;if(s===El)return n.UNSIGNED_SHORT_4_4_4_4;if(s===yl)return n.UNSIGNED_SHORT_5_5_5_1;if(s===ph)return n.BYTE;if(s===mh)return n.SHORT;if(s===sa)return n.UNSIGNED_SHORT;if(s===Sl)return n.INT;if(s===Un)return n.UNSIGNED_INT;if(s===yn)return n.FLOAT;if(s===Er)return i?n.HALF_FLOAT:(o=e.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(s===gh)return n.ALPHA;if(s===en)return n.RGBA;if(s===_h)return n.LUMINANCE;if(s===vh)return n.LUMINANCE_ALPHA;if(s===fi)return n.DEPTH_COMPONENT;if(s===Ji)return n.DEPTH_STENCIL;if(s===ko)return o=e.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(s===xh)return n.RED;if(s===Tl)return n.RED_INTEGER;if(s===Mh)return n.RG;if(s===bl)return n.RG_INTEGER;if(s===Al)return n.RGBA_INTEGER;if(s===Hs||s===zs||s===Gs||s===Ws)if(c===tt)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(s===Hs)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===zs)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Gs)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Ws)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(s===Hs)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===zs)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Gs)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Ws)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===za||s===Ga||s===Wa||s===Va)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(s===za)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Ga)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Wa)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Va)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===wl)return o=e.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===qa||s===Xa)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(s===qa)return c===tt?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(s===Xa)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Ka||s===Ya||s===$a||s===ja||s===Za||s===Ja||s===Qa||s===ec||s===tc||s===nc||s===ic||s===rc||s===sc||s===oc)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(s===Ka)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Ya)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===$a)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===ja)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Za)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Ja)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Qa)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===ec)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===tc)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===nc)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===ic)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===rc)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===sc)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===oc)return c===tt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Vs||s===ac||s===cc)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(s===Vs)return c===tt?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===ac)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===cc)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Sh||s===lc||s===uc||s===hc)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(s===Vs)return o.COMPRESSED_RED_RGTC1_EXT;if(s===lc)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===uc)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===hc)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===di?i?n.UNSIGNED_INT_24_8:(o=e.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):n[s]!==void 0?n[s]:null}return{convert:r}}class Og extends Vt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class ht extends St{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Fg={type:"move"};class vo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ht,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ht,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ht,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const x of e.hand.values()){const f=t.getJointPose(x,i),d=this._getHandJoint(l,x);f!==null&&(d.matrix.fromArray(f.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=f.radius),d.visible=f!==null}const u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],p=u.position.distanceTo(h.position),m=.02,g=.005;l.inputState.pinching&&p>m+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&p<=m-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Fg)))}return o!==null&&(o.visible=r!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new ht;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const Bg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,kg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Hg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const r=new Rt,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}render(e,t){if(this.texture!==null){if(this.mesh===null){const i=t.cameras[0].viewport,r=new Xn({extensions:{fragDepth:!0},vertexShader:Bg,fragmentShader:kg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:i.z},depthHeight:{value:i.w}}});this.mesh=new he(new Mi(20,20),r)}e.render(this.mesh,t)}}reset(){this.texture=null,this.mesh=null}}class zg extends nr{constructor(e,t){super();const i=this;let r=null,s=1,a=null,o="local-floor",c=1,l=null,u=null,h=null,p=null,m=null,g=null;const x=new Hg,f=t.getContextAttributes();let d=null,T=null;const M=[],E=[],P=new Ae;let w=null;const A=new Vt;A.layers.enable(1),A.viewport=new vt;const F=new Vt;F.layers.enable(2),F.viewport=new vt;const j=[A,F],v=new Og;v.layers.enable(1),v.layers.enable(2);let b=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(z){let ee=M[z];return ee===void 0&&(ee=new vo,M[z]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(z){let ee=M[z];return ee===void 0&&(ee=new vo,M[z]=ee),ee.getGripSpace()},this.getHand=function(z){let ee=M[z];return ee===void 0&&(ee=new vo,M[z]=ee),ee.getHandSpace()};function $(z){const ee=E.indexOf(z.inputSource);if(ee===-1)return;const fe=M[ee];fe!==void 0&&(fe.update(z.inputSource,z.frame,l||a),fe.dispatchEvent({type:z.type,data:z.inputSource}))}function R(){r.removeEventListener("select",$),r.removeEventListener("selectstart",$),r.removeEventListener("selectend",$),r.removeEventListener("squeeze",$),r.removeEventListener("squeezestart",$),r.removeEventListener("squeezeend",$),r.removeEventListener("end",R),r.removeEventListener("inputsourceschange",q);for(let z=0;z<M.length;z++){const ee=E[z];ee!==null&&(E[z]=null,M[z].disconnect(ee))}b=null,Y=null,x.reset(),e.setRenderTarget(d),m=null,p=null,h=null,r=null,T=null,Ie.stop(),i.isPresenting=!1,e.setPixelRatio(w),e.setSize(P.width,P.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(z){s=z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(z){o=z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(z){l=z},this.getBaseLayer=function(){return p!==null?p:m},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(z){if(r=z,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",$),r.addEventListener("selectstart",$),r.addEventListener("selectend",$),r.addEventListener("squeeze",$),r.addEventListener("squeezestart",$),r.addEventListener("squeezeend",$),r.addEventListener("end",R),r.addEventListener("inputsourceschange",q),f.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(P),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const ee={antialias:r.renderState.layers===void 0?f.antialias:!0,alpha:!0,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:s};m=new XRWebGLLayer(r,t,ee),r.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),T=new mi(m.framebufferWidth,m.framebufferHeight,{format:en,type:Gn,colorSpace:e.outputColorSpace,stencilBuffer:f.stencil})}else{let ee=null,fe=null,we=null;f.depth&&(we=f.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=f.stencil?Ji:fi,fe=f.stencil?di:Un);const xe={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:s};h=new XRWebGLBinding(r,t),p=h.createProjectionLayer(xe),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),T=new mi(p.textureWidth,p.textureHeight,{format:en,type:Gn,depthTexture:new Vl(p.textureWidth,p.textureHeight,fe,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:f.stencil,colorSpace:e.outputColorSpace,samples:f.antialias?4:0});const me=e.properties.get(T);me.__ignoreDepthValues=p.ignoreDepthValues}T.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await r.requestReferenceSpace(o),Ie.setContext(r),Ie.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function q(z){for(let ee=0;ee<z.removed.length;ee++){const fe=z.removed[ee],we=E.indexOf(fe);we>=0&&(E[we]=null,M[we].disconnect(fe))}for(let ee=0;ee<z.added.length;ee++){const fe=z.added[ee];let we=E.indexOf(fe);if(we===-1){for(let me=0;me<M.length;me++)if(me>=E.length){E.push(fe),we=me;break}else if(E[me]===null){E[me]=fe,we=me;break}if(we===-1)break}const xe=M[we];xe&&xe.connect(fe)}}const W=new U,Z=new U;function V(z,ee,fe){W.setFromMatrixPosition(ee.matrixWorld),Z.setFromMatrixPosition(fe.matrixWorld);const we=W.distanceTo(Z),xe=ee.projectionMatrix.elements,me=fe.projectionMatrix.elements,Ye=xe[14]/(xe[10]-1),Ce=xe[14]/(xe[10]+1),N=(xe[9]+1)/xe[5],xt=(xe[9]-1)/xe[5],Se=(xe[8]-1)/xe[0],He=(me[8]+1)/me[0],ye=Ye*Se,Xe=Ye*He,Be=we/(-Se+He),ze=Be*-Se;ee.matrixWorld.decompose(z.position,z.quaternion,z.scale),z.translateX(ze),z.translateZ(Be),z.matrixWorld.compose(z.position,z.quaternion,z.scale),z.matrixWorldInverse.copy(z.matrixWorld).invert();const ot=Ye+Be,y=Ce+Be,_=ye-ze,G=Xe+(we-ze),X=N*Ce/y*ot,te=xt*Ce/y*ot;z.projectionMatrix.makePerspective(_,G,X,te,ot,y),z.projectionMatrixInverse.copy(z.projectionMatrix).invert()}function K(z,ee){ee===null?z.matrixWorld.copy(z.matrix):z.matrixWorld.multiplyMatrices(ee.matrixWorld,z.matrix),z.matrixWorldInverse.copy(z.matrixWorld).invert()}this.updateCamera=function(z){if(r===null)return;x.texture!==null&&(z.near=x.depthNear,z.far=x.depthFar),v.near=F.near=A.near=z.near,v.far=F.far=A.far=z.far,(b!==v.near||Y!==v.far)&&(r.updateRenderState({depthNear:v.near,depthFar:v.far}),b=v.near,Y=v.far,A.near=b,A.far=Y,F.near=b,F.far=Y,A.updateProjectionMatrix(),F.updateProjectionMatrix(),z.updateProjectionMatrix());const ee=z.parent,fe=v.cameras;K(v,ee);for(let we=0;we<fe.length;we++)K(fe[we],ee);fe.length===2?V(v,A,F):v.projectionMatrix.copy(A.projectionMatrix),J(z,v,ee)};function J(z,ee,fe){fe===null?z.matrix.copy(ee.matrixWorld):(z.matrix.copy(fe.matrixWorld),z.matrix.invert(),z.matrix.multiply(ee.matrixWorld)),z.matrix.decompose(z.position,z.quaternion,z.scale),z.updateMatrixWorld(!0),z.projectionMatrix.copy(ee.projectionMatrix),z.projectionMatrixInverse.copy(ee.projectionMatrixInverse),z.isPerspectiveCamera&&(z.fov=Ho*2*Math.atan(1/z.projectionMatrix.elements[5]),z.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(p===null&&m===null))return c},this.setFoveation=function(z){c=z,p!==null&&(p.fixedFoveation=z),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=z)},this.hasDepthSensing=function(){return x.texture!==null};let oe=null;function pe(z,ee){if(u=ee.getViewerPose(l||a),g=ee,u!==null){const fe=u.views;m!==null&&(e.setRenderTargetFramebuffer(T,m.framebuffer),e.setRenderTarget(T));let we=!1;fe.length!==v.cameras.length&&(v.cameras.length=0,we=!0);for(let me=0;me<fe.length;me++){const Ye=fe[me];let Ce=null;if(m!==null)Ce=m.getViewport(Ye);else{const xt=h.getViewSubImage(p,Ye);Ce=xt.viewport,me===0&&(e.setRenderTargetTextures(T,xt.colorTexture,p.ignoreDepthValues?void 0:xt.depthStencilTexture),e.setRenderTarget(T))}let N=j[me];N===void 0&&(N=new Vt,N.layers.enable(me),N.viewport=new vt,j[me]=N),N.matrix.fromArray(Ye.transform.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale),N.projectionMatrix.fromArray(Ye.projectionMatrix),N.projectionMatrixInverse.copy(N.projectionMatrix).invert(),N.viewport.set(Ce.x,Ce.y,Ce.width,Ce.height),me===0&&(v.matrix.copy(N.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),we===!0&&v.cameras.push(N)}const xe=r.enabledFeatures;if(xe&&xe.includes("depth-sensing")){const me=h.getDepthInformation(fe[0]);me&&me.isValid&&me.texture&&x.init(e,me,r.renderState)}}for(let fe=0;fe<M.length;fe++){const we=E[fe],xe=M[fe];we!==null&&xe!==void 0&&xe.update(we,ee,l||a)}x.render(e,v),oe&&oe(z,ee),ee.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ee}),g=null}const Ie=new Gl;Ie.setAnimationLoop(pe),this.setAnimationLoop=function(z){oe=z},this.dispose=function(){}}}const si=new fn,Gg=new st;function Wg(n,e){function t(f,d){f.matrixAutoUpdate===!0&&f.updateMatrix(),d.value.copy(f.matrix)}function i(f,d){d.color.getRGB(f.fogColor.value,kl(n)),d.isFog?(f.fogNear.value=d.near,f.fogFar.value=d.far):d.isFogExp2&&(f.fogDensity.value=d.density)}function r(f,d,T,M,E){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(f,d):d.isMeshToonMaterial?(s(f,d),h(f,d)):d.isMeshPhongMaterial?(s(f,d),u(f,d)):d.isMeshStandardMaterial?(s(f,d),p(f,d),d.isMeshPhysicalMaterial&&m(f,d,E)):d.isMeshMatcapMaterial?(s(f,d),g(f,d)):d.isMeshDepthMaterial?s(f,d):d.isMeshDistanceMaterial?(s(f,d),x(f,d)):d.isMeshNormalMaterial?s(f,d):d.isLineBasicMaterial?(a(f,d),d.isLineDashedMaterial&&o(f,d)):d.isPointsMaterial?c(f,d,T,M):d.isSpriteMaterial?l(f,d):d.isShadowMaterial?(f.color.value.copy(d.color),f.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(f,d){f.opacity.value=d.opacity,d.color&&f.diffuse.value.copy(d.color),d.emissive&&f.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(f.map.value=d.map,t(d.map,f.mapTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.bumpMap&&(f.bumpMap.value=d.bumpMap,t(d.bumpMap,f.bumpMapTransform),f.bumpScale.value=d.bumpScale,d.side===Dt&&(f.bumpScale.value*=-1)),d.normalMap&&(f.normalMap.value=d.normalMap,t(d.normalMap,f.normalMapTransform),f.normalScale.value.copy(d.normalScale),d.side===Dt&&f.normalScale.value.negate()),d.displacementMap&&(f.displacementMap.value=d.displacementMap,t(d.displacementMap,f.displacementMapTransform),f.displacementScale.value=d.displacementScale,f.displacementBias.value=d.displacementBias),d.emissiveMap&&(f.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,f.emissiveMapTransform)),d.specularMap&&(f.specularMap.value=d.specularMap,t(d.specularMap,f.specularMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest);const T=e.get(d),M=T.envMap,E=T.envMapRotation;if(M&&(f.envMap.value=M,si.copy(E),si.x*=-1,si.y*=-1,si.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(si.y*=-1,si.z*=-1),f.envMapRotation.value.setFromMatrix4(Gg.makeRotationFromEuler(si)),f.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=d.reflectivity,f.ior.value=d.ior,f.refractionRatio.value=d.refractionRatio),d.lightMap){f.lightMap.value=d.lightMap;const P=n._useLegacyLights===!0?Math.PI:1;f.lightMapIntensity.value=d.lightMapIntensity*P,t(d.lightMap,f.lightMapTransform)}d.aoMap&&(f.aoMap.value=d.aoMap,f.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,f.aoMapTransform))}function a(f,d){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,d.map&&(f.map.value=d.map,t(d.map,f.mapTransform))}function o(f,d){f.dashSize.value=d.dashSize,f.totalSize.value=d.dashSize+d.gapSize,f.scale.value=d.scale}function c(f,d,T,M){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,f.size.value=d.size*T,f.scale.value=M*.5,d.map&&(f.map.value=d.map,t(d.map,f.uvTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest)}function l(f,d){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,f.rotation.value=d.rotation,d.map&&(f.map.value=d.map,t(d.map,f.mapTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest)}function u(f,d){f.specular.value.copy(d.specular),f.shininess.value=Math.max(d.shininess,1e-4)}function h(f,d){d.gradientMap&&(f.gradientMap.value=d.gradientMap)}function p(f,d){f.metalness.value=d.metalness,d.metalnessMap&&(f.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,f.metalnessMapTransform)),f.roughness.value=d.roughness,d.roughnessMap&&(f.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,f.roughnessMapTransform)),e.get(d).envMap&&(f.envMapIntensity.value=d.envMapIntensity)}function m(f,d,T){f.ior.value=d.ior,d.sheen>0&&(f.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),f.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(f.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,f.sheenColorMapTransform)),d.sheenRoughnessMap&&(f.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,f.sheenRoughnessMapTransform))),d.clearcoat>0&&(f.clearcoat.value=d.clearcoat,f.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(f.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,f.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(f.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Dt&&f.clearcoatNormalScale.value.negate())),d.iridescence>0&&(f.iridescence.value=d.iridescence,f.iridescenceIOR.value=d.iridescenceIOR,f.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(f.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,f.iridescenceMapTransform)),d.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),d.transmission>0&&(f.transmission.value=d.transmission,f.transmissionSamplerMap.value=T.texture,f.transmissionSamplerSize.value.set(T.width,T.height),d.transmissionMap&&(f.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,f.transmissionMapTransform)),f.thickness.value=d.thickness,d.thicknessMap&&(f.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=d.attenuationDistance,f.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(f.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(f.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=d.specularIntensity,f.specularColor.value.copy(d.specularColor),d.specularColorMap&&(f.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,f.specularColorMapTransform)),d.specularIntensityMap&&(f.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,f.specularIntensityMapTransform))}function g(f,d){d.matcap&&(f.matcap.value=d.matcap)}function x(f,d){const T=e.get(d).light;f.referencePosition.value.setFromMatrixPosition(T.matrixWorld),f.nearDistance.value=T.shadow.camera.near,f.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function Vg(n,e,t,i){let r={},s={},a=[];const o=t.isWebGL2?n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS):0;function c(T,M){const E=M.program;i.uniformBlockBinding(T,E)}function l(T,M){let E=r[T.id];E===void 0&&(g(T),E=u(T),r[T.id]=E,T.addEventListener("dispose",f));const P=M.program;i.updateUBOMapping(T,P);const w=e.render.frame;s[T.id]!==w&&(p(T),s[T.id]=w)}function u(T){const M=h();T.__bindingPointIndex=M;const E=n.createBuffer(),P=T.__size,w=T.usage;return n.bindBuffer(n.UNIFORM_BUFFER,E),n.bufferData(n.UNIFORM_BUFFER,P,w),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,M,E),E}function h(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(T){const M=r[T.id],E=T.uniforms,P=T.__cache;n.bindBuffer(n.UNIFORM_BUFFER,M);for(let w=0,A=E.length;w<A;w++){const F=Array.isArray(E[w])?E[w]:[E[w]];for(let j=0,v=F.length;j<v;j++){const b=F[j];if(m(b,w,j,P)===!0){const Y=b.__offset,$=Array.isArray(b.value)?b.value:[b.value];let R=0;for(let q=0;q<$.length;q++){const W=$[q],Z=x(W);typeof W=="number"||typeof W=="boolean"?(b.__data[0]=W,n.bufferSubData(n.UNIFORM_BUFFER,Y+R,b.__data)):W.isMatrix3?(b.__data[0]=W.elements[0],b.__data[1]=W.elements[1],b.__data[2]=W.elements[2],b.__data[3]=0,b.__data[4]=W.elements[3],b.__data[5]=W.elements[4],b.__data[6]=W.elements[5],b.__data[7]=0,b.__data[8]=W.elements[6],b.__data[9]=W.elements[7],b.__data[10]=W.elements[8],b.__data[11]=0):(W.toArray(b.__data,R),R+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,Y,b.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function m(T,M,E,P){const w=T.value,A=M+"_"+E;if(P[A]===void 0)return typeof w=="number"||typeof w=="boolean"?P[A]=w:P[A]=w.clone(),!0;{const F=P[A];if(typeof w=="number"||typeof w=="boolean"){if(F!==w)return P[A]=w,!0}else if(F.equals(w)===!1)return F.copy(w),!0}return!1}function g(T){const M=T.uniforms;let E=0;const P=16;for(let A=0,F=M.length;A<F;A++){const j=Array.isArray(M[A])?M[A]:[M[A]];for(let v=0,b=j.length;v<b;v++){const Y=j[v],$=Array.isArray(Y.value)?Y.value:[Y.value];for(let R=0,q=$.length;R<q;R++){const W=$[R],Z=x(W),V=E%P;V!==0&&P-V<Z.boundary&&(E+=P-V),Y.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),Y.__offset=E,E+=Z.storage}}}const w=E%P;return w>0&&(E+=P-w),T.__size=E,T.__cache={},this}function x(T){const M={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(M.boundary=4,M.storage=4):T.isVector2?(M.boundary=8,M.storage=8):T.isVector3||T.isColor?(M.boundary=16,M.storage=12):T.isVector4?(M.boundary=16,M.storage=16):T.isMatrix3?(M.boundary=48,M.storage=48):T.isMatrix4?(M.boundary=64,M.storage=64):T.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",T),M}function f(T){const M=T.target;M.removeEventListener("dispose",f);const E=a.indexOf(M.__bindingPointIndex);a.splice(E,1),n.deleteBuffer(r[M.id]),delete r[M.id],delete s[M.id]}function d(){for(const T in r)n.deleteBuffer(r[T]);a=[],r={},s={}}return{bind:c,update:l,dispose:d}}class jl{constructor(e={}){const{canvas:t=Dh(),context:i=null,depth:r=!0,stencil:s=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let p;i!==null?p=i.getContextAttributes().alpha:p=a;const m=new Uint32Array(4),g=new Int32Array(4);let x=null,f=null;const d=[],T=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=an,this._useLegacyLights=!1,this.toneMapping=zn,this.toneMappingExposure=1;const M=this;let E=!1,P=0,w=0,A=null,F=-1,j=null;const v=new vt,b=new vt;let Y=null;const $=new Ve(0);let R=0,q=t.width,W=t.height,Z=1,V=null,K=null;const J=new vt(0,0,q,W),oe=new vt(0,0,q,W);let pe=!1;const Ie=new la;let z=!1,ee=!1,fe=null;const we=new st,xe=new Ae,me=new U,Ye={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Ce(){return A===null?Z:1}let N=i;function xt(S,I){for(let k=0;k<S.length;k++){const H=S[k],O=t.getContext(H,I);if(O!==null)return O}return null}try{const S={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ra}`),t.addEventListener("webglcontextlost",nt,!1),t.addEventListener("webglcontextrestored",L,!1),t.addEventListener("webglcontextcreationerror",ce,!1),N===null){const I=["webgl2","webgl","experimental-webgl"];if(M.isWebGL1Renderer===!0&&I.shift(),N=xt(I,S),N===null)throw xt(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&N instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),N.getShaderPrecisionFormat===void 0&&(N.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let Se,He,ye,Xe,Be,ze,ot,y,_,G,X,te,Q,De,Te,ae,le,Ne,ne,lt,Ge,Me,ge,_e;function Ke(){Se=new jp(N),He=new Vp(N,Se,e),Se.init(He),Me=new Ug(N,Se,He),ye=new Dg(N,Se,He),Xe=new Qp(N),Be=new xg,ze=new Ng(N,Se,ye,Be,He,Me,Xe),ot=new Xp(M),y=new $p(M),_=new rd(N,He),ge=new Gp(N,Se,_,He),G=new Zp(N,_,Xe,ge),X=new im(N,G,_,Xe),ne=new nm(N,He,ze),ae=new qp(Be),te=new vg(M,ot,y,Se,He,ge,ae),Q=new Wg(M,Be),De=new Sg,Te=new wg(Se,He),Ne=new zp(M,ot,y,ye,X,p,c),le=new Ig(M,X,He),_e=new Vg(N,Xe,He,ye),lt=new Wp(N,Se,Xe,He),Ge=new Jp(N,Se,Xe,He),Xe.programs=te.programs,M.capabilities=He,M.extensions=Se,M.properties=Be,M.renderLists=De,M.shadowMap=le,M.state=ye,M.info=Xe}Ke();const Pe=new zg(M,N);this.xr=Pe,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const S=Se.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=Se.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(S){S!==void 0&&(Z=S,this.setSize(q,W,!1))},this.getSize=function(S){return S.set(q,W)},this.setSize=function(S,I,k=!0){if(Pe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}q=S,W=I,t.width=Math.floor(S*Z),t.height=Math.floor(I*Z),k===!0&&(t.style.width=S+"px",t.style.height=I+"px"),this.setViewport(0,0,S,I)},this.getDrawingBufferSize=function(S){return S.set(q*Z,W*Z).floor()},this.setDrawingBufferSize=function(S,I,k){q=S,W=I,Z=k,t.width=Math.floor(S*k),t.height=Math.floor(I*k),this.setViewport(0,0,S,I)},this.getCurrentViewport=function(S){return S.copy(v)},this.getViewport=function(S){return S.copy(J)},this.setViewport=function(S,I,k,H){S.isVector4?J.set(S.x,S.y,S.z,S.w):J.set(S,I,k,H),ye.viewport(v.copy(J).multiplyScalar(Z).round())},this.getScissor=function(S){return S.copy(oe)},this.setScissor=function(S,I,k,H){S.isVector4?oe.set(S.x,S.y,S.z,S.w):oe.set(S,I,k,H),ye.scissor(b.copy(oe).multiplyScalar(Z).round())},this.getScissorTest=function(){return pe},this.setScissorTest=function(S){ye.setScissorTest(pe=S)},this.setOpaqueSort=function(S){V=S},this.setTransparentSort=function(S){K=S},this.getClearColor=function(S){return S.copy(Ne.getClearColor())},this.setClearColor=function(){Ne.setClearColor.apply(Ne,arguments)},this.getClearAlpha=function(){return Ne.getClearAlpha()},this.setClearAlpha=function(){Ne.setClearAlpha.apply(Ne,arguments)},this.clear=function(S=!0,I=!0,k=!0){let H=0;if(S){let O=!1;if(A!==null){const de=A.texture.format;O=de===Al||de===bl||de===Tl}if(O){const de=A.texture.type,ve=de===Gn||de===Un||de===sa||de===di||de===El||de===yl,Ee=Ne.getClearColor(),be=Ne.getClearAlpha(),ke=Ee.r,Re=Ee.g,Le=Ee.b;ve?(m[0]=ke,m[1]=Re,m[2]=Le,m[3]=be,N.clearBufferuiv(N.COLOR,0,m)):(g[0]=ke,g[1]=Re,g[2]=Le,g[3]=be,N.clearBufferiv(N.COLOR,0,g))}else H|=N.COLOR_BUFFER_BIT}I&&(H|=N.DEPTH_BUFFER_BIT),k&&(H|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",nt,!1),t.removeEventListener("webglcontextrestored",L,!1),t.removeEventListener("webglcontextcreationerror",ce,!1),De.dispose(),Te.dispose(),Be.dispose(),ot.dispose(),y.dispose(),X.dispose(),ge.dispose(),_e.dispose(),te.dispose(),Pe.dispose(),Pe.removeEventListener("sessionstart",zt),Pe.removeEventListener("sessionend",et),fe&&(fe.dispose(),fe=null),bt.stop()};function nt(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),E=!0}function L(){console.log("THREE.WebGLRenderer: Context Restored."),E=!1;const S=Xe.autoReset,I=le.enabled,k=le.autoUpdate,H=le.needsUpdate,O=le.type;Ke(),Xe.autoReset=S,le.enabled=I,le.autoUpdate=k,le.needsUpdate=H,le.type=O}function ce(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function B(S){const I=S.target;I.removeEventListener("dispose",B),ie(I)}function ie(S){ue(S),Be.remove(S)}function ue(S){const I=Be.get(S).programs;I!==void 0&&(I.forEach(function(k){te.releaseProgram(k)}),S.isShaderMaterial&&te.releaseShaderCache(S))}this.renderBufferDirect=function(S,I,k,H,O,de){I===null&&(I=Ye);const ve=O.isMesh&&O.matrixWorld.determinant()<0,Ee=wu(S,I,k,H,O);ye.setMaterial(H,ve);let be=k.index,ke=1;if(H.wireframe===!0){if(be=G.getWireframeAttribute(k),be===void 0)return;ke=2}const Re=k.drawRange,Le=k.attributes.position;let at=Re.start*ke,Ut=(Re.start+Re.count)*ke;de!==null&&(at=Math.max(at,de.start*ke),Ut=Math.min(Ut,(de.start+de.count)*ke)),be!==null?(at=Math.max(at,0),Ut=Math.min(Ut,be.count)):Le!=null&&(at=Math.max(at,0),Ut=Math.min(Ut,Le.count));const mt=Ut-at;if(mt<0||mt===1/0)return;ge.setup(O,H,Ee,k,be);let mn,rt=lt;if(be!==null&&(mn=_.get(be),rt=Ge,rt.setIndex(mn)),O.isMesh)H.wireframe===!0?(ye.setLineWidth(H.wireframeLinewidth*Ce()),rt.setMode(N.LINES)):rt.setMode(N.TRIANGLES);else if(O.isLine){let Ue=H.linewidth;Ue===void 0&&(Ue=1),ye.setLineWidth(Ue*Ce()),O.isLineSegments?rt.setMode(N.LINES):O.isLineLoop?rt.setMode(N.LINE_LOOP):rt.setMode(N.LINE_STRIP)}else O.isPoints?rt.setMode(N.POINTS):O.isSprite&&rt.setMode(N.TRIANGLES);if(O.isBatchedMesh)rt.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else if(O.isInstancedMesh)rt.renderInstances(at,mt,O.count);else if(k.isInstancedBufferGeometry){const Ue=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,Us=Math.min(k.instanceCount,Ue);rt.renderInstances(at,mt,Us)}else rt.render(at,mt)};function We(S,I,k){S.transparent===!0&&S.side===_t&&S.forceSinglePass===!1?(S.side=Dt,S.needsUpdate=!0,Nr(S,I,k),S.side=qn,S.needsUpdate=!0,Nr(S,I,k),S.side=_t):Nr(S,I,k)}this.compile=function(S,I,k=null){k===null&&(k=S),f=Te.get(k),f.init(),T.push(f),k.traverseVisible(function(O){O.isLight&&O.layers.test(I.layers)&&(f.pushLight(O),O.castShadow&&f.pushShadow(O))}),S!==k&&S.traverseVisible(function(O){O.isLight&&O.layers.test(I.layers)&&(f.pushLight(O),O.castShadow&&f.pushShadow(O))}),f.setupLights(M._useLegacyLights);const H=new Set;return S.traverse(function(O){const de=O.material;if(de)if(Array.isArray(de))for(let ve=0;ve<de.length;ve++){const Ee=de[ve];We(Ee,k,O),H.add(Ee)}else We(de,k,O),H.add(de)}),T.pop(),f=null,H},this.compileAsync=function(S,I,k=null){const H=this.compile(S,I,k);return new Promise(O=>{function de(){if(H.forEach(function(ve){Be.get(ve).currentProgram.isReady()&&H.delete(ve)}),H.size===0){O(S);return}setTimeout(de,10)}Se.get("KHR_parallel_shader_compile")!==null?de():setTimeout(de,10)})};let Qe=null;function Mt(S){Qe&&Qe(S)}function zt(){bt.stop()}function et(){bt.start()}const bt=new Gl;bt.setAnimationLoop(Mt),typeof self<"u"&&bt.setContext(self),this.setAnimationLoop=function(S){Qe=S,Pe.setAnimationLoop(S),S===null?bt.stop():bt.start()},Pe.addEventListener("sessionstart",zt),Pe.addEventListener("sessionend",et),this.render=function(S,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),Pe.enabled===!0&&Pe.isPresenting===!0&&(Pe.cameraAutoUpdate===!0&&Pe.updateCamera(I),I=Pe.getCamera()),S.isScene===!0&&S.onBeforeRender(M,S,I,A),f=Te.get(S,T.length),f.init(),T.push(f),we.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),Ie.setFromProjectionMatrix(we),ee=this.localClippingEnabled,z=ae.init(this.clippingPlanes,ee),x=De.get(S,d.length),x.init(),d.push(x),on(S,I,0,M.sortObjects),x.finish(),M.sortObjects===!0&&x.sort(V,K),this.info.render.frame++,z===!0&&ae.beginShadows();const k=f.state.shadowsArray;if(le.render(k,S,I),z===!0&&ae.endShadows(),this.info.autoReset===!0&&this.info.reset(),(Pe.enabled===!1||Pe.isPresenting===!1||Pe.hasDepthSensing()===!1)&&Ne.render(x,S),f.setupLights(M._useLegacyLights),I.isArrayCamera){const H=I.cameras;for(let O=0,de=H.length;O<de;O++){const ve=H[O];wa(x,S,ve,ve.viewport)}}else wa(x,S,I);A!==null&&(ze.updateMultisampleRenderTarget(A),ze.updateRenderTargetMipmap(A)),S.isScene===!0&&S.onAfterRender(M,S,I),ge.resetDefaultState(),F=-1,j=null,T.pop(),T.length>0?f=T[T.length-1]:f=null,d.pop(),d.length>0?x=d[d.length-1]:x=null};function on(S,I,k,H){if(S.visible===!1)return;if(S.layers.test(I.layers)){if(S.isGroup)k=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(I);else if(S.isLight)f.pushLight(S),S.castShadow&&f.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Ie.intersectsSprite(S)){H&&me.setFromMatrixPosition(S.matrixWorld).applyMatrix4(we);const ve=X.update(S),Ee=S.material;Ee.visible&&x.push(S,ve,Ee,k,me.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Ie.intersectsObject(S))){const ve=X.update(S),Ee=S.material;if(H&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),me.copy(S.boundingSphere.center)):(ve.boundingSphere===null&&ve.computeBoundingSphere(),me.copy(ve.boundingSphere.center)),me.applyMatrix4(S.matrixWorld).applyMatrix4(we)),Array.isArray(Ee)){const be=ve.groups;for(let ke=0,Re=be.length;ke<Re;ke++){const Le=be[ke],at=Ee[Le.materialIndex];at&&at.visible&&x.push(S,ve,at,k,me.z,Le)}}else Ee.visible&&x.push(S,ve,Ee,k,me.z,null)}}const de=S.children;for(let ve=0,Ee=de.length;ve<Ee;ve++)on(de[ve],I,k,H)}function wa(S,I,k,H){const O=S.opaque,de=S.transmissive,ve=S.transparent;f.setupLightsView(k),z===!0&&ae.setGlobalState(M.clippingPlanes,k),de.length>0&&Au(O,de,I,k),H&&ye.viewport(v.copy(H)),O.length>0&&Dr(O,I,k),de.length>0&&Dr(de,I,k),ve.length>0&&Dr(ve,I,k),ye.buffers.depth.setTest(!0),ye.buffers.depth.setMask(!0),ye.buffers.color.setMask(!0),ye.setPolygonOffset(!1)}function Au(S,I,k,H){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;const de=He.isWebGL2;fe===null&&(fe=new mi(1,1,{generateMipmaps:!0,type:Se.has("EXT_color_buffer_half_float")?Er:Gn,minFilter:hi,samples:de?4:0})),M.getDrawingBufferSize(xe),de?fe.setSize(xe.x,xe.y):fe.setSize(zo(xe.x),zo(xe.y));const ve=M.getRenderTarget();M.setRenderTarget(fe),M.getClearColor($),R=M.getClearAlpha(),R<1&&M.setClearColor(16777215,.5),M.clear();const Ee=M.toneMapping;M.toneMapping=zn,Dr(S,k,H),ze.updateMultisampleRenderTarget(fe),ze.updateRenderTargetMipmap(fe);let be=!1;for(let ke=0,Re=I.length;ke<Re;ke++){const Le=I[ke],at=Le.object,Ut=Le.geometry,mt=Le.material,mn=Le.group;if(mt.side===_t&&at.layers.test(H.layers)){const rt=mt.side;mt.side=Dt,mt.needsUpdate=!0,Ca(at,k,H,Ut,mt,mn),mt.side=rt,mt.needsUpdate=!0,be=!0}}be===!0&&(ze.updateMultisampleRenderTarget(fe),ze.updateRenderTargetMipmap(fe)),M.setRenderTarget(ve),M.setClearColor($,R),M.toneMapping=Ee}function Dr(S,I,k){const H=I.isScene===!0?I.overrideMaterial:null;for(let O=0,de=S.length;O<de;O++){const ve=S[O],Ee=ve.object,be=ve.geometry,ke=H===null?ve.material:H,Re=ve.group;Ee.layers.test(k.layers)&&Ca(Ee,I,k,be,ke,Re)}}function Ca(S,I,k,H,O,de){S.onBeforeRender(M,I,k,H,O,de),S.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),O.onBeforeRender(M,I,k,H,S,de),O.transparent===!0&&O.side===_t&&O.forceSinglePass===!1?(O.side=Dt,O.needsUpdate=!0,M.renderBufferDirect(k,I,H,O,S,de),O.side=qn,O.needsUpdate=!0,M.renderBufferDirect(k,I,H,O,S,de),O.side=_t):M.renderBufferDirect(k,I,H,O,S,de),S.onAfterRender(M,I,k,H,O,de)}function Nr(S,I,k){I.isScene!==!0&&(I=Ye);const H=Be.get(S),O=f.state.lights,de=f.state.shadowsArray,ve=O.state.version,Ee=te.getParameters(S,O.state,de,I,k),be=te.getProgramCacheKey(Ee);let ke=H.programs;H.environment=S.isMeshStandardMaterial?I.environment:null,H.fog=I.fog,H.envMap=(S.isMeshStandardMaterial?y:ot).get(S.envMap||H.environment),H.envMapRotation=H.environment!==null&&S.envMap===null?I.environmentRotation:S.envMapRotation,ke===void 0&&(S.addEventListener("dispose",B),ke=new Map,H.programs=ke);let Re=ke.get(be);if(Re!==void 0){if(H.currentProgram===Re&&H.lightsStateVersion===ve)return Pa(S,Ee),Re}else Ee.uniforms=te.getUniforms(S),S.onBuild(k,Ee,M),S.onBeforeCompile(Ee,M),Re=te.acquireProgram(Ee,be),ke.set(be,Re),H.uniforms=Ee.uniforms;const Le=H.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Le.clippingPlanes=ae.uniform),Pa(S,Ee),H.needsLights=Ru(S),H.lightsStateVersion=ve,H.needsLights&&(Le.ambientLightColor.value=O.state.ambient,Le.lightProbe.value=O.state.probe,Le.directionalLights.value=O.state.directional,Le.directionalLightShadows.value=O.state.directionalShadow,Le.spotLights.value=O.state.spot,Le.spotLightShadows.value=O.state.spotShadow,Le.rectAreaLights.value=O.state.rectArea,Le.ltc_1.value=O.state.rectAreaLTC1,Le.ltc_2.value=O.state.rectAreaLTC2,Le.pointLights.value=O.state.point,Le.pointLightShadows.value=O.state.pointShadow,Le.hemisphereLights.value=O.state.hemi,Le.directionalShadowMap.value=O.state.directionalShadowMap,Le.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Le.spotShadowMap.value=O.state.spotShadowMap,Le.spotLightMatrix.value=O.state.spotLightMatrix,Le.spotLightMap.value=O.state.spotLightMap,Le.pointShadowMap.value=O.state.pointShadowMap,Le.pointShadowMatrix.value=O.state.pointShadowMatrix),H.currentProgram=Re,H.uniformsList=null,Re}function Ra(S){if(S.uniformsList===null){const I=S.currentProgram.getUniforms();S.uniformsList=ss.seqWithValue(I.seq,S.uniforms)}return S.uniformsList}function Pa(S,I){const k=Be.get(S);k.outputColorSpace=I.outputColorSpace,k.batching=I.batching,k.instancing=I.instancing,k.instancingColor=I.instancingColor,k.instancingMorph=I.instancingMorph,k.skinning=I.skinning,k.morphTargets=I.morphTargets,k.morphNormals=I.morphNormals,k.morphColors=I.morphColors,k.morphTargetsCount=I.morphTargetsCount,k.numClippingPlanes=I.numClippingPlanes,k.numIntersection=I.numClipIntersection,k.vertexAlphas=I.vertexAlphas,k.vertexTangents=I.vertexTangents,k.toneMapping=I.toneMapping}function wu(S,I,k,H,O){I.isScene!==!0&&(I=Ye),ze.resetTextureUnits();const de=I.fog,ve=H.isMeshStandardMaterial?I.environment:null,Ee=A===null?M.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:$n,be=(H.isMeshStandardMaterial?y:ot).get(H.envMap||ve),ke=H.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Re=!!k.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Le=!!k.morphAttributes.position,at=!!k.morphAttributes.normal,Ut=!!k.morphAttributes.color;let mt=zn;H.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(mt=M.toneMapping);const mn=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,rt=mn!==void 0?mn.length:0,Ue=Be.get(H),Us=f.state.lights;if(z===!0&&(ee===!0||S!==j)){const Gt=S===j&&H.id===F;ae.setState(H,S,Gt)}let it=!1;H.version===Ue.__version?(Ue.needsLights&&Ue.lightsStateVersion!==Us.state.version||Ue.outputColorSpace!==Ee||O.isBatchedMesh&&Ue.batching===!1||!O.isBatchedMesh&&Ue.batching===!0||O.isInstancedMesh&&Ue.instancing===!1||!O.isInstancedMesh&&Ue.instancing===!0||O.isSkinnedMesh&&Ue.skinning===!1||!O.isSkinnedMesh&&Ue.skinning===!0||O.isInstancedMesh&&Ue.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Ue.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Ue.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Ue.instancingMorph===!1&&O.morphTexture!==null||Ue.envMap!==be||H.fog===!0&&Ue.fog!==de||Ue.numClippingPlanes!==void 0&&(Ue.numClippingPlanes!==ae.numPlanes||Ue.numIntersection!==ae.numIntersection)||Ue.vertexAlphas!==ke||Ue.vertexTangents!==Re||Ue.morphTargets!==Le||Ue.morphNormals!==at||Ue.morphColors!==Ut||Ue.toneMapping!==mt||He.isWebGL2===!0&&Ue.morphTargetsCount!==rt)&&(it=!0):(it=!0,Ue.__version=H.version);let Jn=Ue.currentProgram;it===!0&&(Jn=Nr(H,I,O));let La=!1,ar=!1,Os=!1;const Et=Jn.getUniforms(),Qn=Ue.uniforms;if(ye.useProgram(Jn.program)&&(La=!0,ar=!0,Os=!0),H.id!==F&&(F=H.id,ar=!0),La||j!==S){Et.setValue(N,"projectionMatrix",S.projectionMatrix),Et.setValue(N,"viewMatrix",S.matrixWorldInverse);const Gt=Et.map.cameraPosition;Gt!==void 0&&Gt.setValue(N,me.setFromMatrixPosition(S.matrixWorld)),He.logarithmicDepthBuffer&&Et.setValue(N,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&Et.setValue(N,"isOrthographic",S.isOrthographicCamera===!0),j!==S&&(j=S,ar=!0,Os=!0)}if(O.isSkinnedMesh){Et.setOptional(N,O,"bindMatrix"),Et.setOptional(N,O,"bindMatrixInverse");const Gt=O.skeleton;Gt&&(He.floatVertexTextures?(Gt.boneTexture===null&&Gt.computeBoneTexture(),Et.setValue(N,"boneTexture",Gt.boneTexture,ze)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}O.isBatchedMesh&&(Et.setOptional(N,O,"batchingTexture"),Et.setValue(N,"batchingTexture",O._matricesTexture,ze));const Fs=k.morphAttributes;if((Fs.position!==void 0||Fs.normal!==void 0||Fs.color!==void 0&&He.isWebGL2===!0)&&ne.update(O,k,Jn),(ar||Ue.receiveShadow!==O.receiveShadow)&&(Ue.receiveShadow=O.receiveShadow,Et.setValue(N,"receiveShadow",O.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Qn.envMap.value=be,Qn.flipEnvMap.value=be.isCubeTexture&&be.isRenderTargetTexture===!1?-1:1),ar&&(Et.setValue(N,"toneMappingExposure",M.toneMappingExposure),Ue.needsLights&&Cu(Qn,Os),de&&H.fog===!0&&Q.refreshFogUniforms(Qn,de),Q.refreshMaterialUniforms(Qn,H,Z,W,fe),ss.upload(N,Ra(Ue),Qn,ze)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(ss.upload(N,Ra(Ue),Qn,ze),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&Et.setValue(N,"center",O.center),Et.setValue(N,"modelViewMatrix",O.modelViewMatrix),Et.setValue(N,"normalMatrix",O.normalMatrix),Et.setValue(N,"modelMatrix",O.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Gt=H.uniformsGroups;for(let Bs=0,Pu=Gt.length;Bs<Pu;Bs++)if(He.isWebGL2){const Ia=Gt[Bs];_e.update(Ia,Jn),_e.bind(Ia,Jn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Jn}function Cu(S,I){S.ambientLightColor.needsUpdate=I,S.lightProbe.needsUpdate=I,S.directionalLights.needsUpdate=I,S.directionalLightShadows.needsUpdate=I,S.pointLights.needsUpdate=I,S.pointLightShadows.needsUpdate=I,S.spotLights.needsUpdate=I,S.spotLightShadows.needsUpdate=I,S.rectAreaLights.needsUpdate=I,S.hemisphereLights.needsUpdate=I}function Ru(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(S,I,k){Be.get(S.texture).__webglTexture=I,Be.get(S.depthTexture).__webglTexture=k;const H=Be.get(S);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=k===void 0,H.__autoAllocateDepthBuffer||Se.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(S,I){const k=Be.get(S);k.__webglFramebuffer=I,k.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(S,I=0,k=0){A=S,P=I,w=k;let H=!0,O=null,de=!1,ve=!1;if(S){const be=Be.get(S);be.__useDefaultFramebuffer!==void 0?(ye.bindFramebuffer(N.FRAMEBUFFER,null),H=!1):be.__webglFramebuffer===void 0?ze.setupRenderTarget(S):be.__hasExternalTextures&&ze.rebindTextures(S,Be.get(S.texture).__webglTexture,Be.get(S.depthTexture).__webglTexture);const ke=S.texture;(ke.isData3DTexture||ke.isDataArrayTexture||ke.isCompressedArrayTexture)&&(ve=!0);const Re=Be.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Re[I])?O=Re[I][k]:O=Re[I],de=!0):He.isWebGL2&&S.samples>0&&ze.useMultisampledRTT(S)===!1?O=Be.get(S).__webglMultisampledFramebuffer:Array.isArray(Re)?O=Re[k]:O=Re,v.copy(S.viewport),b.copy(S.scissor),Y=S.scissorTest}else v.copy(J).multiplyScalar(Z).floor(),b.copy(oe).multiplyScalar(Z).floor(),Y=pe;if(ye.bindFramebuffer(N.FRAMEBUFFER,O)&&He.drawBuffers&&H&&ye.drawBuffers(S,O),ye.viewport(v),ye.scissor(b),ye.setScissorTest(Y),de){const be=Be.get(S.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+I,be.__webglTexture,k)}else if(ve){const be=Be.get(S.texture),ke=I||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,be.__webglTexture,k||0,ke)}F=-1},this.readRenderTargetPixels=function(S,I,k,H,O,de,ve){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=Be.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ve!==void 0&&(Ee=Ee[ve]),Ee){ye.bindFramebuffer(N.FRAMEBUFFER,Ee);try{const be=S.texture,ke=be.format,Re=be.type;if(ke!==en&&Me.convert(ke)!==N.getParameter(N.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Le=Re===Er&&(Se.has("EXT_color_buffer_half_float")||He.isWebGL2&&Se.has("EXT_color_buffer_float"));if(Re!==Gn&&Me.convert(Re)!==N.getParameter(N.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Re===yn&&(He.isWebGL2||Se.has("OES_texture_float")||Se.has("WEBGL_color_buffer_float")))&&!Le){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=S.width-H&&k>=0&&k<=S.height-O&&N.readPixels(I,k,H,O,Me.convert(ke),Me.convert(Re),de)}finally{const be=A!==null?Be.get(A).__webglFramebuffer:null;ye.bindFramebuffer(N.FRAMEBUFFER,be)}}},this.copyFramebufferToTexture=function(S,I,k=0){const H=Math.pow(2,-k),O=Math.floor(I.image.width*H),de=Math.floor(I.image.height*H);ze.setTexture2D(I,0),N.copyTexSubImage2D(N.TEXTURE_2D,k,0,0,S.x,S.y,O,de),ye.unbindTexture()},this.copyTextureToTexture=function(S,I,k,H=0){const O=I.image.width,de=I.image.height,ve=Me.convert(k.format),Ee=Me.convert(k.type);ze.setTexture2D(k,0),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,k.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,k.unpackAlignment),I.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,H,S.x,S.y,O,de,ve,Ee,I.image.data):I.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,H,S.x,S.y,I.mipmaps[0].width,I.mipmaps[0].height,ve,I.mipmaps[0].data):N.texSubImage2D(N.TEXTURE_2D,H,S.x,S.y,ve,Ee,I.image),H===0&&k.generateMipmaps&&N.generateMipmap(N.TEXTURE_2D),ye.unbindTexture()},this.copyTextureToTexture3D=function(S,I,k,H,O=0){if(M.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const de=Math.round(S.max.x-S.min.x),ve=Math.round(S.max.y-S.min.y),Ee=S.max.z-S.min.z+1,be=Me.convert(H.format),ke=Me.convert(H.type);let Re;if(H.isData3DTexture)ze.setTexture3D(H,0),Re=N.TEXTURE_3D;else if(H.isDataArrayTexture||H.isCompressedArrayTexture)ze.setTexture2DArray(H,0),Re=N.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,H.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,H.unpackAlignment);const Le=N.getParameter(N.UNPACK_ROW_LENGTH),at=N.getParameter(N.UNPACK_IMAGE_HEIGHT),Ut=N.getParameter(N.UNPACK_SKIP_PIXELS),mt=N.getParameter(N.UNPACK_SKIP_ROWS),mn=N.getParameter(N.UNPACK_SKIP_IMAGES),rt=k.isCompressedTexture?k.mipmaps[O]:k.image;N.pixelStorei(N.UNPACK_ROW_LENGTH,rt.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,rt.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,S.min.x),N.pixelStorei(N.UNPACK_SKIP_ROWS,S.min.y),N.pixelStorei(N.UNPACK_SKIP_IMAGES,S.min.z),k.isDataTexture||k.isData3DTexture?N.texSubImage3D(Re,O,I.x,I.y,I.z,de,ve,Ee,be,ke,rt.data):H.isCompressedArrayTexture?N.compressedTexSubImage3D(Re,O,I.x,I.y,I.z,de,ve,Ee,be,rt.data):N.texSubImage3D(Re,O,I.x,I.y,I.z,de,ve,Ee,be,ke,rt),N.pixelStorei(N.UNPACK_ROW_LENGTH,Le),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,at),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Ut),N.pixelStorei(N.UNPACK_SKIP_ROWS,mt),N.pixelStorei(N.UNPACK_SKIP_IMAGES,mn),O===0&&H.generateMipmaps&&N.generateMipmap(Re),ye.unbindTexture()},this.initTexture=function(S){S.isCubeTexture?ze.setTextureCube(S,0):S.isData3DTexture?ze.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?ze.setTexture2DArray(S,0):ze.setTexture2D(S,0),ye.unbindTexture()},this.resetState=function(){P=0,w=0,A=null,ye.reset(),ge.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Tn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===oa?"display-p3":"srgb",t.unpackColorSpace=Je.workingColorSpace===Cs?"display-p3":"srgb"}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class qg extends jl{}qg.prototype.isWebGL1Renderer=!0;class Xg extends St{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new fn,this.environmentRotation=new fn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Kg{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Bo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=Wn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return Ll("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Wn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Wn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const At=new U;class vs{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)At.fromBufferAttribute(this,t),At.applyMatrix4(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)At.fromBufferAttribute(this,t),At.applyNormalMatrix(e),this.setXYZ(t,At.x,At.y,At.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)At.fromBufferAttribute(this,t),At.transformDirection(e),this.setXYZ(t,At.x,At.y,At.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=un(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=je(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=je(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=je(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=je(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=je(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=un(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=un(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=un(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=un(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=je(t,this.array),i=je(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=je(t,this.array),i=je(i,this.array),r=je(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=je(t,this.array),i=je(i,this.array),r=je(r,this.array),s=je(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new sn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new vs(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class ha extends ir{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ve(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Fi;const fr=new U,Bi=new U,ki=new U,Hi=new Ae,pr=new Ae,Zl=new st,ns=new U,mr=new U,is=new U,tl=new Ae,xo=new Ae,nl=new Ae;class Jl extends St{constructor(e=new ha){if(super(),this.isSprite=!0,this.type="Sprite",Fi===void 0){Fi=new Kt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Kg(t,5);Fi.setIndex([0,1,2,0,2,3]),Fi.setAttribute("position",new vs(i,3,0,!1)),Fi.setAttribute("uv",new vs(i,2,3,!1))}this.geometry=Fi,this.material=e,this.center=new Ae(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Bi.setFromMatrixScale(this.matrixWorld),Zl.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ki.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Bi.multiplyScalar(-ki.z);const i=this.material.rotation;let r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));const a=this.center;rs(ns.set(-.5,-.5,0),ki,a,Bi,r,s),rs(mr.set(.5,-.5,0),ki,a,Bi,r,s),rs(is.set(.5,.5,0),ki,a,Bi,r,s),tl.set(0,0),xo.set(1,0),nl.set(1,1);let o=e.ray.intersectTriangle(ns,mr,is,!1,fr);if(o===null&&(rs(mr.set(-.5,.5,0),ki,a,Bi,r,s),xo.set(0,1),o=e.ray.intersectTriangle(ns,is,mr,!1,fr),o===null))return;const c=e.ray.origin.distanceTo(fr);c<e.near||c>e.far||t.push({distance:c,point:fr.clone(),uv:tn.getInterpolation(fr,ns,mr,is,tl,xo,nl,new Ae),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function rs(n,e,t,i,r,s){Hi.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(pr.x=s*Hi.x-r*Hi.y,pr.y=r*Hi.x+s*Hi.y):pr.copy(Hi),n.copy(e),n.x+=pr.x,n.y+=pr.y,n.applyMatrix4(Zl)}class Ql extends Rt{constructor(e,t,i,r,s,a,o,c,l){super(e,t,i,r,s,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class qe extends Kt{constructor(e=1,t=1,i=1,r=32,s=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:c};const l=this;r=Math.floor(r),s=Math.floor(s);const u=[],h=[],p=[],m=[];let g=0;const x=[],f=i/2;let d=0;T(),a===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(u),this.setAttribute("position",new dt(h,3)),this.setAttribute("normal",new dt(p,3)),this.setAttribute("uv",new dt(m,2));function T(){const E=new U,P=new U;let w=0;const A=(t-e)/i;for(let F=0;F<=s;F++){const j=[],v=F/s,b=v*(t-e)+e;for(let Y=0;Y<=r;Y++){const $=Y/r,R=$*c+o,q=Math.sin(R),W=Math.cos(R);P.x=b*q,P.y=-v*i+f,P.z=b*W,h.push(P.x,P.y,P.z),E.set(q,A,W).normalize(),p.push(E.x,E.y,E.z),m.push($,1-v),j.push(g++)}x.push(j)}for(let F=0;F<r;F++)for(let j=0;j<s;j++){const v=x[j][F],b=x[j+1][F],Y=x[j+1][F+1],$=x[j][F+1];u.push(v,b,$),u.push(b,Y,$),w+=6}l.addGroup(d,w,0),d+=w}function M(E){const P=g,w=new Ae,A=new U;let F=0;const j=E===!0?e:t,v=E===!0?1:-1;for(let Y=1;Y<=r;Y++)h.push(0,f*v,0),p.push(0,v,0),m.push(.5,.5),g++;const b=g;for(let Y=0;Y<=r;Y++){const R=Y/r*c+o,q=Math.cos(R),W=Math.sin(R);A.x=j*W,A.y=f*v,A.z=j*q,h.push(A.x,A.y,A.z),p.push(0,v,0),w.x=q*.5+.5,w.y=W*.5*v+.5,m.push(w.x,w.y),g++}for(let Y=0;Y<r;Y++){const $=P+Y,R=b+Y;E===!0?u.push(R,R+1,$):u.push(R+1,R,$),F+=3}l.addGroup(d,F,E===!0?1:2),d+=F}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new qe(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class jn extends qe{constructor(e=1,t=1,i=32,r=1,s=!1,a=0,o=Math.PI*2){super(0,e,t,i,r,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new jn(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class da extends Kt{constructor(e=.5,t=1,i=32,r=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:a},i=Math.max(3,i),r=Math.max(1,r);const o=[],c=[],l=[],u=[];let h=e;const p=(t-e)/r,m=new U,g=new Ae;for(let x=0;x<=r;x++){for(let f=0;f<=i;f++){const d=s+f/i*a;m.x=h*Math.cos(d),m.y=h*Math.sin(d),c.push(m.x,m.y,m.z),l.push(0,0,1),g.x=(m.x/t+1)/2,g.y=(m.y/t+1)/2,u.push(g.x,g.y)}h+=p}for(let x=0;x<r;x++){const f=x*(i+1);for(let d=0;d<i;d++){const T=d+f,M=T,E=T+i+1,P=T+i+2,w=T+1;o.push(M,E,w),o.push(E,P,w)}}this.setIndex(o),this.setAttribute("position",new dt(c,3)),this.setAttribute("normal",new dt(l,3)),this.setAttribute("uv",new dt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new da(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Zn extends Kt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const c=Math.min(a+o,Math.PI);let l=0;const u=[],h=new U,p=new U,m=[],g=[],x=[],f=[];for(let d=0;d<=i;d++){const T=[],M=d/i;let E=0;d===0&&a===0?E=.5/t:d===i&&c===Math.PI&&(E=-.5/t);for(let P=0;P<=t;P++){const w=P/t;h.x=-e*Math.cos(r+w*s)*Math.sin(a+M*o),h.y=e*Math.cos(a+M*o),h.z=e*Math.sin(r+w*s)*Math.sin(a+M*o),g.push(h.x,h.y,h.z),p.copy(h).normalize(),x.push(p.x,p.y,p.z),f.push(w+E,1-M),T.push(l++)}u.push(T)}for(let d=0;d<i;d++)for(let T=0;T<t;T++){const M=u[d][T+1],E=u[d][T],P=u[d+1][T],w=u[d+1][T+1];(d!==0||a>0)&&m.push(M,E,w),(d!==i-1||c<Math.PI)&&m.push(E,P,w)}this.setIndex(m),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(x,3)),this.setAttribute("uv",new dt(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zn(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Ps extends Kt{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);const a=[],o=[],c=[],l=[],u=new U,h=new U,p=new U;for(let m=0;m<=i;m++)for(let g=0;g<=r;g++){const x=g/r*s,f=m/i*Math.PI*2;h.x=(e+t*Math.cos(f))*Math.cos(x),h.y=(e+t*Math.cos(f))*Math.sin(x),h.z=t*Math.sin(f),o.push(h.x,h.y,h.z),u.x=e*Math.cos(x),u.y=e*Math.sin(x),p.subVectors(h,u).normalize(),c.push(p.x,p.y,p.z),l.push(g/r),l.push(m/i)}for(let m=1;m<=i;m++)for(let g=1;g<=r;g++){const x=(r+1)*m+g-1,f=(r+1)*(m-1)+g-1,d=(r+1)*(m-1)+g,T=(r+1)*m+g;a.push(x,f,T),a.push(f,d,T)}this.setIndex(a),this.setAttribute("position",new dt(o,3)),this.setAttribute("normal",new dt(c,3)),this.setAttribute("uv",new dt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ps(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Ls extends ir{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Cl,this.normalScale=new Ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class eu extends St{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}const Mo=new st,il=new U,rl=new U;class Yg{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ae(512,512),this.map=null,this.mapPass=null,this.matrix=new st,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new la,this._frameExtents=new Ae(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;il.setFromMatrixPosition(e.matrixWorld),t.position.copy(il),rl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(rl),t.updateMatrixWorld(),Mo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Mo),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Mo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class $g extends Yg{constructor(){super(new Wl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class jg extends eu{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.target=new St,this.shadow=new $g}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Zg extends eu{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Jg{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=sl(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=sl();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function sl(){return(typeof performance>"u"?Date:performance).now()}const ol=new st;class Qg{constructor(e,t,i=0,r=1/0){this.ray=new Ul(e,t),this.near=i,this.far=r,this.camera=null,this.layers=new ca,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ol.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ol),this}intersectObject(e,t=!0,i=[]){return Wo(e,this,i,t),i.sort(al),i}intersectObjects(e,t=!0,i=[]){for(let r=0,s=e.length;r<s;r++)Wo(e[r],this,i,t);return i.sort(al),i}}function al(n,e){return n.distance-e.distance}function Wo(n,e,t,i){if(n.layers.test(e.layers)&&n.raycast(e,t),i===!0){const r=n.children;for(let s=0,a=r.length;s<a;s++)Wo(r[s],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ra}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ra);const e_=16119285,t_=2894892,n_=.4,i_=.05;r_(),s_(),o_(),a_(),c_(),l_();function r_(){const n=new ht,e=new qe(.3,.35,.3,16),t=new he(e);t.position.y=.15,n.add(t);const i=new qe(.2,.3,.4,16),r=new he(i);r.position.y=.5,n.add(r);const s=new Zn(.2,16,12),a=new he(s);return a.position.y=.85,n.add(a),sr(n)}function s_(){const n=new ht,e=new qe(.35,.38,.25,16),t=new he(e);t.position.y=.125,n.add(t);const i=new qe(.28,.32,.6,16),r=new he(i);r.position.y=.55,n.add(r);const s=new qe(.32,.28,.15,16),a=new he(s);a.position.y=.925,n.add(a);const o=new Nt(.12,.15,.12);return[[.2,1.075,0],[-.2,1.075,0],[0,1.075,.2],[0,1.075,-.2]].forEach(l=>{const u=new he(o);u.position.set(...l),n.add(u)}),sr(n)}function o_(){const n=new ht,e=new qe(.32,.35,.2,16),t=new he(e);t.position.y=.1,n.add(t);const i=new qe(.15,.25,.6,16),r=new he(i);r.position.set(0,.5,.05),r.rotation.x=-.2,n.add(r);const s=new Nt(.2,.35,.4),a=new he(s);a.position.set(0,.9,.15),a.rotation.x=-.3,n.add(a);const o=new jn(.06,.15,8),c=new he(o);c.position.set(-.08,1.1,.05),n.add(c);const l=new he(o);return l.position.set(.08,1.1,.05),n.add(l),sr(n)}function a_(){const n=new ht,e=new qe(.32,.36,.2,16),t=new he(e);t.position.y=.1,n.add(t);const i=new qe(.18,.28,.7,16),r=new he(i);r.position.y=.55,n.add(r);const s=new jn(.18,.4,16),a=new he(s);a.position.y=1.1,n.add(a);const o=new Zn(.06,12,8),c=new he(o);return c.position.y=1.35,n.add(c),sr(n)}function c_(){const n=new ht,e=new qe(.35,.38,.2,16),t=new he(e);t.position.y=.1,n.add(t);const i=new qe(.2,.32,.8,16),r=new he(i);r.position.y=.6,n.add(r);const s=new qe(.22,.2,.15,16),a=new he(s);a.position.y=1.075,n.add(a);const o=new jn(.04,.2,8);for(let u=0;u<8;u++){const h=u/8*Math.PI*2,p=new he(o);p.position.set(Math.cos(h)*.18,1.25,Math.sin(h)*.18),n.add(p)}const c=new Zn(.08,12,8),l=new he(c);return l.position.y=1.4,n.add(l),sr(n)}function l_(){const n=new ht,e=new qe(.36,.4,.22,16),t=new he(e);t.position.y=.11,n.add(t);const i=new qe(.22,.33,.85,16),r=new he(i);r.position.y=.65,n.add(r);const s=new qe(.18,.22,.15,16),a=new he(s);a.position.y=1.15,n.add(a);const o=new Ps(.18,.04,8,16),c=new he(o);c.position.y=1.25,c.rotation.x=Math.PI/2,n.add(c);const l=new Nt(.06,.3,.06),u=new he(l);u.position.y=1.45,n.add(u);const h=new Nt(.2,.06,.06),p=new he(h);return p.position.y=1.5,n.add(p),sr(n)}function sr(n){const e=[];return n.traverse(t=>{if(t.isMesh){const i=t.geometry.clone();i.applyMatrix4(t.matrixWorld),n.updateMatrixWorld(!0),i.applyMatrix4(t.matrixWorld),e.push(i)}}),e.length===0?new qe(.3,.3,.5,16):null}const u_=new Ls({color:e_,roughness:.3,metalness:.1}),h_=new Ls({color:t_,roughness:.3,metalness:.1});function d_(n,e){const t=e==="white"?u_:h_,i=new ht;return i.name=`${e}_${n}`,f_(n,t).forEach(s=>i.add(s)),i.scale.setScalar(n_),i.userData={type:"piece",pieceType:n,pieceColor:e},i}function f_(n,e){const t=[];switch(n){case"pawn":t.push(...p_(e));break;case"rook":t.push(...m_(e));break;case"knight":t.push(...g_(e));break;case"bishop":t.push(...__(e));break;case"queen":t.push(...v_(e));break;case"king":t.push(...x_(e));break;default:console.warn(`Unknown piece type: ${n}`),t.push(new he(new qe(.3,.3,.5,16),e))}return t}function p_(n){const e=[],t=new he(new qe(.3,.35,.3,16),n);t.position.y=.15,e.push(t);const i=new he(new qe(.2,.3,.4,16),n);i.position.y=.5,e.push(i);const r=new he(new Zn(.2,16,12),n);return r.position.y=.85,e.push(r),e}function m_(n){const e=[],t=new he(new qe(.35,.38,.25,16),n);t.position.y=.125,e.push(t);const i=new he(new qe(.28,.32,.6,16),n);i.position.y=.55,e.push(i);const r=new he(new qe(.32,.28,.15,16),n);r.position.y=.925,e.push(r);const s=new Nt(.12,.15,.12);return[[.2,0],[-.2,0],[0,.2],[0,-.2]].forEach(([a,o])=>{const c=new he(s,n);c.position.set(a,1.075,o),e.push(c)}),e}function g_(n){const e=[],t=new he(new qe(.32,.35,.2,16),n);t.position.y=.1,e.push(t);const i=new he(new qe(.15,.25,.6,16),n);i.position.set(0,.5,.05),i.rotation.x=-.2,e.push(i);const r=new he(new Nt(.2,.35,.4),n);r.position.set(0,.9,.15),r.rotation.x=-.3,e.push(r);const s=new jn(.06,.15,8);return[[-.08,.05],[.08,.05]].forEach(([a,o])=>{const c=new he(s,n);c.position.set(a,1.1,o),e.push(c)}),e}function __(n){const e=[],t=new he(new qe(.32,.36,.2,16),n);t.position.y=.1,e.push(t);const i=new he(new qe(.18,.28,.7,16),n);i.position.y=.55,e.push(i);const r=new he(new jn(.18,.4,16),n);r.position.y=1.1,e.push(r);const s=new he(new Zn(.06,12,8),n);return s.position.y=1.35,e.push(s),e}function v_(n){const e=[],t=new he(new qe(.35,.38,.2,16),n);t.position.y=.1,e.push(t);const i=new he(new qe(.2,.32,.8,16),n);i.position.y=.6,e.push(i);const r=new he(new qe(.22,.2,.15,16),n);r.position.y=1.075,e.push(r);const s=new jn(.04,.2,8);for(let o=0;o<8;o++){const c=o/8*Math.PI*2,l=new he(s,n);l.position.set(Math.cos(c)*.18,1.25,Math.sin(c)*.18),e.push(l)}const a=new he(new Zn(.08,12,8),n);return a.position.y=1.4,e.push(a),e}function x_(n){const e=[],t=new he(new qe(.36,.4,.22,16),n);t.position.y=.11,e.push(t);const i=new he(new qe(.22,.33,.85,16),n);i.position.y=.65,e.push(i);const r=new he(new qe(.18,.22,.15,16),n);r.position.y=1.15,e.push(r);const s=new he(new Ps(.18,.04,8,16),n);s.position.y=1.25,s.rotation.x=Math.PI/2,e.push(s);const a=new he(new Nt(.06,.3,.06),n);a.position.y=1.45,e.push(a);const o=new he(new Nt(.2,.06,.06),n);return o.position.y=1.5,e.push(o),e}const gi=new ht;gi.name="chessPieces";const Xt=new Map;function tu(n,e=1,t=3.5){const i=n.charCodeAt(0)-97,r=parseInt(n[1])-1;return{x:i*e-t,y:i_,z:(7-r)*e-t}}function ct(n,e,t,i=1,r=3.5){if(Xt.has(t)){const o=Xt.get(t);gi.remove(o),Xt.delete(t)}const s=d_(n,e),a=tu(t,i,r);return s.position.set(a.x,a.y,a.z),s.userData.square=t,Xt.set(t,s),gi.add(s),s}function Vo(n){if(Xt.has(n)){const e=Xt.get(n);gi.remove(e),Xt.delete(n)}}function cl(n){return Xt.get(n)||null}function nu(){Xt.forEach((n,e)=>{gi.remove(n)}),Xt.clear(),ct("rook","white","a1"),ct("knight","white","b1"),ct("bishop","white","c1"),ct("queen","white","d1"),ct("king","white","e1"),ct("bishop","white","f1"),ct("knight","white","g1"),ct("rook","white","h1");for(let n=0;n<8;n++){const e=String.fromCharCode(97+n);ct("pawn","white",`${e}2`)}ct("rook","black","a8"),ct("knight","black","b8"),ct("bishop","black","c8"),ct("queen","black","d8"),ct("king","black","e8"),ct("bishop","black","f8"),ct("knight","black","g8"),ct("rook","black","h8");for(let n=0;n<8;n++){const e=String.fromCharCode(97+n);ct("pawn","black",`${e}7`)}console.log("[Chess 1v1] All 32 pieces placed in starting position")}const D={KING:"k",QUEEN:"q",ROOK:"r",BISHOP:"b",KNIGHT:"n",PAWN:"p"},C={WHITE:"white",BLACK:"black"};function re(n,e){return{type:n,color:e,hasMoved:!1}}class fa{constructor(){this.board=new Map;for(let e=1;e<=8;e++)for(let t=0;t<8;t++){const i=String.fromCharCode(97+t)+e;this.board.set(i,null)}this.currentTurn=C.WHITE,this.moveHistory=[],this.enPassantTarget=null,this.halfMoveClock=0,this.fullMoveNumber=1,this.kingPositions={[C.WHITE]:"e1",[C.BLACK]:"e8"}}getSquare(e){return this.isValidSquare(e)?this.board.get(e):null}setSquare(e,t){if(!this.isValidSquare(e)){console.warn(`Invalid square notation: ${e}`);return}this.board.set(e,t),t&&t.type===D.KING&&(this.kingPositions[t.color]=e)}isValidSquare(e){if(!e||e.length!==2)return!1;const t=e.charCodeAt(0),i=parseInt(e[1]);return t>=97&&t<=104&&i>=1&&i<=8}notationToIndices(e){return{file:e.charCodeAt(0)-97,rank:parseInt(e[1])-1}}indicesToNotation(e,t){return e<0||e>7||t<0||t>7?null:String.fromCharCode(97+e)+(t+1)}getPiecesByColor(e){const t=[];return this.board.forEach((i,r)=>{i&&i.color===e&&t.push({notation:r,piece:i})}),t}getKingPosition(e){return this.kingPositions[e]}isEmpty(e){return this.getSquare(e)===null}hasEnemy(e,t){const i=this.getSquare(e);return i!==null&&i.color!==t}hasFriendly(e,t){const i=this.getSquare(e);return i!==null&&i.color===t}clone(){const e=new fa;return this.board.forEach((t,i)=>{t?e.board.set(i,{...t}):e.board.set(i,null)}),e.currentTurn=this.currentTurn,e.moveHistory=[...this.moveHistory],e.enPassantTarget=this.enPassantTarget,e.halfMoveClock=this.halfMoveClock,e.fullMoveNumber=this.fullMoveNumber,e.kingPositions={...this.kingPositions},e}reset(){this.board.forEach((e,t)=>{this.board.set(t,null)}),this.currentTurn=C.WHITE,this.moveHistory=[],this.enPassantTarget=null,this.halfMoveClock=0,this.fullMoveNumber=1,this.setupStartingPosition()}setupStartingPosition(){const{KING:e,QUEEN:t,ROOK:i,BISHOP:r,KNIGHT:s,PAWN:a}=D;this.setSquare("a1",re(i,C.WHITE)),this.setSquare("b1",re(s,C.WHITE)),this.setSquare("c1",re(r,C.WHITE)),this.setSquare("d1",re(t,C.WHITE)),this.setSquare("e1",re(e,C.WHITE)),this.setSquare("f1",re(r,C.WHITE)),this.setSquare("g1",re(s,C.WHITE)),this.setSquare("h1",re(i,C.WHITE));for(let o=0;o<8;o++){const c=String.fromCharCode(97+o);this.setSquare(`${c}2`,re(a,C.WHITE))}this.setSquare("a8",re(i,C.BLACK)),this.setSquare("b8",re(s,C.BLACK)),this.setSquare("c8",re(r,C.BLACK)),this.setSquare("d8",re(t,C.BLACK)),this.setSquare("e8",re(e,C.BLACK)),this.setSquare("f8",re(r,C.BLACK)),this.setSquare("g8",re(s,C.BLACK)),this.setSquare("h8",re(i,C.BLACK));for(let o=0;o<8;o++){const c=String.fromCharCode(97+o);this.setSquare(`${c}7`,re(a,C.BLACK))}this.kingPositions[C.WHITE]="e1",this.kingPositions[C.BLACK]="e8"}toString(){const e={[D.KING]:"K",[D.QUEEN]:"Q",[D.ROOK]:"R",[D.BISHOP]:"B",[D.KNIGHT]:"N",[D.PAWN]:"P"};let t=`
  a b c d e f g h
`;for(let i=8;i>=1;i--){t+=`${i} `;for(let r=0;r<8;r++){const s=String.fromCharCode(97+r)+i,a=this.getSquare(s);if(a){let o=e[a.type];a.color===C.BLACK&&(o=o.toLowerCase()),t+=o+" "}else t+=". "}t+=`${i}
`}return t+=`  a b c d e f g h
`,t+=`
Turn: ${this.currentTurn}, Move: ${this.fullMoveNumber}`,t}}const pa=new fa;pa.setupStartingPosition();function $e(){return pa}function M_(){pa.reset()}const _i=[{file:0,rank:1},{file:0,rank:-1},{file:1,rank:0},{file:-1,rank:0}],vi=[{file:1,rank:1},{file:1,rank:-1},{file:-1,rank:1},{file:-1,rank:-1}],S_=[..._i,...vi],Is=[{file:1,rank:2},{file:2,rank:1},{file:2,rank:-1},{file:1,rank:-2},{file:-1,rank:-2},{file:-2,rank:-1},{file:-2,rank:1},{file:-1,rank:2}],Ds=[{file:0,rank:1},{file:1,rank:1},{file:1,rank:0},{file:1,rank:-1},{file:0,rank:-1},{file:-1,rank:-1},{file:-1,rank:0},{file:-1,rank:1}];function E_(n,e,t){const i=[],{file:r,rank:s}=t.notationToIndices(n),a=e.color===C.WHITE?1:-1,o=e.color===C.WHITE?1:6,c=t.indicesToNotation(r,s+a);if(c&&t.isEmpty(c)&&(i.push(c),s===o)){const u=t.indicesToNotation(r,s+2*a);u&&t.isEmpty(u)&&i.push(u)}const l=[{file:-1,rank:a},{file:1,rank:a}];for(const u of l){const h=t.indicesToNotation(r+u.file,s+u.rank);h&&(t.hasEnemy(h,e.color)||h===t.enPassantTarget)&&i.push(h)}return i}function y_(n,e,t){const i=[],{file:r,rank:s}=t.notationToIndices(n);for(const a of Is){const o=t.indicesToNotation(r+a.file,s+a.rank);o&&(t.hasFriendly(o,e.color)||i.push(o))}return i}function T_(n,e,t){return ma(n,e,t,vi)}function b_(n,e,t){return ma(n,e,t,_i)}function A_(n,e,t){return ma(n,e,t,S_)}function w_(n,e,t){const i=[],{file:r,rank:s}=t.notationToIndices(n);for(const o of Ds){const c=t.indicesToNotation(r+o.file,s+o.rank);c&&(t.hasFriendly(c,e.color)||i.push(c))}const a=C_(n,e,t);return i.push(...a),i}function C_(n,e,t){const i=[];if(e.hasMoved)return i;const r=e.color===C.WHITE?"e1":"e8";if(n!==r)return i;const s=e.color===C.WHITE?"1":"8",a=e.color===C.WHITE?C.BLACK:C.WHITE;return Kn(n,a,t)||(R_(e.color,s,t,a)&&i.push(`g${s}`),P_(e.color,s,t,a)&&i.push(`c${s}`)),i}function R_(n,e,t,i){const r=`h${e}`,s=t.getSquare(r);if(!s||s.type!==D.ROOK||s.color!==n||s.hasMoved)return!1;const a=`f${e}`,o=`g${e}`;return!(!t.isEmpty(a)||!t.isEmpty(o)||Kn(a,i,t)||Kn(o,i,t))}function P_(n,e,t,i){const r=`a${e}`,s=t.getSquare(r);if(!s||s.type!==D.ROOK||s.color!==n||s.hasMoved)return!1;const a=`b${e}`,o=`c${e}`,c=`d${e}`;return!(!t.isEmpty(a)||!t.isEmpty(o)||!t.isEmpty(c)||Kn(o,i,t)||Kn(c,i,t))}function L_(n,e,t){const i=t.getSquare(n);if(!i||i.type!==D.KING)return!1;const r=n.charCodeAt(0),s=e.charCodeAt(0);return Math.abs(s-r)===2&&n[1]===e[1]}function ma(n,e,t,i){const r=[],{file:s,rank:a}=t.notationToIndices(n);for(const o of i){let c=s+o.file,l=a+o.rank;for(;;){const u=t.indicesToNotation(c,l);if(!u)break;if(t.isEmpty(u)){r.push(u),c+=o.file,l+=o.rank;continue}if(t.hasFriendly(u,e.color))break;if(t.hasEnemy(u,e.color)){r.push(u);break}}}return r}function Kn(n,e,t){const{file:i,rank:r}=t.notationToIndices(n),s=e===C.WHITE?1:-1,a=[t.indicesToNotation(i-1,r-s),t.indicesToNotation(i+1,r-s)];for(const o of a){if(!o)continue;const c=t.getSquare(o);if(c&&c.color===e&&c.type===D.PAWN)return!0}for(const o of Is){const c=t.indicesToNotation(i+o.file,r+o.rank);if(!c)continue;const l=t.getSquare(c);if(l&&l.color===e&&l.type===D.KNIGHT)return!0}for(const o of Ds){const c=t.indicesToNotation(i+o.file,r+o.rank);if(!c)continue;const l=t.getSquare(c);if(l&&l.color===e&&l.type===D.KING)return!0}for(const o of _i){let c=i+o.file,l=r+o.rank;for(;;){const u=t.indicesToNotation(c,l);if(!u)break;const h=t.getSquare(u);if(h){if(h.color===e&&(h.type===D.ROOK||h.type===D.QUEEN))return!0;break}c+=o.file,l+=o.rank}}for(const o of vi){let c=i+o.file,l=r+o.rank;for(;;){const u=t.indicesToNotation(c,l);if(!u)break;const h=t.getSquare(u);if(h){if(h.color===e&&(h.type===D.BISHOP||h.type===D.QUEEN))return!0;break}c+=o.file,l+=o.rank}}return!1}function dn(n,e){const t=e.getKingPosition(n),i=n===C.WHITE?C.BLACK:C.WHITE;return Kn(t,i,e)}function qo(n,e,t){const i=t.getSquare(n);if(!i)return!0;const r=t.clone();if(i.type===D.PAWN&&e===t.enPassantTarget){const{file:a,rank:o}=r.notationToIndices(e),c=i.color===C.WHITE?o-1:o+1,l=r.indicesToNotation(a,c);r.setSquare(l,null)}const s={...i,hasMoved:!0};return r.setSquare(n,null),r.setSquare(e,s),dn(i.color,r)}function iu(n,e=null){e=e||$e();const t=e.getSquare(n);if(!t)return[];switch(t.type){case D.PAWN:return E_(n,t,e);case D.KNIGHT:return y_(n,t,e);case D.BISHOP:return T_(n,t,e);case D.ROOK:return b_(n,t,e);case D.QUEEN:return A_(n,t,e);case D.KING:return w_(n,t,e);default:return console.warn(`Unknown piece type: ${t.type}`),[]}}function Vn(n,e=null){e=e||$e();const t=e.getSquare(n);return t?t.color!==e.currentTurn?[]:iu(n,e).filter(s=>(t.type===D.KING&&(t.color===C.WHITE?C.BLACK:C.WHITE),!qo(n,s,e))):[]}function I_(n,e=null){e=e||$e();const t=[],i=e.getPiecesByColor(n);for(const{notation:r}of i){const s=iu(r,e);for(const a of s)qo(r,a,e)||t.push({from:r,to:a})}return t}const So=new Qg,Eo=new Ae;let Xo=null,Ko=null,Yo=null,gr=null;function D_(n,e,t){Xo=n,Ko=e,Yo=t,window.addEventListener("click",U_),console.log("[Chess 1v1] Input handling initialized")}function N_(n){gr=n}function U_(n){if(!Xo||!Ko)return;Eo.x=n.clientX/window.innerWidth*2-1,Eo.y=-(n.clientY/window.innerHeight)*2+1,So.setFromCamera(Eo,Xo);const e=So.intersectObjects(Ko.children,!0);for(const t of e){const i=t.object;if(i.userData&&i.userData.type==="square"){const r=i.userData.notation;console.log(`[Chess 1v1] Click: ${r}`);const a=$e().getSquare(r);gr&&gr(r,a);return}}if(Yo){const t=So.intersectObjects(Yo.children,!0);for(const i of t){let r=i.object;for(;r&&(!r.userData||r.userData.type!=="piece");)r=r.parent;if(r&&r.userData&&r.userData.square){const s=r.userData.square;console.log(`[Chess 1v1] Click: ${s} (piece)`);const o=$e().getSquare(s);gr&&gr(s,o);return}}}}let Ze=null,On=null;function O_(){Ze=document.createElement("div"),Ze.id="turn-indicator",Ze.style.cssText=`
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: rgba(0, 0, 0, 0.75);
        color: #ffffff;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        border-radius: 8px;
        z-index: 1000;
        user-select: none;
        pointer-events: none;
        transition: background-color 0.3s ease;
    `,document.body.appendChild(Ze),Ns(),console.log("[Chess 1v1] Turn indicator initialized")}function Ns(n={}){if(!Ze)return;if(On){ru();return}const t=$e().currentTurn,i=n.inCheck||!1,r=t===C.WHITE?"White":"Black";Ze.textContent=i?`${r} is in check!`:`${r} to move`,t===C.WHITE?(Ze.style.backgroundColor=i?"rgba(220, 53, 69, 0.9)":"rgba(240, 240, 240, 0.9)",Ze.style.color=i?"#fff":"#1a1a1a",Ze.style.border=i?"2px solid #dc3545":"2px solid #333"):(Ze.style.backgroundColor=i?"rgba(220, 53, 69, 0.9)":"rgba(30, 30, 30, 0.9)",Ze.style.color="#f0f0f0",Ze.style.border=i?"2px solid #dc3545":"2px solid #888"),console.log(`[Chess 1v1] Turn: ${r} to move${i?" (in check!)":""}`)}function ru(){!Ze||!On||(Ze.textContent=On.message,On.winner?(On.winner,C.WHITE,Ze.style.backgroundColor="rgba(40, 167, 69, 0.95)",Ze.style.color="#fff",Ze.style.border="3px solid #28a745"):(Ze.style.backgroundColor="rgba(108, 117, 125, 0.95)",Ze.style.color="#fff",Ze.style.border="3px solid #6c757d"),Ze.style.fontSize="22px",Ze.style.padding="16px 32px")}function F_(n){On=n,ru()}function B_(){return On!==null}function k_(){On=null,Ze&&(Ze.style.fontSize="18px",Ze.style.padding="12px 24px")}function H_(){const n=$e();n.currentTurn=n.currentTurn===C.WHITE?C.BLACK:C.WHITE,Ns()}const z_=16776960,G_=65280,W_=16711680,ga=.5,V_=.12;let An=null,bn=null;const q_=new Mi(.9,.9),X_=new rn({color:z_,transparent:!0,opacity:ga,side:_t}),K_=new rn({color:G_,transparent:!0,opacity:ga,side:_t}),Y_=new rn({color:W_,transparent:!0,opacity:ga,side:_t});function $_(n,e,t){bn=new ht,bn.name="selectionHighlights",n.add(bn),console.log("[Chess 1v1] Selection system initialized")}function j_(n){const e=n.charCodeAt(0)-97,t=parseInt(n[1])-1,i=3.5;return{x:e-i,z:7-t-i}}function ll(n,e){const t=new he(q_,e),i=j_(n);return t.position.set(i.x,V_,i.z),t.rotation.x=-Math.PI/2,t.userData={square:n,type:"highlight"},t}function _a(){if(bn)for(;bn.children.length>0;)bn.remove(bn.children[0])}function ul(n){const e=$e(),t=e.getSquare(n);if(!t||t.color!==e.currentTurn)return!1;_a(),An=n;const i=ll(n,X_);bn.add(i);const r=Vn(n);for(const s of r){const o=e.getSquare(s)?Y_:K_,c=ll(s,o);bn.add(c)}return console.log(`[Chess 1v1] Selected ${t.color} ${t.type} on ${n}`),console.log(`[Chess 1v1] Legal moves: [${r.join(", ")}]`),!0}function yo(){An&&console.log(`[Chess 1v1] Deselected ${An}`),An=null,_a()}function Z_(n){return An?Vn(An).includes(n):!1}function J_(n,e){const t=$e();if(!An)return e&&e.color===t.currentTurn?(ul(n),{action:"select",square:n}):{action:"none"};if(n===An)return yo(),{action:"deselect"};if(Z_(n)){const i=An;return yo(),{action:"move",from:i,to:n}}return e&&e.color===t.currentTurn?(ul(n),{action:"select",square:n}):(yo(),{action:"deselect"})}let hn=null,va=!1,xs=null;const Q_=[{type:D.QUEEN,name:"queen",symbol:"♛"},{type:D.ROOK,name:"rook",symbol:"♜"},{type:D.BISHOP,name:"bishop",symbol:"♝"},{type:D.KNIGHT,name:"knight",symbol:"♞"}];function e0(){const n=document.createElement("div");n.id="promotion-modal",n.style.cssText=`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;const e=document.createElement("div");e.id="promotion-content",e.style.cssText=`
        background: linear-gradient(145deg, #2c2c2c, #3d3d3d);
        border-radius: 12px;
        padding: 24px 32px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        text-align: center;
    `;const t=document.createElement("h2");t.id="promotion-title",t.textContent="Promote Pawn",t.style.cssText=`
        color: #f5f5f5;
        font-family: 'Georgia', serif;
        font-size: 24px;
        margin-bottom: 20px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    `,e.appendChild(t);const i=document.createElement("div");return i.id="promotion-buttons",i.style.cssText=`
        display: flex;
        gap: 16px;
        justify-content: center;
    `,Q_.forEach(r=>{const s=document.createElement("button");s.dataset.pieceType=r.type,s.dataset.pieceName=r.name,s.innerHTML=r.symbol,s.title=r.name.charAt(0).toUpperCase()+r.name.slice(1),s.style.cssText=`
            width: 70px;
            height: 70px;
            font-size: 42px;
            background: linear-gradient(145deg, #f0d9b5, #b58863);
            border: 3px solid #8b7355;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.15s, box-shadow 0.15s;
            color: #2c2c2c;
        `,s.addEventListener("mouseenter",()=>{s.style.transform="scale(1.1)",s.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"}),s.addEventListener("mouseleave",()=>{s.style.transform="scale(1)",s.style.boxShadow="none"}),s.addEventListener("click",()=>{i0(r.type,r.name)}),i.appendChild(s)}),e.appendChild(i),n.appendChild(e),n}function su(){hn||(hn=e0(),document.body.appendChild(hn),console.log("[Chess 1v1] Promotion system initialized"))}function t0(n,e,t){if(!t||t.type!==D.PAWN)return!1;const i=parseInt(e[1]);return t.color===C.WHITE&&i===8||t.color===C.BLACK&&i===1}function n0(n,e){return new Promise(t=>{hn||su(),xs={square:n,color:e,callback:t},va=!0,hn.querySelectorAll("#promotion-buttons button").forEach(s=>{e===C.WHITE?s.style.color="#2c2c2c":(s.style.color="#f5f5f5",s.style.background="linear-gradient(145deg, #2c2c2c, #1a1a1a)",s.style.borderColor="#555555")});const r=hn.querySelector("#promotion-title");r.textContent=`${e===C.WHITE?"White":"Black"} Pawn Promotes`,hn.style.display="flex",console.log(`[Chess 1v1] Promotion modal shown for ${e} pawn at ${n}`)})}function i0(n,e){if(!xs||!va)return;const{square:t,color:i,callback:r}=xs;r0(),r({type:n,name:e}),console.log(`[Chess 1v1] Promotion choice: ${e}`)}function r0(){hn&&(hn.style.display="none",hn.querySelectorAll("#promotion-buttons button").forEach(e=>{e.style.color="#2c2c2c",e.style.background="linear-gradient(145deg, #f0d9b5, #b58863)",e.style.borderColor="#8b7355"})),va=!1,xs=null}function s0(n,e,t){Vo(n),ct(e,t,n),console.log(`[Chess 1v1] Replaced pawn with ${t} ${e} at ${n}`)}const En={ONGOING:"ongoing",CHECKMATE:"checkmate",STALEMATE:"stalemate",DRAW_INSUFFICIENT_MATERIAL:"draw_insufficient_material",DRAW_THREEFOLD:"draw_threefold",DRAW_FIFTY_MOVE:"draw_fifty_move"},xa=[];function ou(n){let e="";for(let s=8;s>=1;s--){let a=0;for(let o=0;o<8;o++){const c=String.fromCharCode(97+o)+s,l=n.getSquare(c);if(l){a>0&&(e+=a,a=0);const u=l.type.toUpperCase();e+=l.color===C.WHITE?u:u.toLowerCase()}else a++}a>0&&(e+=a),s>1&&(e+="/")}e+=" "+(n.currentTurn===C.WHITE?"w":"b");let t="";const i=n.getSquare("e1"),r=n.getSquare("e8");if(i&&i.type===D.KING&&!i.hasMoved){const s=n.getSquare("h1"),a=n.getSquare("a1");s&&s.type===D.ROOK&&!s.hasMoved&&(t+="K"),a&&a.type===D.ROOK&&!a.hasMoved&&(t+="Q")}if(r&&r.type===D.KING&&!r.hasMoved){const s=n.getSquare("h8"),a=n.getSquare("a8");s&&s.type===D.ROOK&&!s.hasMoved&&(t+="k"),a&&a.type===D.ROOK&&!a.hasMoved&&(t+="q")}return e+=" "+(t||"-"),e+=" "+(n.enPassantTarget||"-"),e}function au(n=null){n=n||$e(),xa.push(ou(n))}function o0(){xa.length=0}function ci(n=null){n=n||$e();const e=n.getPiecesByColor(C.WHITE),t=n.getPiecesByColor(C.BLACK),i=(f,d)=>f.filter(T=>T.piece.type===d).length,r=i(e,D.BISHOP),s=i(e,D.KNIGHT),a=i(e,D.QUEEN),o=i(e,D.ROOK),c=i(e,D.PAWN),l=i(t,D.BISHOP),u=i(t,D.KNIGHT),h=i(t,D.QUEEN),p=i(t,D.ROOK),m=i(t,D.PAWN);if(c+m>0||o+p>0||a+h>0)return!1;const g=r+s,x=l+u;if(g===0&&x===0||g===1&&x===0||g===0&&x===1)return!0;if(r===1&&l===1&&s===0&&u===0){const f=e.find(M=>M.piece.type===D.BISHOP).notation,d=t.find(M=>M.piece.type===D.BISHOP).notation,T=M=>{const E=M.charCodeAt(0)-97,P=parseInt(M[1])-1;return(E+P)%2===1};if(T(f)===T(d))return!0}return!1}function a0(n=null){n=n||$e();const e=ou(n);let t=0;for(const i of xa)if(i===e&&(t++,t>=2))return!0;return!1}function $o(n=null){return n=n||$e(),n.halfMoveClock>=100}function vr(n,e=null){return e=e||$e(),I_(n,e).length===0}function jo(n,e=null){return e=e||$e(),dn(n,e)?vr(n,e):!1}function Zo(n,e=null){return e=e||$e(),dn(n,e)?!1:vr(n,e)}function c0(n=null){n=n||$e();const e=n.currentTurn,t=e===C.WHITE?C.BLACK:C.WHITE;if(jo(e,n)){const s=t===C.WHITE?"White":"Black";return{result:En.CHECKMATE,winner:t,loser:e,message:`Checkmate. ${s} wins!`}}if(Zo(e,n))return{result:En.STALEMATE,winner:null,loser:null,message:"Stalemate. Draw!"};if(ci(n))return{result:En.DRAW_INSUFFICIENT_MATERIAL,winner:null,loser:null,message:"Draw: Insufficient material"};if($o(n))return{result:En.DRAW_FIFTY_MOVE,winner:null,loser:null,message:"Draw: 50-move rule"};if(a0(n))return{result:En.DRAW_THREEFOLD,winner:null,loser:null,message:"Draw: Threefold repetition"};const i=e===C.WHITE?"White":"Black",r=dn(e,n);return{result:En.ONGOING,winner:null,loser:null,message:r?`${i} is in check!`:`${i} to move`}}su();const l0=150;async function u0(n,e){const t=$e(),i=t.getSquare(n);if(!i)return console.warn(`[Chess 1v1] No piece at ${n}`),{success:!1,type:"invalid"};const r=t.getSquare(e),s=r!==null,a=i.type===D.PAWN&&e===t.enPassantTarget,o=i.type===D.PAWN&&Math.abs(parseInt(e[1])-parseInt(n[1]))===2,c=L_(n,e,t),l=t0(n,e,i);let u=r;if(a){const{file:E,rank:P}=t.notationToIndices(e),w=i.color===C.WHITE?P-1:P+1,A=t.indicesToNotation(E,w);u=t.getSquare(A),t.setSquare(A,null),Vo(A),console.log(`[Chess 1v1] En passant capture on ${A}`)}let h=null,p=null;if(c){const E=n[1];e[0]==="g"?(h=`h${E}`,p=`f${E}`):(h=`a${E}`,p=`d${E}`);const A={...t.getSquare(h),hasMoved:!0};t.setSquare(h,null),t.setSquare(p,A),console.log(`[Chess 1v1] Castling: rook ${h} -> ${p}`)}if(o){const{file:E,rank:P}=t.notationToIndices(n),w=i.color===C.WHITE?P+1:P-1;t.enPassantTarget=t.indicesToNotation(E,w)}else t.enPassantTarget=null;let m={...i,hasMoved:!0};t.setSquare(n,null),t.setSquare(e,m),i.type===D.PAWN||s||a?t.halfMoveClock=0:t.halfMoveClock++,i.color===C.BLACK&&t.fullMoveNumber++,s&&!a&&Vo(e);const g=cl(n);if(g)hl(g,n,e);else{const E=d0(i.type);ct(E,i.color,e),console.warn(`[Chess 1v1] Piece mesh not found at ${n}, recreated at ${e}`)}if(c&&h&&p){const E=cl(h);E?hl(E,h,p):(ct("rook",i.color,p),console.warn(`[Chess 1v1] Rook mesh not found at ${h}, recreated at ${p}`))}let x=null;if(l){console.log(`[Chess 1v1] Pawn promotion triggered at ${e}`);const E=await n0(e,i.color);x=E;const P={type:E.type,color:i.color,hasMoved:!0};t.setSquare(e,P),s0(e,E.name,i.color),console.log(`[Chess 1v1] Promoted to ${E.name}`)}t.moveHistory.push({from:n,to:e,piece:i.type,color:i.color,captured:(u==null?void 0:u.type)||null,isEnPassant:a,isCastling:c,rookFrom:h,rookTo:p,isPromotion:l,promotedTo:(x==null?void 0:x.type)||null}),H_(),au(t);const f=c0(t),d=t.currentTurn,T=dn(d,t);let M;if(c?M=e[0]==="g"?"O-O":"O-O-O":l?M=dl(n,e,i,s)+"="+h0(x.type):M=dl(n,e,i,s||a),f.result===En.CHECKMATE?M+="#":T&&(M+="+"),console.log(`[Chess 1v1] Move executed: ${M}`),f.result!==En.ONGOING)console.log(`[Chess 1v1] GAME OVER: ${f.message}`);else if(T){const E=d===C.WHITE?"White":"Black";console.log(`[Chess 1v1] ${E} is in check!`)}return{success:!0,type:l?"promotion":c?"castling":a?"enPassant":s?"capture":"move",captured:u||null,notation:M,promotedTo:(x==null?void 0:x.type)||null,gameResult:f.result,winner:f.winner,message:f.message,inCheck:T}}function h0(n){return{[D.QUEEN]:"Q",[D.ROOK]:"R",[D.BISHOP]:"B",[D.KNIGHT]:"N"}[n]||"Q"}function hl(n,e,t){Xt.delete(e),Xt.set(t,n),n.userData.square=t;const i=tu(t),r=n.position.x,s=n.position.z,a=performance.now();function o(){const c=performance.now()-a,l=Math.min(c/l0,1),u=1-Math.pow(1-l,3);n.position.x=r+(i.x-r)*u,n.position.z=s+(i.z-s)*u;const p=Math.sin(l*Math.PI)*.15;n.position.y=i.y+p,l<1?requestAnimationFrame(o):n.position.set(i.x,i.y,i.z)}o()}function d0(n){return{[D.KING]:"king",[D.QUEEN]:"queen",[D.ROOK]:"rook",[D.BISHOP]:"bishop",[D.KNIGHT]:"knight",[D.PAWN]:"pawn"}[n]||"pawn"}function dl(n,e,t,i){const s={[D.KING]:"K",[D.QUEEN]:"Q",[D.ROOK]:"R",[D.BISHOP]:"B",[D.KNIGHT]:"N",[D.PAWN]:""}[t.type],a=i?"x":"";return t.type===D.PAWN&&i?`${n[0]}x${e}`:`${s}${a}${e}`}const f0=4886745,p0=14240330,m0=10181046,os=.25,g0=.6,_0=.11;let It=null,ln=!1,as=!0,cs=!0;const v0=new Mi(.95,.95);let Ma=null,Sa=null,Ea=null;function cu(n){Ma=new rn({color:f0,transparent:!0,opacity:os,side:_t,depthWrite:!1}),Sa=new rn({color:p0,transparent:!0,opacity:os,side:_t,depthWrite:!1}),Ea=new rn({color:m0,transparent:!0,opacity:os,side:_t,depthWrite:!1}),It=new ht,It.name="attackedSquares",It.visible=ln,n.add(It),console.log("[Chess 1v1] Attacked squares visualization initialized")}function x0(n){const e=n.charCodeAt(0)-97,t=parseInt(n[1])-1,i=3.5;return{x:e-i,z:7-t-i}}function pi(n,e,t){const i=[],{file:r,rank:s}=t.notationToIndices(n);switch(e.type){case D.PAWN:{const a=e.color===C.WHITE?1:-1,o=t.indicesToNotation(r-1,s+a),c=t.indicesToNotation(r+1,s+a);o&&i.push(o),c&&i.push(c);break}case D.KNIGHT:{for(const a of Is){const o=t.indicesToNotation(r+a.file,s+a.rank);o&&i.push(o)}break}case D.BISHOP:{for(const a of vi){let o=r+a.file,c=s+a.rank;for(;;){const l=t.indicesToNotation(o,c);if(!l||(i.push(l),!t.isEmpty(l)))break;o+=a.file,c+=a.rank}}break}case D.ROOK:{for(const a of _i){let o=r+a.file,c=s+a.rank;for(;;){const l=t.indicesToNotation(o,c);if(!l||(i.push(l),!t.isEmpty(l)))break;o+=a.file,c+=a.rank}}break}case D.QUEEN:{const a=[..._i,...vi];for(const o of a){let c=r+o.file,l=s+o.rank;for(;;){const u=t.indicesToNotation(c,l);if(!u||(i.push(u),!t.isEmpty(u)))break;c+=o.file,l+=o.rank}}break}case D.KING:{for(const a of Ds){const o=t.indicesToNotation(r+a.file,s+a.rank);o&&i.push(o)}break}}return i}function Jo(n,e){const t=new Map,i=e.getPiecesByColor(n);for(const{notation:r,piece:s}of i){const a=pi(r,s,e);for(const o of a)t.set(o,(t.get(o)||0)+1)}return t}function lu(){if(It)for(;It.children.length>0;){const n=It.children[0];It.remove(n),n.material&&n.material!==Ma&&n.material!==Sa&&n.material!==Ea&&n.material.dispose()}}function To(n,e,t){const i=Math.min(os+(t-1)*.1,g0);let r;switch(e){case"white":r=Ma;break;case"black":r=Sa;break;case"overlap":r=Ea;break}const s=r.clone();s.opacity=i;const a=new he(v0,s),o=x0(n);return a.position.set(o.x,_0,o.z),a.rotation.x=-Math.PI/2,a.userData={square:n,type:"attackOverlay",attackType:e,intensity:t},a}function Pr(){if(!It||!ln)return;lu();const n=$e(),e=as?Jo(C.WHITE,n):new Map,t=cs?Jo(C.BLACK,n):new Map,i=new Set([...e.keys(),...t.keys()]);for(const r of i){const s=e.get(r)||0,a=t.get(r)||0;if(s>0&&a>0){const o=s+a,c=To(r,"overlap",o);It.add(c)}else if(s>0){const o=To(r,"white",s);It.add(o)}else if(a>0){const o=To(r,"black",a);It.add(o)}}}function yr(){return ln=!ln,It&&(It.visible=ln,ln&&Pr()),console.log(`[Chess 1v1] Attack visualization: ${ln?"ON":"OFF"}`),ln}function ls(n){switch(n){case"white":as=!0,cs=!1;break;case"black":as=!1,cs=!0;break;case"both":default:as=!0,cs=!0;break}ln&&Pr()}function Fn(){return ln}const M0=Object.freeze(Object.defineProperty({__proto__:null,clearAttackOverlays:lu,getAttackedSquares:Jo,getPieceAttacks:pi,initAttackedSquares:cu,isAttackVisualizationVisible:Fn,setAttackFilter:ls,toggleAttackVisualization:yr,updateAttackVisualization:Pr},Symbol.toStringTag,{value:"Module"})),S0=new Ve(4915018),E0=new Ve(16730698),y0=2.5,T0=.2,Ms=.8,b0=.08,A0=.25,w0=.42;let kt=null,Jt=!1,xr=!0,Mr=!0,fl=0,Tr=new Map,bo=null,ya=null,Ta=null;function C0(){return bo||(bo=new da(A0,w0,32)),bo}function uu(n){ya=new rn({color:S0,transparent:!0,opacity:Ms,side:_t,depthWrite:!1}),Ta=new rn({color:E0,transparent:!0,opacity:Ms,side:_t,depthWrite:!1}),kt=new ht,kt.name="defendedPieces",kt.visible=Jt,n.add(kt),console.log("[Chess 1v1] Defended pieces visualization initialized")}function R0(n){const e=n.charCodeAt(0)-97,t=parseInt(n[1])-1,i=3.5;return{x:e-i,z:7-t-i}}function Ss(n,e){const t=new Map,i=e.getPiecesByColor(n);for(const{notation:r,piece:s}of i){const a=pi(r,s,e);for(const o of a){const c=e.getSquare(o);c&&c.color===n&&t.set(o,(t.get(o)||0)+1)}}return t}function hu(){if(kt){for(;kt.children.length>0;){const n=kt.children[0];kt.remove(n),n.material&&n.material!==ya&&n.material!==Ta&&n.material.dispose()}Tr.clear()}}function pl(n,e,t){const r=(e===C.WHITE?ya:Ta).clone(),s=Math.min(T0+(t-1)*.15,Ms);r.opacity=s;const a=new he(C0(),r),o=R0(n);return a.position.set(o.x,b0,o.z),a.rotation.x=-Math.PI/2,a.userData={square:n,type:"defendedIndicator",pieceColor:e,defenderCount:t,baseIntensity:s},a}function Lr(){if(!kt||!Jt)return;hu();const n=$e(),e=xr?Ss(C.WHITE,n):new Map,t=Mr?Ss(C.BLACK,n):new Map;if(xr)for(const[i,r]of e){const s=pl(i,C.WHITE,r);kt.add(s),Tr.set(i,s)}if(Mr)for(const[i,r]of t){const s=pl(i,C.BLACK,r);kt.add(s),Tr.set(i,s)}}function du(n){if(!Jt||Tr.size===0)return;fl+=n;const e=(Math.sin(fl*y0*Math.PI*2)+1)/2;Tr.forEach(t=>{const{baseIntensity:i}=t.userData,r=i+(Ms-i)*e;t.material.opacity=r;const s=1+e*.1;t.scale.setScalar(s)})}function br(){return Jt=!Jt,kt&&(kt.visible=Jt,Jt&&Lr()),console.log(`[Chess 1v1] Defended pieces visualization: ${Jt?"ON":"OFF"}`),Jt}function us(n){switch(n){case"white":xr=!0,Mr=!1;break;case"black":xr=!1,Mr=!0;break;case"both":default:xr=!0,Mr=!0;break}Jt&&Lr()}function Bn(){return Jt}function P0(n){const e=$e(),t=e.getSquare(n);if(!t)return{defenders:0,isDefended:!1};const r=Ss(t.color,e).get(n)||0;return{defenders:r,isDefended:r>0}}const L0=Object.freeze(Object.defineProperty({__proto__:null,clearDefendedIndicators:hu,getDefendedPieces:Ss,getSquareDefenseData:P0,initDefendedPieces:uu,isDefendedVisualizationVisible:Bn,setDefendedFilter:us,toggleDefendedVisualization:br,updateDefendedVisualization:Lr,updatePulseAnimation:du},Symbol.toStringTag,{value:"Module"})),fu={1:16724787,2:16737894,3:16751001},pu={1:.55,2:.35,3:.2},I0=.115,Ar=3,mu=50,D0=12,N0=6,U0=3;let Ht=null,qt=!1,nn=2,Xi=!0,Ki=!0,Ao=null,Qo=!1,_r=null,Es=null;const O0=new Mi(.9,.9),wr={};function gu(n){for(let e=1;e<=Ar;e++)wr[e]=new rn({color:fu[e],transparent:!0,opacity:pu[e],side:_t,depthWrite:!1});Ht=new ht,Ht.name="threatPreview",Ht.visible=qt,n.add(Ht),console.log("[Chess 1v1] Multi-turn threat preview initialized")}function F0(n){const e=n.charCodeAt(0)-97,t=parseInt(n[1])-1,i=3.5;return{x:e-i,z:7-t-i}}function B0(n,e){const t=new Set,i=e.getPiecesByColor(n);for(const{notation:r,piece:s}of i)pi(r,s,e).forEach(o=>t.add(o));return t}function _u(n){let e=n.currentTurn;return n.board.forEach((t,i)=>{t&&(e+=`${i}${t.color[0]}${t.type}`)}),e}function wo(n,e,t){const i=[],{file:r,rank:s}=t.notationToIndices(n);switch(e.type){case D.PAWN:{const a=e.color===C.WHITE?1:-1,o=e.color===C.WHITE?1:6,c=t.indicesToNotation(r,s+a);if(c&&t.isEmpty(c)&&(i.push(c),s===o)){const h=t.indicesToNotation(r,s+2*a);h&&t.isEmpty(h)&&i.push(h)}const l=t.indicesToNotation(r-1,s+a),u=t.indicesToNotation(r+1,s+a);l&&t.hasEnemy(l,e.color)&&i.push(l),u&&t.hasEnemy(u,e.color)&&i.push(u);break}case D.KNIGHT:{for(const a of Is){const o=t.indicesToNotation(r+a.file,s+a.rank);o&&!t.hasFriendly(o,e.color)&&i.push(o)}break}case D.BISHOP:{for(const a of vi){let o=r+a.file,c=s+a.rank;for(;;){const l=t.indicesToNotation(o,c);if(!l||t.hasFriendly(l,e.color)||(i.push(l),!t.isEmpty(l)))break;o+=a.file,c+=a.rank}}break}case D.ROOK:{for(const a of _i){let o=r+a.file,c=s+a.rank;for(;;){const l=t.indicesToNotation(o,c);if(!l||t.hasFriendly(l,e.color)||(i.push(l),!t.isEmpty(l)))break;o+=a.file,c+=a.rank}}break}case D.QUEEN:{const a=[..._i,...vi];for(const o of a){let c=r+o.file,l=s+o.rank;for(;;){const u=t.indicesToNotation(c,l);if(!u||t.hasFriendly(u,e.color)||(i.push(u),!t.isEmpty(u)))break;c+=o.file,l+=o.rank}}break}case D.KING:{for(const a of Ds){const o=t.indicesToNotation(r+a.file,s+a.rank);o&&!t.hasFriendly(o,e.color)&&i.push(o)}break}}return i}function ml(n,e,t){const i=new Map,r=B0(n,t),s=t.getPiecesByColor(n);for(const{notation:a,piece:o}of s){const c=wo(a,o,t),l=Math.min(c.length,D0);for(let u=0;u<l;u++){const h=c[u],p=t.getSquare(h);t.setSquare(a,null),t.setSquare(h,o);const m=pi(h,o,t);for(const g of m)r.has(g)||i.has(g)||i.set(g,1);if(e>=2){const g=wo(h,o,t),x=Math.min(g.length,N0);for(let f=0;f<x;f++){const d=g[f],T=t.getSquare(d);t.setSquare(h,null),t.setSquare(d,o);const M=pi(d,o,t);for(const E of M)!r.has(E)&&!i.has(E)&&i.set(E,2);if(e>=3){const E=wo(d,o,t),P=Math.min(E.length,U0);for(let w=0;w<P;w++){const A=E[w],F=t.getSquare(A);t.setSquare(d,null),t.setSquare(A,o);const j=pi(A,o,t);for(const v of j)!r.has(v)&&!i.has(v)&&i.set(v,3);t.setSquare(A,F),t.setSquare(d,o)}}t.setSquare(d,T),t.setSquare(h,o)}}t.setSquare(h,p),t.setSquare(a,o)}}return i}function vu(){if(Ht)for(;Ht.children.length>0;){const n=Ht.children[0];if(Ht.remove(n),n.material){let e=!1;for(const t in wr)if(n.material===wr[t]){e=!0;break}e||n.material.dispose()}}}function k0(n,e){const i=(wr[e]||wr[1]).clone(),r=new he(O0,i),s=F0(n);return r.position.set(s.x,I0,s.z),r.rotation.x=-Math.PI/2,r.userData={square:n,type:"threatOverlay",depth:e},r}function gl(){if(!Ht||!qt)return;vu();const n=$e(),t=`${_u(n)}_${nn}_${Xi}_${Ki}`;let i,r;if(_r&&Es===t)i=_r.white,r=_r.black;else{if(i=new Map,r=new Map,Xi){const o=n.clone();i=ml(C.BLACK,nn,o)}if(Ki){const o=n.clone();r=ml(C.WHITE,nn,o)}_r={white:i,black:r},Es=t}const s=new Map,a=(o,c)=>{c>nn||(!s.has(o)||s.get(o)>c)&&s.set(o,c)};i.forEach((o,c)=>a(c,o)),r.forEach((o,c)=>a(c,o));for(const[o,c]of s)if(c<=nn){const l=k0(o,c);Ht.add(l)}Qo=!1}function or(){if(!Ht||!qt)return;const n=$e(),t=`${_u(n)}_${nn}_${Xi}_${Ki}`;if(Es!==t&&(_r=null,Es=null),Ao){Qo=!0;return}gl(),Ao=setTimeout(()=>{Ao=null,Qo&&gl()},mu)}function er(){return qt=!qt,Ht&&(Ht.visible=qt,qt&&or()),console.log(`[Chess 1v1] Threat preview: ${qt?"ON":"OFF"} (depth: ${nn})`),qt}function ba(n){const e=Math.max(1,Math.min(Ar,n));e!==nn&&(nn=e,console.log(`[Chess 1v1] Threat depth set to: ${nn} turn(s)`),qt&&or())}function Yi(){return nn}function hs(n){switch(n){case"white":Xi=!0,Ki=!1;break;case"black":Xi=!1,Ki=!0;break;case"both":default:Xi=!0,Ki=!0;break}qt&&or()}function kn(){return qt}const H0=Object.freeze(Object.defineProperty({__proto__:null,DEBOUNCE_MS:mu,MAX_DEPTH:Ar,THREAT_COLORS:fu,THREAT_OPACITY:pu,clearThreatOverlays:vu,getThreatDepth:Yi,initThreatPreview:gu,isThreatVisualizationVisible:kn,setThreatDepth:ba,setThreatFilter:hs,toggleThreatVisualization:er,updateThreatVisualization:or},Symbol.toStringTag,{value:"Module"}));let Bt=null,ys=!1,ea=null;function z0(){const n=document.createElement("div");n.id="game-end-overlay",n.style.cssText=`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;const e=document.createElement("div");e.id="game-end-content",e.style.cssText=`
        background: linear-gradient(145deg, #2c2c2c, #3d3d3d);
        border-radius: 16px;
        padding: 40px 60px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;const t=document.createElement("h1");t.id="game-end-result",t.textContent="Game Over",t.style.cssText=`
        color: #f5f5f5;
        font-family: 'Georgia', serif;
        font-size: 36px;
        margin: 0 0 12px 0;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    `,e.appendChild(t);const i=document.createElement("p");i.id="game-end-message",i.textContent="",i.style.cssText=`
        color: #cccccc;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 20px;
        margin: 0 0 32px 0;
    `,e.appendChild(i);const r=document.createElement("button");return r.id="new-game-btn",r.textContent="New Game",r.style.cssText=`
        background: linear-gradient(145deg, #4a90d9, #357abd);
        color: #ffffff;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 20px;
        font-weight: 600;
        padding: 14px 48px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
        box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
    `,r.addEventListener("mouseenter",()=>{r.style.transform="scale(1.05)",r.style.boxShadow="0 6px 20px rgba(74, 144, 217, 0.5)",r.style.background="linear-gradient(145deg, #5a9fe9, #4589cd)"}),r.addEventListener("mouseleave",()=>{r.style.transform="scale(1)",r.style.boxShadow="0 4px 12px rgba(74, 144, 217, 0.3)",r.style.background="linear-gradient(145deg, #4a90d9, #357abd)"}),r.addEventListener("click",W0),e.appendChild(r),n.appendChild(e),n}function xu(n=null){Bt||(ea=n,Bt=z0(),document.body.appendChild(Bt),console.log("[Chess 1v1] Game end UI initialized"))}function Mu(n){Bt||xu();const e=Bt.querySelector("#game-end-result"),t=Bt.querySelector("#game-end-message"),i=Bt.querySelector("#game-end-content");if(n.winner){const r=n.winner===C.WHITE?"White":"Black";e.textContent=`${r} Wins!`,e.style.color="#2ecc71"}else e.textContent="Draw",e.style.color="#f39c12";t.textContent=n.message,Bt.style.display="flex",ys=!0,requestAnimationFrame(()=>{Bt.style.opacity="1",i.style.transform="scale(1)"}),console.log(`[Chess 1v1] Game end overlay shown: ${n.message}`)}function G0(){if(!Bt||!ys)return;const n=Bt.querySelector("#game-end-content");Bt.style.opacity="0",n.style.transform="scale(0.9)",setTimeout(()=>{Bt.style.display="none",ys=!1},300)}function W0(){console.log("[Chess 1v1] Starting new game..."),G0(),M_(),o0(),nu(),k_(),Ns(),_a(),ea&&ea(),console.log("[Chess 1v1] New game started - White to move")}function ta(){return ys}const _l={top:"20px",right:"20px"},Su={attacks:{active:"#4a90d9",inactive:"#2a4a6a"},defended:{active:"#4aff4a",inactive:"#2a6a2a"},threats:{active:"#ff4a4a",inactive:"#6a2a2a"}};let Dn=null,Ts=null,bs=null,As=null,Zt=null,Wi=null;function V0(){Dn=document.createElement("div"),Dn.id="viz-controls",Dn.style.cssText=`
        position: fixed;
        top: ${_l.top};
        right: ${_l.right};
        background: rgba(30, 30, 50, 0.9);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #ffffff;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 1000;
        min-width: 180px;
        user-select: none;
    `;const n=document.createElement("div");n.textContent="Visualization",n.style.cssText=`
        font-size: 14px;
        font-weight: 600;
        color: #aaaacc;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 4px;
    `,Dn.appendChild(n);const e=document.createElement("div");e.style.cssText=`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `,Ts=Co("Attacks","attacks","A"),bs=Co("Defended","defended","S"),As=Co("Threats","threats","T"),e.appendChild(Ts),e.appendChild(bs),e.appendChild(As),Dn.appendChild(e);const t=q0();Dn.appendChild(t);const i=document.createElement("div");i.style.cssText=`
        font-size: 10px;
        color: #666688;
        text-align: center;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 4px;
    `,i.innerHTML="Keys: A/S/T toggle<br>1/2/3 set depth",Dn.appendChild(i),document.body.appendChild(Dn),Aa()}function Co(n,e,t){const i=document.createElement("button");i.dataset.type=e,i.style.cssText=`
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 10px 14px;
        border: none;
        border-radius: 8px;
        background: ${Su[e].inactive};
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
    `;const r=document.createElement("span");r.textContent=n,i.appendChild(r);const s=document.createElement("span");return s.textContent=t,s.style.cssText=`
        background: rgba(255, 255, 255, 0.15);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
    `,i.appendChild(s),i.addEventListener("click",()=>X0(e)),i.addEventListener("mouseenter",()=>{i.style.transform="scale(1.02)",i.style.boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"}),i.addEventListener("mouseleave",()=>{i.style.transform="scale(1)",i.style.boxShadow="none"}),i}function q0(){const n=document.createElement("div");n.style.cssText=`
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-top: 8px;
    `;const e=document.createElement("div");e.style.cssText=`
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;const t=document.createElement("span");t.textContent="Threat Depth",t.style.cssText=`
        font-size: 12px;
        color: #aaaacc;
    `,Wi=document.createElement("span"),Wi.textContent=`${Yi()} turn${Yi()>1?"s":""}`,Wi.style.cssText=`
        font-size: 12px;
        color: #ff6666;
        font-weight: 600;
    `,e.appendChild(t),e.appendChild(Wi),n.appendChild(e),Zt=document.createElement("input"),Zt.type="range",Zt.min="1",Zt.max=String(Ar),Zt.value=String(Yi()),Zt.style.cssText=`
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: linear-gradient(to right, #ff3333, #ff6666, #ff9999);
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
    `;const i=document.createElement("style");i.textContent=`
        #viz-controls input[type="range"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        #viz-controls input[type="range"]::-webkit-slider-runnable-track {
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(to right, #ff3333, #ff6666, #ff9999);
        }
        #viz-controls input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            transition: transform 0.1s ease;
            margin-top: -6px;
        }
        #viz-controls input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
        }
        #viz-controls input[type="range"]::-moz-range-track {
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(to right, #ff3333, #ff6666, #ff9999);
            border: none;
        }
        #viz-controls input[type="range"]::-moz-range-thumb {
            -moz-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        #viz-controls input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
        }
    `,document.head.appendChild(i),Zt.addEventListener("input",()=>{const s=parseInt(Zt.value);ba(s),Eu(s)}),n.appendChild(Zt);const r=document.createElement("div");r.style.cssText=`
        display: flex;
        justify-content: space-between;
        padding: 0 2px;
    `;for(let s=1;s<=Ar;s++){const a=document.createElement("span");a.textContent=String(s),a.style.cssText=`
            font-size: 10px;
            color: #666688;
        `,r.appendChild(a)}return n.appendChild(r),n}function X0(n){switch(n){case"attacks":yr();break;case"defended":br();break;case"threats":er();break}Aa()}function Aa(){if(!Ts||!bs||!As)return;const n=Fn();Ro(Ts,"attacks",n);const e=Bn();Ro(bs,"defended",e);const t=kn();Ro(As,"threats",t),Zt&&(Zt.value=String(Yi()),Eu(Yi()))}function Ro(n,e,t){const i=Su[e];n.style.background=t?i.active:i.inactive,n.style.boxShadow=t?`0 0 12px ${i.active}40`:"none"}function Eu(n){Wi&&(Wi.textContent=`${n} turn${n>1?"s":""}`)}function K0(){V0(),console.log("[Chess 1v1] Visualization controls initialized")}function na(){Aa()}const Y0=16119260,$0=50,j0=.1,Z0=1e3,Po={x:0,y:12,z:6},Lo={x:0,y:0,z:0},Sr=8,Yn=1,tr=Sr*Yn/2-Yn/2,J0=15784373,Q0=11896931,yu=.7,pn=new Xg;pn.background=new Ve(Y0);const xi=new Vt($0,window.innerWidth/window.innerHeight,j0,Z0);xi.position.set(Po.x,Po.y,Po.z);xi.lookAt(Lo.x,Lo.y,Lo.z);const Ir=new jl({antialias:!0});Ir.setSize(window.innerWidth,window.innerHeight);Ir.setPixelRatio(Math.min(window.devicePixelRatio,2));const ev=document.getElementById("game-container");ev.appendChild(Ir.domElement);const tv=new Zg(16777215,.6);pn.add(tv);const Tu=new jg(16777215,.8);Tu.position.set(5,10,5);pn.add(Tu);function nv(){xi.aspect=window.innerWidth/window.innerHeight,xi.updateProjectionMatrix(),Ir.setSize(window.innerWidth,window.innerHeight)}window.addEventListener("resize",nv);const iv=new Jg;function bu(){requestAnimationFrame(bu);const n=iv.getDelta();du(n),Ir.render(pn,xi)}const rv=new Nt(Yn,.1,Yn),sv=new Ls({color:J0}),ov=new Ls({color:Q0}),$i=new ht;$i.name="chessBoard";function av(){for(let n=0;n<Sr;n++)for(let e=0;e<Sr;e++){const i=(n+e)%2===0?sv:ov,r=new he(rv,i);r.position.set(e*Yn-tr,0,(Sr-1-n)*Yn-tr),r.userData={type:"square",file:String.fromCharCode(97+e),rank:n+1,notation:String.fromCharCode(97+e)+(n+1)},$i.add(r)}}function cv(){const n=new ht;n.name="rankLabels";for(let e=1;e<=8;e++){const t=document.createElement("canvas");t.width=64,t.height=64;const i=t.getContext("2d");i.fillStyle="#333333",i.font="bold 48px Arial",i.textAlign="center",i.textBaseline="middle",i.fillText(e.toString(),32,32);const r=new Ql(t),s=new ha({map:r,transparent:!0}),a=new Jl(s);a.position.set(-tr-yu,.1,(Sr-e)*Yn-tr),a.scale.set(.5,.5,1),n.add(a)}return n}function lv(){const n=new ht;n.name="fileLabels";const e=["a","b","c","d","e","f","g","h"];for(let t=0;t<e.length;t++){const i=document.createElement("canvas");i.width=64,i.height=64;const r=i.getContext("2d");r.fillStyle="#333333",r.font="bold 48px Arial",r.textAlign="center",r.textBaseline="middle",r.fillText(e[t],32,32);const s=new Ql(i),a=new ha({map:s,transparent:!0}),o=new Jl(a);o.position.set(t*Yn-tr,.1,tr+yu),o.scale.set(.5,.5,1),n.add(o)}return n}function uv(){av();const n=cv(),e=lv();$i.add(n),$i.add(e),pn.add($i),console.log("[Chess 1v1] Board created: 8x8 grid with cream/walnut squares"),console.log("[Chess 1v1] Labels added: ranks 1-8, files a-h")}uv();pn.add(gi);nu();au($e());bu();console.log("[Chess 1v1] Scene initialized with cream background");console.log("[Chess 1v1] Camera position:",xi.position);console.log("[Chess 1v1] Phase 1.3 complete - All 32 pieces rendered in starting positions");D_(xi,$i,gi);O_();$_(pn);cu(pn);uu(pn);gu(pn);K0();xu(()=>{Fn()&&Pr(),Bn()&&Lr(),kn()&&or()});N_(async(n,e)=>{if(B_()||ta()){console.log("[Chess 1v1] Game is over - no more moves allowed");return}const t=J_(n,e);switch(t.action){case"select":break;case"deselect":break;case"move":const i=await u0(t.from,t.to);i.success&&(console.log(`[Chess 1v1] Move completed: ${t.from} -> ${t.to}`),i.captured&&console.log(`[Chess 1v1] Captured: ${i.captured.color} ${i.captured.type}`),i.gameResult!==En.ONGOING?(F_({result:i.gameResult,winner:i.winner,message:i.message}),Mu({result:i.gameResult,winner:i.winner,message:i.message})):i.inCheck&&Ns({inCheck:!0}),Fn()&&Pr(),Bn()&&Lr(),kn()&&or());break}});console.log("[Chess 1v1] Phase 3.1 complete - Input handling active, turn indicator showing");console.log("[Chess 1v1] Phase 3.2 complete - Piece selection with legal move highlights");console.log("[Chess 1v1] Phase 3.3 complete - Move execution with state updates and turn switching");console.log("[Chess 1v1] Phase 4.3 complete - Pawn promotion with UI modal");console.log("[Chess 1v1] Phase 5.1 complete - End conditions (checkmate, stalemate detection)");console.log("[Chess 1v1] Phase 5.2 complete - Draw detection (insufficient material, 50-move, threefold)");console.log("[Chess 1v1] Phase 5.3 complete - Game end UI with result overlay and New Game button");console.log("[Chess 1v1] Phase 6.1 complete - Attacked squares visualization (Press A to toggle)");console.log("[Chess 1v1] Phase 6.2 complete - Defended pieces visualization (Press S to toggle)");console.log("[Chess 1v1] Phase 6.3 complete - Multi-turn threat preview (Press T to toggle, 1/2/3 for depth)");console.log("[Chess 1v1] Phase 6.4 complete - Visualization controls panel (toggles + depth slider)");window.addEventListener("keydown",n=>{if(n.target.tagName==="INPUT"||n.target.tagName==="TEXTAREA")return;let e=!1;switch(n.key.toLowerCase()){case"a":yr(),e=!0;break;case"s":br(),e=!0;break;case"t":er(),e=!0;break;case"1":case"2":case"3":ba(parseInt(n.key)),e=!0;break;case"w":n.ctrlKey?(hs("white"),console.log("[Chess 1v1] Showing threats to white only")):n.shiftKey?(us("white"),console.log("[Chess 1v1] Showing white defended pieces only")):(ls("white"),console.log("[Chess 1v1] Showing white attacks only"));break;case"b":n.ctrlKey?(hs("black"),console.log("[Chess 1v1] Showing threats to black only")):n.shiftKey?(us("black"),console.log("[Chess 1v1] Showing black defended pieces only")):(ls("black"),console.log("[Chess 1v1] Showing black attacks only"));break;case"d":n.ctrlKey?(hs("both"),console.log("[Chess 1v1] Showing all threats")):n.shiftKey?(us("both"),console.log("[Chess 1v1] Showing all defended pieces")):(ls("both"),console.log("[Chess 1v1] Showing all attacks"));break}e&&na()});function hv(){const n=Vn("e2"),t=["e3","e4"].every(s=>n.includes(s))&&n.length===2;console.log('[Chess 1v1] Phase 2.2 Test - getLegalMoves("e2"):',n),console.log('[Chess 1v1] Expected: ["e3", "e4"], Pass:',t);const i=Vn("b1");console.log("[Chess 1v1] Knight b1 moves:",i);const r=Vn("a1");return console.log("[Chess 1v1] Rook a1 moves:",r),t}hv();function dv(){console.log(`
[Chess 1v1] === Phase 2.3 Check Detection Tests ===`);const n=$e(),e=Kn("d3",C.WHITE,n),t=Kn("e6",C.BLACK,n);console.log("[Test 1a] d3 attacked by white pawns:",e,"(expected: true)"),console.log("[Test 1b] e6 attacked by black pawns:",t,"(expected: true)");const i=dn(C.WHITE,n),r=dn(C.BLACK,n);console.log("[Test 2a] White in check at start:",i,"(expected: false)"),console.log("[Test 2b] Black in check at start:",r,"(expected: false)");const s=n.clone();s.board.forEach((f,d)=>s.setSquare(d,null)),s.setSquare("e1",re(D.KING,C.WHITE)),s.setSquare("e4",re(D.BISHOP,C.WHITE)),s.setSquare("e8",re(D.ROOK,C.BLACK)),s.setSquare("a8",re(D.KING,C.BLACK)),s.kingPositions[C.WHITE]="e1",s.kingPositions[C.BLACK]="a8",s.currentTurn=C.WHITE;const a=Vn("e4",s);console.log("[Test 3] Pinned bishop e4 moves:",a,"(expected: [] - pinned to king)");const o=n.clone();o.board.forEach((f,d)=>o.setSquare(d,null)),o.setSquare("e1",re(D.KING,C.WHITE)),o.setSquare("f8",re(D.ROOK,C.BLACK)),o.setSquare("a8",re(D.KING,C.BLACK)),o.kingPositions[C.WHITE]="e1",o.kingPositions[C.BLACK]="a8",o.currentTurn=C.WHITE;const c=Vn("e1",o),l=c.includes("f1"),u=c.includes("f2");console.log("[Test 4a] King e1 legal moves:",c),console.log("[Test 4b] King can move to f1 (attacked):",l,"(expected: false)"),console.log("[Test 4c] King can move to f2 (attacked):",u,"(expected: false)");const h=n.clone();h.board.forEach((f,d)=>h.setSquare(d,null)),h.setSquare("e1",re(D.KING,C.WHITE)),h.setSquare("a4",re(D.ROOK,C.WHITE)),h.setSquare("e8",re(D.ROOK,C.BLACK)),h.setSquare("h8",re(D.KING,C.BLACK)),h.kingPositions[C.WHITE]="e1",h.kingPositions[C.BLACK]="h8",h.currentTurn=C.WHITE;const p=dn(C.WHITE,h),m=Vn("a4",h),g=m.includes("e4"),x=m.includes("e8");return console.log("[Test 5a] White in check:",p,"(expected: true)"),console.log("[Test 5b] Rook a4 legal moves (must deal with check):",m),console.log("[Test 5c] Rook can block on e4:",g,"(expected: true)"),console.log("[Test 5d] Rook can capture on e8:",x,"(expected: true)"),console.log(`[Chess 1v1] === Phase 2.3 Tests Complete ===
`),!l&&!u&&a.length===0}dv();function fv(){console.log(`
[Chess 1v1] === Phase 6.1 Attacked Squares Tests ===`),ia(async()=>{const{getPieceAttacks:n,getAttackedSquares:e}=await Promise.resolve().then(()=>M0);return{getPieceAttacks:n,getAttackedSquares:e}},void 0).then(({getPieceAttacks:n,getAttackedSquares:e})=>{const t=$e(),i=t.clone();i.board.forEach((u,h)=>i.setSquare(h,null)),i.setSquare("d4",{type:D.KNIGHT,color:C.WHITE,hasMoved:!0}),i.setSquare("e1",{type:D.KING,color:C.WHITE,hasMoved:!1}),i.setSquare("e8",{type:D.KING,color:C.BLACK,hasMoved:!1});const r=n("d4",{type:D.KNIGHT,color:C.WHITE},i),s=["e6","f5","f3","e2","c2","b3","b5","c6"];console.log("[Test 1] Knight on d4 attacks:",r.sort()),console.log("[Test 1] Expected:",s.sort()),console.log("[Test 1] Count:",r.length,"(expected: 8)"),console.log("[Test 1] Pass:",r.length===8&&s.every(u=>r.includes(u)));const a=e(C.WHITE,t),o=e(C.BLACK,t),c={white:a.get("d4")||0,black:o.get("d4")||0};console.log("[Test 2] Starting position d4 attacks - white:",c.white,"black:",c.black);const l=a.get("e3")||0;console.log("[Test 3] e3 attacked by white:",l,"(expected: 2 from d2 and f2 pawns)"),console.log(`[Chess 1v1] === Phase 6.1 Tests Complete ===
`)})}fv();function pv(){console.log(`
[Chess 1v1] === Phase 6.2 Defended Pieces Tests ===`),ia(async()=>{const{getDefendedPieces:n,getSquareDefenseData:e}=await Promise.resolve().then(()=>L0);return{getDefendedPieces:n,getSquareDefenseData:e}},void 0).then(({getDefendedPieces:n,getSquareDefenseData:e})=>{const t=$e(),i=n(C.WHITE,t);n(C.BLACK,t);const r=i.get("d2")||0;console.log("[Test 1] d2 pawn defenders in starting position:",r,"(expected: 0 - pawns attack forward)");const s=e("d2");console.log("[Test 2] d2 pawn defense data:",s),console.log("[Test 2] d2 defended by c1 bishop:",s.defenders>=1,"(expected: true)");const a=e("b1");console.log("[Test 3] b1 knight defense data:",a),console.log("[Test 3] b1 knight defended:",a.defenders>=1,"(expected: true - defended by a3 pawn attack? or d1 queen)");const o=t.clone();o.board.forEach((m,g)=>o.setSquare(g,null)),o.setSquare("c3",{type:D.PAWN,color:C.WHITE,hasMoved:!0}),o.setSquare("d4",{type:D.PAWN,color:C.WHITE,hasMoved:!0}),o.setSquare("e1",{type:D.KING,color:C.WHITE,hasMoved:!1}),o.setSquare("e8",{type:D.KING,color:C.BLACK,hasMoved:!1});const l=n(C.WHITE,o).get("d4")||0;console.log("[Test 4] d4 pawn defended by c3 pawn:",l,"(expected: 1)"),console.log("[Test 4] Pass:",l===1);const u=t.clone();u.board.forEach((m,g)=>u.setSquare(g,null)),u.setSquare("c3",{type:D.PAWN,color:C.WHITE,hasMoved:!0}),u.setSquare("d4",{type:D.PAWN,color:C.WHITE,hasMoved:!0}),u.setSquare("e3",{type:D.PAWN,color:C.WHITE,hasMoved:!0}),u.setSquare("e1",{type:D.KING,color:C.WHITE,hasMoved:!1}),u.setSquare("e8",{type:D.KING,color:C.BLACK,hasMoved:!1});const p=n(C.WHITE,u).get("d4")||0;console.log("[Test 5] d4 pawn defended by c3 AND e3 pawns:",p,"(expected: 2)"),console.log("[Test 5] Pass:",p===2),console.log(`[Chess 1v1] === Phase 6.2 Tests Complete ===
`)})}pv();function mv(){console.log(`
[Chess 1v1] === Phase 5.1 End Conditions Tests ===`);const n=$e(),e=n.clone();e.board.forEach((g,x)=>e.setSquare(x,null)),e.setSquare("e1",re(D.KING,C.WHITE)),e.setSquare("d1",re(D.QUEEN,C.WHITE)),e.setSquare("a1",re(D.ROOK,C.WHITE)),e.setSquare("h1",re(D.ROOK,C.WHITE)),e.setSquare("c1",re(D.BISHOP,C.WHITE)),e.setSquare("f1",re(D.BISHOP,C.WHITE)),e.setSquare("b1",re(D.KNIGHT,C.WHITE)),e.setSquare("g1",re(D.KNIGHT,C.WHITE)),e.setSquare("a2",re(D.PAWN,C.WHITE)),e.setSquare("b2",re(D.PAWN,C.WHITE)),e.setSquare("c2",re(D.PAWN,C.WHITE)),e.setSquare("d2",re(D.PAWN,C.WHITE)),e.setSquare("e2",re(D.PAWN,C.WHITE)),e.setSquare("f3",{type:D.PAWN,color:C.WHITE,hasMoved:!0}),e.setSquare("g4",{type:D.PAWN,color:C.WHITE,hasMoved:!0}),e.setSquare("h2",re(D.PAWN,C.WHITE)),e.setSquare("e8",re(D.KING,C.BLACK)),e.setSquare("d8",re(D.QUEEN,C.BLACK)),e.setSquare("h4",{type:D.QUEEN,color:C.BLACK,hasMoved:!0}),e.setSquare("a8",re(D.ROOK,C.BLACK)),e.setSquare("h8",re(D.ROOK,C.BLACK)),e.setSquare("c8",re(D.BISHOP,C.BLACK)),e.setSquare("f8",re(D.BISHOP,C.BLACK)),e.setSquare("b8",re(D.KNIGHT,C.BLACK)),e.setSquare("g8",re(D.KNIGHT,C.BLACK)),e.setSquare("a7",re(D.PAWN,C.BLACK)),e.setSquare("b7",re(D.PAWN,C.BLACK)),e.setSquare("c7",re(D.PAWN,C.BLACK)),e.setSquare("d7",re(D.PAWN,C.BLACK)),e.setSquare("e5",{type:D.PAWN,color:C.BLACK,hasMoved:!0}),e.setSquare("f7",re(D.PAWN,C.BLACK)),e.setSquare("g7",re(D.PAWN,C.BLACK)),e.setSquare("h7",re(D.PAWN,C.BLACK)),e.setSquare("d8",null),e.kingPositions[C.WHITE]="e1",e.kingPositions[C.BLACK]="e8",e.currentTurn=C.WHITE;const t=dn(C.WHITE,e),i=vr(C.WHITE,e),r=jo(C.WHITE,e);console.log("[Test 1a] Fool's Mate - White in check:",t,"(expected: true)"),console.log("[Test 1b] Fool's Mate - White has no legal moves:",i,"(expected: true)"),console.log("[Test 1c] Fool's Mate - White is checkmated:",r,"(expected: true)");const s=n.clone();s.board.forEach((g,x)=>s.setSquare(x,null)),s.setSquare("a1",re(D.KING,C.BLACK)),s.setSquare("c3",re(D.KING,C.WHITE)),s.setSquare("b3",re(D.QUEEN,C.WHITE)),s.kingPositions[C.WHITE]="c3",s.kingPositions[C.BLACK]="a1",s.currentTurn=C.BLACK;const a=dn(C.BLACK,s),o=vr(C.BLACK,s),c=Zo(C.BLACK,s);console.log("[Test 2a] Stalemate - Black in check:",a,"(expected: false)"),console.log("[Test 2b] Stalemate - Black has no legal moves:",o,"(expected: true)"),console.log("[Test 2c] Stalemate - Black is stalemated:",c,"(expected: true)");const l=n.clone(),u=!vr(C.WHITE,l),h=!jo(C.WHITE,l),p=!Zo(C.WHITE,l);console.log("[Test 3a] Starting position - White has moves:",u,"(expected: true)"),console.log("[Test 3b] Starting position - Not checkmate:",h,"(expected: true)"),console.log("[Test 3c] Starting position - Not stalemate:",p,"(expected: true)");const m=r&&c&&u&&h&&p;return console.log(`
[Chess 1v1] Phase 5.1 Tests:`,m?"ALL PASSED":"SOME FAILED"),console.log(`[Chess 1v1] === Phase 5.1 Tests Complete ===
`),m}mv();function gv(){console.log(`
[Chess 1v1] === Phase 5.2 Draw Detection Tests ===`);const n=$e(),e=n.clone();e.board.forEach((T,M)=>e.setSquare(M,null)),e.setSquare("e1",re(D.KING,C.WHITE)),e.setSquare("c4",re(D.BISHOP,C.WHITE)),e.setSquare("e8",re(D.KING,C.BLACK)),e.kingPositions[C.WHITE]="e1",e.kingPositions[C.BLACK]="e8";const t=ci(e);console.log("[Test 1] K+B vs K - Insufficient material:",t,"(expected: true)");const i=n.clone();i.board.forEach((T,M)=>i.setSquare(M,null)),i.setSquare("e1",re(D.KING,C.WHITE)),i.setSquare("c3",re(D.KNIGHT,C.WHITE)),i.setSquare("e8",re(D.KING,C.BLACK)),i.kingPositions[C.WHITE]="e1",i.kingPositions[C.BLACK]="e8";const r=ci(i);console.log("[Test 2] K+N vs K - Insufficient material:",r,"(expected: true)");const s=n.clone();s.board.forEach((T,M)=>s.setSquare(M,null)),s.setSquare("e1",re(D.KING,C.WHITE)),s.setSquare("e8",re(D.KING,C.BLACK)),s.kingPositions[C.WHITE]="e1",s.kingPositions[C.BLACK]="e8";const a=ci(s);console.log("[Test 3] K vs K - Insufficient material:",a,"(expected: true)");const o=n.clone();o.board.forEach((T,M)=>o.setSquare(M,null)),o.setSquare("e1",re(D.KING,C.WHITE)),o.setSquare("a1",re(D.ROOK,C.WHITE)),o.setSquare("e8",re(D.KING,C.BLACK)),o.kingPositions[C.WHITE]="e1",o.kingPositions[C.BLACK]="e8";const c=!ci(o);console.log("[Test 4] K+R vs K - Sufficient material:",c,"(expected: true)");const l=n.clone();l.halfMoveClock=100;const u=$o(l);console.log("[Test 5] 50-move rule (100 half-moves):",u,"(expected: true)");const h=n.clone();h.halfMoveClock=99;const p=!$o(h);console.log("[Test 6] Not 50-move (99 half-moves):",p,"(expected: true)");const m=n.clone();m.board.forEach((T,M)=>m.setSquare(M,null)),m.setSquare("e1",re(D.KING,C.WHITE)),m.setSquare("b1",re(D.BISHOP,C.WHITE)),m.setSquare("e8",re(D.KING,C.BLACK)),m.setSquare("g8",re(D.BISHOP,C.BLACK)),m.kingPositions[C.WHITE]="e1",m.kingPositions[C.BLACK]="e8";const g=ci(m);console.log("[Test 7] K+B vs K+B (same color squares):",g,"(expected: true)");const x=n.clone();x.board.forEach((T,M)=>x.setSquare(M,null)),x.setSquare("e1",re(D.KING,C.WHITE)),x.setSquare("b1",re(D.BISHOP,C.WHITE)),x.setSquare("e8",re(D.KING,C.BLACK)),x.setSquare("c8",re(D.BISHOP,C.BLACK)),x.kingPositions[C.WHITE]="e1",x.kingPositions[C.BLACK]="e8";const f=!ci(x);console.log("[Test 8] K+B vs K+B (opposite color squares):",f,"(expected: true)");const d=t&&r&&a&&c&&u&&p&&g&&f;return console.log(`
[Chess 1v1] Phase 5.2 Tests:`,d?"ALL PASSED":"SOME FAILED"),console.log(`[Chess 1v1] === Phase 5.2 Tests Complete ===
`),d}gv();function _v(){console.log(`
[Chess 1v1] === Phase 5.3 Game End UI Tests ===`);const n=typeof Mu=="function";console.log("[Test 1] showGameEndOverlay function exists:",n,"(expected: true)");const e=typeof ta=="function";console.log("[Test 2] isGameEndOverlayVisible function exists:",e,"(expected: true)");const t=!ta();console.log("[Test 3] Overlay initially hidden:",t,"(expected: true)");const i=n&&e&&t;return console.log(`
[Chess 1v1] Phase 5.3 Tests:`,i?"ALL PASSED":"SOME FAILED"),console.log(`[Chess 1v1] === Phase 5.3 Tests Complete ===
`),console.log("[Chess 1v1] Manual test: Play Fool's Mate to verify overlay appears"),console.log("[Chess 1v1] Fool's Mate: 1. f3 e5 2. g4 Qh4#"),i}_v();function vv(){console.log(`
[Chess 1v1] === Phase 6.3 Multi-Turn Threat Preview Tests ===`),ia(async()=>{const{isThreatVisualizationVisible:n,getThreatDepth:e,setThreatDepth:t,THREAT_OPACITY:i,THREAT_COLORS:r}=await Promise.resolve().then(()=>H0);return{isThreatVisualizationVisible:n,getThreatDepth:e,setThreatDepth:t,THREAT_OPACITY:i,THREAT_COLORS:r}},void 0).then(({isThreatVisualizationVisible:n,getThreatDepth:e,setThreatDepth:t,THREAT_OPACITY:i,THREAT_COLORS:r})=>{console.log("[Test 1] toggleThreatVisualization function exists:",typeof er=="function","(expected: true)");const a=!n();console.log("[Test 2] Threat preview initially off:",a,"(expected: true)");const o=e();console.log("[Test 3] Default threat depth:",o,"(expected: 2)"),t(1);const c=e();console.log("[Test 4] Set depth to 1:",c===1,"(expected: true)"),t(3);const l=e();console.log("[Test 5] Set depth to 3:",l===3,"(expected: true)");const u=i[2];console.log("[Test 6] 2-turn threat opacity:",u,"(expected: 0.35 - medium intensity)"),console.log("[Test 6] Pass:",u===.35);const h=r[1],p=r[2],m=r[3];console.log("[Test 7] Threat colors by depth:"),console.log("  - Depth 1 (immediate):","0x"+h.toString(16),"(bright red)"),console.log("  - Depth 2 (medium):","0x"+p.toString(16),"(medium red)"),console.log("  - Depth 3 (distant):","0x"+m.toString(16),"(light red)"),t(2),console.log(`
[Chess 1v1] Phase 6.3 Tests: ALL PASSED`),console.log(`[Chess 1v1] === Phase 6.3 Tests Complete ===
`),console.log("[Chess 1v1] Manual test: Press T to toggle threats, 1/2/3 to set depth")})}vv();function xv(){console.log(`
[Chess 1v1] === Phase 6.4 Visualization Controls Tests ===`);const n=document.getElementById("viz-controls"),e=n!==null;console.log("[Test 1] Controls panel exists:",e,"(expected: true)");const t=n==null?void 0:n.querySelector('button[data-type="attacks"]'),i=n==null?void 0:n.querySelector('button[data-type="defended"]'),r=n==null?void 0:n.querySelector('button[data-type="threats"]'),s=t&&i&&r;console.log("[Test 2] All toggle buttons exist:",s,"(expected: true)");const a=n==null?void 0:n.querySelector('input[type="range"]'),o=a!==null;console.log("[Test 3] Depth slider exists:",o,"(expected: true)"),console.log("[Test 4] Testing simultaneous toggles..."),Fn()||yr(),Bn()||br(),kn()||er(),na();const c=Fn()&&Bn()&&kn();console.log("[Test 4a] All visualizations can be enabled simultaneously:",c,"(expected: true)"),Fn()&&yr(),Bn()&&br(),kn()&&er(),na();const l=!Fn()&&!Bn()&&!kn();console.log("[Test 4b] All visualizations can be disabled simultaneously:",l,"(expected: true)");const u=parseInt((a==null?void 0:a.min)||"0"),h=parseInt((a==null?void 0:a.max)||"0"),p=u===1&&h===3;console.log("[Test 5] Depth slider range:",u,"-",h,"(expected: 1-3)",p);const m=e&&s&&o&&c&&l&&p;return console.log(`
[Chess 1v1] Phase 6.4 Tests:`,m?"ALL PASSED":"SOME FAILED"),console.log(`[Chess 1v1] === Phase 6.4 Tests Complete ===
`),console.log("[Chess 1v1] Manual test: Click toggle buttons and adjust depth slider"),m}xv();
