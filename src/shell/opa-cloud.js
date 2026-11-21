
/* ===== OPA Cloud v74: Supabase online untuk data, lampiran, dan hasil generate ===== */
/* Bridge: dijalankan di window utama DAN di setiap iframe modul (di-stringify). Harus mandiri. */
function OPA_BRIDGE(win){
  if(win.__opaBridge)return;win.__opaBridge=1;
  var C=function(){try{return win.OPACloud||(win.parent&&win.parent.OPACloud)||null}catch(e){return null}};
  var who=function(){try{var id=win.frameElement&&win.frameElement.id;return{f0:'Kontrak',f1:'Absensi',f2:'Dokumen',f3:'PPh 21'}[id]||'Slip Gaji / Suite'}catch(e){return'Suite'}};
  var reg=new Map();
  try{var cou=win.URL.createObjectURL;win.URL.createObjectURL=function(o){var u=cou.apply(win.URL,arguments);try{if(o&&typeof o==='object'&&typeof o.size==='number'&&typeof o.type==='string'){reg.set(u,o);if(reg.size>80)reg.delete(reg.keys().next().value)}}catch(e){}return u}}catch(e){}
  var gen=function(a){try{if(!a||!a.download)return;var h=String(a.href||'');if(h.indexOf('blob:')!==0)return;var b=reg.get(h),c=C();if(b&&c&&c.uploadGenerated)c.uploadGenerated(b,String(a.download),who())}catch(e){}};
  try{var AP=win.HTMLAnchorElement.prototype,ck=AP.click;AP.click=function(){gen(this);return ck.apply(this,arguments)}}catch(e){}
  try{var ET=win.EventTarget.prototype,de=ET.dispatchEvent;ET.dispatchEvent=function(ev){try{if(ev&&ev.type==='click'&&this instanceof win.HTMLAnchorElement)gen(this)}catch(e){}return de.apply(this,arguments)}}catch(e){}
  /* Tugas 2: cetak-saja (window.print) tidak menghasilkan berkas; simpan snapshot HTML-nya sebagai arsip cetak */
  var snap=function(w){try{var d=w.document,c=C();if(!c||!c.uploadGenerated||!d||!d.documentElement)return;var t=String(d.title||'Cetak').replace(/[\\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim()||'Cetak';var html='<!doctype html>'+d.documentElement.outerHTML;c.uploadGenerated(new win.Blob([html],{type:'text/html'}),t+'.html',who())}catch(e){}};
  var wp=function(w){try{if(!w||w.__opaPrint||typeof w.print!=='function')return;var op=w.print;w.__opaPrint=1;w.print=function(){try{snap(w)}catch(e){}return op.apply(w,arguments)}}catch(e){}};
  wp(win);
  try{var HD=Object.getOwnPropertyDescriptor(win.HTMLIFrameElement.prototype,'contentWindow');if(HD&&HD.get){Object.defineProperty(win.HTMLIFrameElement.prototype,'contentWindow',{configurable:true,enumerable:HD.enumerable,get:function(){var w=HD.get.call(this);wp(w);return w}})}}catch(e){}
  try{
    var OS=win.IDBObjectStore.prototype,put=OS.put,add=OS.add,del=OS.delete;
    var note=function(s,op,k){try{if(typeof k!=='string')return;var c=C();if(c&&c.idbNote)c.idbNote(s.transaction.db.name,op,k)}catch(e){}};
    OS.put=function(v,k){var r=put.apply(this,arguments);note(this,'put',k);return r};
    OS.add=function(v,k){var r=add.apply(this,arguments);note(this,'put',k);return r};
    OS.delete=function(k){var r=del.apply(this,arguments);note(this,'del',k);return r};
  }catch(e){}
}
OPA_BRIDGE(window);
window.OPA_BRIDGE_HTML='<script>('+OPA_BRIDGE.toString()+')(window)<\/script>';

(function(){
'use strict';
const CFG=window.OPA_CONFIG||{};
const SUPABASE_URL=String(CFG.supabaseUrl||'').trim();
const SUPABASE_KEY=String(CFG.supabaseKey||'').trim();
const BUCKET='arsip';
const FILE_DBS=['opa_cd_files','opa_hr_dms'];
const PPH_DB='localforage',PPH_STORE='keyvaluepairs',PPH_SKIP=['draft','fh'],PPH_PREFIX='pph/',PPH_LEGACY='pph_therapist_all';
const SYNC_KEYS=['opa_contractdesk_v2','ohm-v16-karyawan','ohm-v16-kasus','opa-hr-suite-v1-late-cases','opa_db','opa_md','opa-pic-map','opa-pdf-seq2','opa-daily','opa-notes','opa-reminders','opa-slip-gaji','opa-pic-letters','opa-arch-queue','opa-daily-jam','opa-suite-wa','opa-suite-watpl'];
const MAX_UP=48*1024*1024;
const BASE_DB='opa_cloud_base';
const GEN_EXT=['pdf','xml','xlsx','xls','doc','docx','png','jpg','jpeg','csv','zip','txt','html'];
const MIME_EXT={pdf:'application/pdf',xml:'application/xml',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',xls:'application/vnd.ms-excel',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',csv:'text/csv',html:'text/html',zip:'application/zip',txt:'text/plain'};
const $=s=>document.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const say=(m,a)=>{try{window.toast&&window.toast(m,a)}catch(e){}};
const DEBUG=(()=>{try{return localStorage.getItem('opa_debug')==='1'}catch(e){return false}})();
function log(m){console.log('[OPA Cloud] '+m);if(!DEBUG)return;const el=$('#supaDebug');if(el){el.style.display='block';el.textContent=(new Date().toLocaleTimeString())+' '+m+'\n'+el.textContent.slice(0,2000)}}
function setStatus(t){const el=$('#supaSyncStatus');if(el)el.textContent=t}
function loginMsg(t){const el=$('#supaMsg');if(el)el.textContent=t||''}
const errMsg=e=>(e&&(e.message||e.error_description||e.error))||String(e);

if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(SUPABASE_URL)||SUPABASE_KEY.length<20){loginMsg('Alamat Supabase belum diisi. Buka berkas config.js di GitHub, isi Project URL dan Publishable key dari project Supabase Anda, lalu muat ulang halaman.');const l0=$('#supaLogin');if(l0)l0.classList.add('on');return}
if(!window.supabase){loginMsg('Library Supabase gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.');const l=$('#supaLogin');if(l)l.classList.add('on');return}
const supa=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
window.supa=supa;window.SUPA_CLIENT=supa;

let ME=null;               // {session,profile}
const lastHashes={},pushTimers={};
const quiet=new Set();     // penulisan IDB internal yang tidak perlu diunggah ulang

/* ---------- util ---------- */
function hashStr(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return h}
function canon(x){if(Array.isArray(x))return x.map(canon);if(x&&typeof x==='object'){const o={};Object.keys(x).sort().forEach(k=>o[k]=canon(x[k]));return o}return x}
function sameJSON(a,b){if(a===b)return true;try{return JSON.stringify(canon(JSON.parse(a)))===JSON.stringify(canon(JSON.parse(b)))}catch(e){return false}}
function toJsonValue(s){let p;try{p=JSON.parse(s)}catch(e){return s}return typeof p==='string'?{__s:s}:p}
function fromJsonValue(v){if(typeof v==='string')return v;if(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===1&&typeof v.__s==='string')return v.__s;return JSON.stringify(v)}
const getMeta=k=>{try{return JSON.parse(localStorage.getItem('supa_meta_'+k)||'null')}catch(e){return null}};
const setMeta=(k,m)=>{try{localStorage.setItem('supa_meta_'+k,JSON.stringify(m))}catch(e){}};
const lsGet=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const safeName=s=>String(s).replace(/[^A-Za-z0-9._-]/g,'_').slice(0,120);
function filePath(db,key){const s=safeName(key);return'files/'+db+'/'+(s===key?s:s+'-'+(hashStr(key)>>>0).toString(16))}
const blobToDataURL=b=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(r.error);r.readAsDataURL(b)});

/* ---------- IndexedDB mentah ---------- */
const sn=n=>n===PPH_DB?PPH_STORE:'f';
const dbCache={};
function openDb(n){return dbCache[n]||(dbCache[n]=new Promise((ok,no)=>{const r=n===PPH_DB?indexedDB.open(n):indexedDB.open(n,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(sn(n)))r.result.createObjectStore(sn(n))};r.onsuccess=()=>{const d=r.result;d.onversionchange=()=>{d.close();delete dbCache[n]};ok(d)};r.onerror=()=>{delete dbCache[n];no(r.error)}}))}
async function rawReq(n,mode,fn){const d=await openDb(n);return new Promise((ok,no)=>{const t=d.transaction(sn(n),mode),q=fn(t.objectStore(sn(n)));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error);t.onabort=()=>no(t.error)})}
const rawKeys=n=>rawReq(n,'readonly',s=>s.getAllKeys());
const rawGet=(n,k)=>rawReq(n,'readonly',s=>s.get(k));
async function rawPut(n,k,v){const id=n+'::'+k;quiet.add(id);try{await rawReq(n,'readwrite',s=>s.put(v,k))}finally{quiet.delete(id)}}
async function rawDel(n,k){const id=n+'::'+k;quiet.add(id);try{await rawReq(n,'readwrite',s=>s.delete(k))}finally{quiet.delete(id)}}

/* ---------- antrean perubahan lokal (persisten) ---------- */
let PEND=lsGet('opa_cloud_pend',{});const savePend=()=>lsSet('opa_cloud_pend',PEND);
let flushing=false,flushTimer=null;
function schedFlush(ms){clearTimeout(flushTimer);flushTimer=setTimeout(flush,ms==null?900:ms)}
function idbNote(db,op,key){
  const id=db+'::'+key;
  if(quiet.has(id)){quiet.delete(id);return}
  if(FILE_DBS.includes(db)){}
  else if(db===PPH_DB){if(PPH_SKIP.includes(key))return}
  else return;
  PEND[id]={db,key,op,ts:Date.now(),n:0};savePend();refreshStatus();if(ME)schedFlush()
}
/* Perkecil otomatis foto/gambar besar sebelum diunggah (hanya salinan online; berkas asli di perangkat tidak diubah) */
const SHRINK_MIN=700*1024,SHRINK_MAXPX=2000;
async function shrinkBlob(blob,key){
  try{
    if(!blob||!/^image\/(jpeg|png|webp)$/i.test(blob.type||'')||blob.size<SHRINK_MIN)return blob;
    const bmp=await createImageBitmap(blob,{imageOrientation:'from-image'});
    const sc=Math.min(1,SHRINK_MAXPX/Math.max(bmp.width,bmp.height)),w=Math.max(1,Math.round(bmp.width*sc)),h=Math.max(1,Math.round(bmp.height*sc));
    const cv=document.createElement('canvas');cv.width=w;cv.height=h;
    const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,w,h);cx.drawImage(bmp,0,0,w,h);if(bmp.close)bmp.close();
    const out=await new Promise(r=>cv.toBlob(r,'image/jpeg',0.8));
    if(out&&out.size<blob.size*0.85){log('Perkecil '+key+' '+Math.round(blob.size/1024)+' -> '+Math.round(out.size/1024)+' KB');return out}
  }catch(e){log('Perkecil gagal '+key+': '+errMsg(e))}
  return blob
}
async function pushFile(db,key){
  const v=await rawGet(db,key);if(v===undefined)return;
  let blob,kind,mime;
  if(v instanceof Blob){blob=v;kind='blob';mime=v.type||'application/octet-stream'}
  else if(typeof v==='string'){
    const m=/^data:([^;,]*)((?:;[^;,]*)*),/.exec(v);
    if(m&&/;base64/.test(m[2])){mime=m[1]||'application/octet-stream';const ab=await (await fetch(v)).arrayBuffer();blob=new Blob([ab],{type:mime});kind='dataurl'}
    else{blob=new Blob([v],{type:'text/plain'});kind='text';mime='text/plain'}
  }else if(v instanceof ArrayBuffer||ArrayBuffer.isView(v)){blob=new Blob([v]);kind='buffer';mime='application/octet-stream'}
  else{blob=new Blob([JSON.stringify(v)],{type:'application/json'});kind='json';mime='application/json'}
  if(kind!=='text'&&kind!=='json'){const nb=await shrinkBlob(blob,key);if(nb!==blob){blob=nb;mime=nb.type||mime}}
  if(blob.size>MAX_UP){const e=new Error('Berkas '+key+' lebih dari 48 MB, tidak diunggah');e.permanent=true;throw e}
  const path=filePath(db,key);
  const up=await supa.storage.from(BUCKET).upload(path,blob,{upsert:true,contentType:mime,cacheControl:'3600'});
  if(up.error)throw up.error;
  const r=await supa.from('app_files').upsert({file_key:db+'::'+key,store:db,original_name:key,mime_type:mime,size_bytes:blob.size,storage_path:path,kind,source:db==='opa_hr_dms'?'Dokumen':'Kontrak/Rekrutmen',deleted_at:null},{onConflict:'file_key'}).select('updated_at').single();
  if(r.error)throw r.error;
  const fm=lsGet('opa_cloud_fmeta',{});fm[db+'::'+key]=r.data.updated_at;lsSet('opa_cloud_fmeta',fm);
  log('Upload '+db+'/'+key+' '+Math.round(blob.size/1024)+' KB')
}
async function pushPph(key){
  const v=await rawGet(PPH_DB,key);if(v===undefined)return;
  let val;try{val=JSON.parse(JSON.stringify(v))}catch(e){return}
  const r=await supa.from('app_data').upsert({key:PPH_PREFIX+key,value:val},{onConflict:'key'}).select('version,updated_at').single();
  if(r.error)throw r.error;
  setMeta(PPH_PREFIX+key,{version:r.data.version,updated_at:r.data.updated_at});
  const kn=new Set(lsGet('opa_cloud_pphknown',[]));kn.add(key);lsSet('opa_cloud_pphknown',[...kn])
}
async function runPending(p){
  if(p.db===PPH_DB){
    if(p.op==='del'){const r=await supa.from('app_data').delete().eq('key',PPH_PREFIX+p.key);if(r.error)throw r.error;const kn=new Set(lsGet('opa_cloud_pphknown',[]));kn.delete(p.key);lsSet('opa_cloud_pphknown',[...kn])}
    else await pushPph(p.key);return
  }
  if(p.op==='del'){
    const r=await supa.from('app_files').update({deleted_at:new Date().toISOString()}).eq('file_key',p.db+'::'+p.key);if(r.error)throw r.error;
    const fm=lsGet('opa_cloud_fmeta',{});delete fm[p.db+'::'+p.key];lsSet('opa_cloud_fmeta',fm);return
  }
  await pushFile(p.db,p.key)
}
async function flush(){
  if(flushing||!ME)return;flushing=true;let fail=0,total=Object.keys(PEND).length;
  try{
    for(const id of Object.keys(PEND)){
      const p=PEND[id];
      try{await runPending(p);delete PEND[id];savePend()}
      catch(e){
        if(e&&e.permanent){delete PEND[id];savePend();say('⚠ '+errMsg(e));continue}
        p.n=(p.n||0)+1;p.err=errMsg(e);savePend();fail++;log('Gagal '+id+': '+p.err);
        if(/row-level|policy|not found|bucket/i.test(p.err))say('⚠ Upload ditolak Supabase: '+p.err+'. Jalankan supabase-setup.sql.')
      }
      refreshStatus()
    }
  }finally{flushing=false}
  refreshStatus();
  if(fail){const worst=Math.max(...Object.values(PEND).map(p=>p.n||0));if(worst<6)schedFlush(Math.min(60000,5000*Math.pow(2,worst)))}
  else if(total){say('☁ '+total+' perubahan berkas tersimpan online')}
}

/* ---------- hasil generate (PDF, XML, Excel, dll.) ---------- */
const GEN_SEEN=new Map();let GEN_Q=[],genBusy=false;
function uploadGenerated(blob,name,source){
  try{
    const ext=(String(name).split('.').pop()||'').toLowerCase();
    if(!GEN_EXT.includes(ext)||!ME||!blob||!blob.size)return;
    if(blob.size>MAX_UP){say('⚠ '+name+' terlalu besar (>48 MB) untuk disimpan online');return}
    const sig=name+'|'+blob.size,now=Date.now();
    if((GEN_SEEN.get(sig)||0)>now-8000)return;GEN_SEEN.set(sig,now);
    GEN_Q.push({blob,name:String(name),source:source||'Suite',ext,n:0});runGen()
  }catch(e){log('gen err '+errMsg(e))}
}
async function runGen(){
  if(genBusy)return;genBusy=true;
  try{
    while(GEN_Q.length){
      const g=GEN_Q[0];
      try{
        const d=new Date(),p2=x=>String(x).padStart(2,'0'),stamp=d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'-'+p2(d.getHours())+p2(d.getMinutes())+p2(d.getSeconds());
        const slip=/slip/i.test(g.name)||/^Slip/i.test(g.source);if(slip)g.source='Slip Gaji';const path=(slip?'generated/slip-gaji/':'generated/')+d.getFullYear()+'/'+p2(d.getMonth()+1)+'/'+stamp+'_'+Math.random().toString(36).slice(2,5)+'_'+safeName(g.name);
        const mime=g.blob.type||MIME_EXT[g.ext]||'application/octet-stream';
        const up=await supa.storage.from(BUCKET).upload(path,g.blob,{upsert:false,contentType:mime});
        if(up.error)throw up.error;
        const r=await supa.from('app_files').insert({file_key:'generated::'+path,store:'generated',original_name:g.name,mime_type:mime,size_bytes:g.blob.size,storage_path:path,kind:'generated',source:g.source});
        if(r.error)throw r.error;
        GEN_Q.shift();say('☁ Tersimpan online: '+g.name);log('Generated '+path)
      }catch(e){
        g.n++;log('Gen gagal: '+errMsg(e));
        if(g.n>=3){GEN_Q.shift();say('⚠ Gagal menyimpan '+g.name+' ke cloud: '+errMsg(e))}else await sleep(2000*g.n)
      }
      refreshStatus()
    }
  }finally{genBusy=false}
}

/* ---------- sinkron berkas lampiran (IndexedDB <-> Storage) ---------- */
async function fetchAll(table,cols,apply){
  const out=[];for(let from=0;;from+=1000){let q=supa.from(table).select(cols).range(from,from+999);if(apply)q=apply(q);const r=await q;if(r.error)throw r.error;out.push(...r.data);if(r.data.length<1000)break}return out
}
async function pullFile(row){
  const dl=await supa.storage.from(BUCKET).download(row.storage_path);if(dl.error)throw dl.error;
  const key=row.file_key.slice(row.store.length+2),b=new Blob([dl.data],{type:row.mime_type||dl.data.type});
  let val;
  switch(row.kind){case'dataurl':val=await blobToDataURL(b);break;case'text':val=await b.text();break;case'json':val=JSON.parse(await b.text());break;case'buffer':val=await b.arrayBuffer();break;default:val=b}
  await rawPut(row.store,key,val);
  const fm=lsGet('opa_cloud_fmeta',{});fm[row.file_key]=row.updated_at;lsSet('opa_cloud_fmeta',fm)
}
async function syncFiles(prog){
  const rows=await fetchAll('app_files','file_key,store,mime_type,size_bytes,storage_path,kind,deleted_at,updated_at',q=>q.in('store',FILE_DBS));
  const fm=lsGet('opa_cloud_fmeta',{});let todo=[],n=0;
  for(const db of FILE_DBS){
    const local=new Set((await rawKeys(db)).filter(k=>typeof k==='string')),cl=new Map(rows.filter(r=>r.store===db).map(r=>[r.file_key,r]));
    for(const [fk,r] of cl){
      const key=fk.slice(db.length+2),dirty=!!PEND[db+'::'+key];
      if(r.deleted_at){if(local.has(key)&&fm[fk]&&!dirty){await rawDel(db,key);delete fm[fk]}continue}
      if(dirty)continue;
      if(!local.has(key))todo.push(r);
      else if(fm[fk]&&r.updated_at>fm[fk])todo.push(r);
      else if(!fm[fk]){fm[fk]=r.updated_at}
    }
    for(const key of local){
      const fk=db+'::'+key,r=cl.get(fk);
      if(!r||r.deleted_at){
        if(r&&!r.deleted_at)continue;
        if(fm[fk]&&r&&r.deleted_at){continue}
        if(fm[fk]&&!r){await rawDel(db,key);delete fm[fk];continue}   // dihapus di perangkat lain
        PEND[db+'::'+key]={db,key,op:'put',ts:Date.now(),n:0}          // berkas lokal baru -> unggah
      }
    }
  }
  lsSet('opa_cloud_fmeta',fm);savePend();
  for(const r of todo){n++;if(prog)prog('Mengunduh berkas '+n+'/'+todo.length+'...');try{await pullFile(r)}catch(e){log('Unduh gagal '+r.file_key+': '+errMsg(e))}}
  refreshStatus();schedFlush(300);return todo.length
}

/* ---------- data localStorage <-> app_data ---------- */
/*MERGE3-START*/
/* Gabung 3 arah (dasar, lokal, cloud) per record. Dipakai saat dua admin mengubah kunci yang sama. */
const mIsObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const mEq=(a,b)=>a===b||JSON.stringify(canon(a))===JSON.stringify(canon(b));
const M_COUNTER=/(^|\/)(nst|seq|seqs|used|rcUsed)(\/|$)/;
function mIdField(arrs){
  const all=arrs.filter(Array.isArray);
  for(const f of ['id','no','key']){
    let ok=true;
    for(const a of all){const seen=new Set();
      for(const it of a){if(!mIsObj(it)||it[f]==null||typeof it[f]==='object'||seen.has(String(it[f]))){ok=false;break}seen.add(String(it[f]))}
      if(!ok)break}
    if(ok)return f}
  return null
}
function mById(f,b,l,r,ctx,path){
  const mp=a=>{const m=new Map();(a||[]).forEach(it=>m.set(String(it[f]),it));return m};
  const bm=mp(b),rm=mp(r),out=[],seen=new Set();
  for(const it of l){const id=String(it[f]);seen.add(id);
    if(rm.has(id))out.push(merge3(bm.get(id),it,rm.get(id),ctx,path+'['+id+']'));
    else if(bm.has(id)){if(!mEq(bm.get(id),it)){ctx.conflicts.push(path+'['+id+'] dihapus di cloud tetapi diubah lokal');out.push(it)}}
    else out.push(it)}
  for(const it of r){const id=String(it[f]);if(seen.has(id))continue;
    if(bm.has(id)){if(!mEq(bm.get(id),it)){ctx.conflicts.push(path+'['+id+'] dihapus lokal tetapi diubah di cloud');out.push(it)}}
    else out.push(it)}
  return out
}
function mBySet(b,l,r){
  const k=x=>JSON.stringify(canon(x)),bs=new Set((b||[]).map(k)),ls=new Set(l.map(k)),rs=new Set(r.map(k)),out=[],seen=new Set();
  for(const it of l){const c=k(it);if(seen.has(c))continue;seen.add(c);if(rs.has(c)||!bs.has(c))out.push(it)}
  for(const it of r){const c=k(it);if(seen.has(c))continue;seen.add(c);if(ls.has(c)||!bs.has(c))out.push(it)}
  return out
}
function merge3(b,l,r,ctx,path){
  ctx=ctx||{conflicts:[]};path=path||'';
  if(mEq(l,r))return l;
  if(mEq(b,l))return r;
  if(mEq(b,r))return l;
  if(l===undefined){ctx.conflicts.push(path+' dihapus lokal tetapi diubah di cloud');return r}
  if(r===undefined){ctx.conflicts.push(path+' dihapus di cloud tetapi diubah lokal');return l}
  if(mIsObj(l)&&mIsObj(r)){
    const bb=mIsObj(b)?b:{},out={};
    new Set([...Object.keys(l),...Object.keys(r),...Object.keys(bb)]).forEach(k=>{const v=merge3(bb[k],l[k],r[k],ctx,path+'/'+k);if(v!==undefined)out[k]=v});
    return out
  }
  if(Array.isArray(l)&&Array.isArray(r)){
    const bb=Array.isArray(b)?b:[],f=mIdField([l,r,bb]);
    return f?mById(f,bb,l,r,ctx,path):mBySet(bb,l,r)
  }
  if(typeof l==='number'&&typeof r==='number'&&M_COUNTER.test(path))return Math.max(l,r);
  ctx.conflicts.push(path+' diubah di dua tempat, nilai lokal dipakai');return l
}
/*MERGE3-END*/
async function loadBase(key){try{const v=await rawGet(BASE_DB,key);return typeof v==='string'?v:null}catch(e){return null}}
function saveBase(key,str){rawPut(BASE_DB,key,str).catch(()=>{})}
async function backupText(name,str){try{await supa.storage.from(BUCKET).upload('backup/'+safeName(name)+'-'+Date.now()+'.json',new Blob([str],{type:'application/json'}),{contentType:'application/json'})}catch(e){}}
function applyLsRow(row){
  const key=row.key,rs=fromJsonValue(row.value),ls=localStorage.getItem(key),meta=getMeta(key);
  if(ls!==null&&sameJSON(ls,rs)){setMeta(key,{version:row.version,updated_at:row.updated_at,h:hashStr(ls)});lastHashes[key]=hashStr(ls);saveBase(key,ls);return false}
  const dirty=ls!==null&&meta&&meta.h!==undefined&&meta.h!==hashStr(ls);
  if(dirty){log('Konflik '+key+': perubahan lokal menunggu digabung');return false}
  if(ls!==null&&!meta)backupText('lokal-'+key,ls);
  localStorage.setItem(key,rs);const h=hashStr(rs);lastHashes[key]=h;setMeta(key,{version:row.version,updated_at:row.updated_at,h});saveBase(key,rs);return true
}
function pushed(key,s,row){const h=hashStr(s);lastHashes[key]=h;setMeta(key,{version:row.version,updated_at:row.updated_at,h});saveBase(key,s);log('Push '+key+' v'+row.version)}
async function pushKey(key,tries){
  const s=localStorage.getItem(key);if(s===null)return;
  const m=getMeta(key);
  if(m&&m.version!=null){
    const r=await supa.from('app_data').update({value:toJsonValue(s)}).eq('key',key).eq('version',m.version).select('version,updated_at');
    if(r.error)throw r.error;
    if(r.data&&r.data.length){pushed(key,s,r.data[0]);return}
    return resolveConflict(key,s,tries||0)
  }
  const r=await supa.from('app_data').insert({key,value:toJsonValue(s)}).select('version,updated_at').single();
  if(r.error){if(r.error.code==='23505'||/duplicate/i.test(r.error.message||''))return resolveConflict(key,s,tries||0);throw r.error}
  pushed(key,s,r.data)
}
async function resolveConflict(key,localStr,tries){
  if(tries>=3)throw new Error('Bentrok berulang pada '+key+', akan dicoba lagi');
  const rr=await supa.from('app_data').select('value,version,updated_at').eq('key',key).maybeSingle();
  if(rr.error)throw rr.error;
  if(!rr.data){const ins=await supa.from('app_data').insert({key,value:toJsonValue(localStr)}).select('version,updated_at').single();if(ins.error)throw ins.error;pushed(key,localStr,ins.data);return}
  const remoteStr=fromJsonValue(rr.data.value);
  if(sameJSON(localStr,remoteStr)){const h=hashStr(localStr);setMeta(key,{version:rr.data.version,updated_at:rr.data.updated_at,h});lastHashes[key]=h;saveBase(key,localStr);return}
  let L,R,B=null,merged=localStr,conflicts=[],parsed=true;
  try{L=JSON.parse(localStr);R=JSON.parse(remoteStr);const bs=await loadBase(key);B=bs?JSON.parse(bs):null}catch(e){parsed=false}
  if(parsed){const ctx={conflicts:[]};merged=JSON.stringify(merge3(B,L,R,ctx));conflicts=ctx.conflicts}
  if(!parsed||conflicts.length){await backupText('konflik-cloud-'+key,remoteStr);await backupText('konflik-lokal-'+key,localStr)}
  if(localStorage.getItem(key)!==localStr)return resolveConflict(key,localStorage.getItem(key),tries+1);
  const remoteAdded=!sameJSON(merged,localStr);
  if(remoteAdded)localStorage.setItem(key,merged);
  const up=await supa.from('app_data').update({value:toJsonValue(merged)}).eq('key',key).eq('version',rr.data.version).select('version,updated_at');
  if(up.error)throw up.error;
  if(!(up.data&&up.data.length))return resolveConflict(key,merged,tries+1);
  pushed(key,merged,up.data[0]);
  log('Digabung '+key+(conflicts.length?' ('+conflicts.length+' bentrok)':''));
  if(remoteAdded){say(conflicts.length?'Perubahan dua admin digabung. '+conflicts.length+' bentrok memakai nilai Anda; salinan ada di backup/':'Perubahan admin lain digabung',['Muat ulang',()=>window.reload&&window.reload()]);setTimeout(()=>{if(window.reload)window.reload()},1500)}
  else if(conflicts.length)say(conflicts.length+' bentrok, nilai Anda dipakai; salinan cloud ada di backup/')
}
function schedulePush(key,ms){clearTimeout(pushTimers[key]);pushTimers[key]=setTimeout(async()=>{delete pushTimers[key];try{setStatus('Menyimpan...');await pushKey(key);refreshStatus()}catch(e){setStatus('Gagal simpan '+key+': '+errMsg(e));setTimeout(()=>schedulePush(key,15000),100)}},ms)}
async function pullAll(){
  const rows=await fetchAll('app_data','key,version,updated_at,updated_by');
  const need=[],pphCloud=new Set();let changed=false;
  const hasPph=rows.some(r=>r.key.startsWith(PPH_PREFIX));
  for(const r of rows){
    if(r.key===PPH_LEGACY)continue;
    if(r.key.startsWith(PPH_PREFIX)){pphCloud.add(r.key.slice(PPH_PREFIX.length));const m=getMeta(r.key);if(!m||r.version>m.version)need.push(r);continue}
    if(!SYNC_KEYS.includes(r.key))continue;
    const m=getMeta(r.key);if(!m||r.version>m.version||localStorage.getItem(r.key)===null)need.push(r)
  }
  for(let i=0;i<need.length;i+=4){
    const ch=need.slice(i,i+4),r=await supa.from('app_data').select('key,value,version,updated_at').in('key',ch.map(x=>x.key));if(r.error)throw r.error;
    for(const row of r.data){
      if(row.key.startsWith(PPH_PREFIX)){const k=row.key.slice(PPH_PREFIX.length);await rawPut(PPH_DB,k,row.value);setMeta(row.key,{version:row.version,updated_at:row.updated_at});changed=true}
      else if(applyLsRow(row))changed=true
    }
  }
  // PPh: migrasi dari baris tunggal lama, lalu rekonsiliasi kunci lokal
  if(!hasPph){
    const lg=await supa.from('app_data').select('value').eq('key',PPH_LEGACY).maybeSingle();
    if(lg.data&&lg.data.value&&typeof lg.data.value==='object'){const lk=new Set(await rawKeys(PPH_DB));for(const k in lg.data.value)if(!PPH_SKIP.includes(k)&&!lk.has(k)){await rawPut(PPH_DB,k,lg.data.value[k]);changed=true}}
  }
  const kn=new Set(lsGet('opa_cloud_pphknown',[]));
  for(const k of await rawKeys(PPH_DB)){
    if(typeof k!=='string'||PPH_SKIP.includes(k)||pphCloud.has(k))continue;
    if(kn.has(k)&&hasPph){await rawDel(PPH_DB,k);kn.delete(k);changed=true}else PEND[PPH_DB+'::'+k]={db:PPH_DB,key:k,op:'put',ts:Date.now(),n:0}
  }
  for(const k of pphCloud)kn.add(k);lsSet('opa_cloud_pphknown',[...kn]);savePend();
  for(const k of SYNC_KEYS){const v=localStorage.getItem(k),m=getMeta(k);if(v!==null&&m&&m.h===hashStr(v))lastHashes[k]=m.h}
  return changed
}
function startWatch(){
  setInterval(()=>{
    if(!ME)return;
    for(const k of SYNC_KEYS){
      const v=localStorage.getItem(k);if(v===null)continue;
      const h=hashStr(v);
      if(lastHashes[k]!==h&&!pushTimers[k]){lastHashes[k]=undefined;log('Perubahan: '+k);schedulePush(k,1200)}
    }
  },1500)
}
function dirtyCount(){return Object.keys(pushTimers).length+Object.keys(PEND).length+GEN_Q.length}
let lastOk=0;
function refreshStatus(){
  const n=dirtyCount(),off=navigator.onLine===false;
  if(ME&&!n&&!off)lastOk=Date.now();
  setStatus(!ME?'Belum login':off?'Offline: '+n+' perubahan menunggu koneksi':n?'Menunggu simpan online ('+n+')...':'Sinkron ✓ semua tersimpan online');
  {const se=$('#supaSyncStatus');if(se)se.dataset.s=!ME?'idle':off?'off':n?'wait':'ok'}
  const b=document.getElementById('svb');if(!b||!ME)return;
  const sp=b.querySelector('span'),hm=new Date(lastOk||Date.now()).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  b.className='svb '+(off?'er':n?'wa':'ok');
  if(sp)sp.textContent=off?'Offline':n?'Menyimpan online…':'Online '+hm;
  b.title=off?'Tidak ada koneksi. Perubahan dikirim otomatis saat online.':'Klik untuk melihat Berkas Online. Ctrl+S = simpan sekarang.';
  b.onclick=openFiles
}
window.addEventListener('online',()=>{refreshStatus();if(ME){schedFlush(300);syncFiles(setStatus).catch(()=>{})}});
window.addEventListener('offline',refreshStatus);
setInterval(refreshStatus,5000);
window.addEventListener('beforeunload',e=>{if(ME&&dirtyCount()>0){e.preventDefault();e.returnValue=''}});

/* ---------- realtime ---------- */
function setupRealtime(){
  try{
    window._supaChannel=supa.channel('opa_cloud_v74')
      .on('postgres_changes',{event:'*',schema:'public',table:'app_data'},async p=>{
        const row=p.new;if(!row||!row.key)return;
        if(ME&&row.updated_by&&row.updated_by===ME.session.user.id)return;
        try{
          if(row.key.startsWith(PPH_PREFIX)){const r=await supa.from('app_data').select('key,value,version,updated_at').eq('key',row.key).maybeSingle();if(r.data){await rawPut(PPH_DB,row.key.slice(PPH_PREFIX.length),r.data.value);setMeta(row.key,{version:r.data.version,updated_at:r.data.updated_at});say('Data PPh 21 diperbarui dari perangkat lain',['Muat ulang',()=>window.reload&&window.reload()])}return}
          if(!SYNC_KEYS.includes(row.key))return;
          const r=await supa.from('app_data').select('key,value,version,updated_at').eq('key',row.key).maybeSingle();
          if(r.data&&applyLsRow(r.data)){say('Data diperbarui dari cloud',['Muat ulang',()=>window.reload&&window.reload()]);setTimeout(()=>{if(window.reload)window.reload()},1500)}
        }catch(e){log('realtime err '+errMsg(e))}
      })
      .on('postgres_changes',{event:'*',schema:'public',table:'app_files'},async p=>{
        const row=p.new;if(!row||!FILE_DBS.includes(row.store))return;
        if(ME&&row.updated_by&&row.updated_by===ME.session.user.id)return;
        try{if(row.deleted_at){const key=row.file_key.slice(row.store.length+2);await rawDel(row.store,key)}else await pullFile(row)}catch(e){log('realtime file err '+errMsg(e))}
      })
      .subscribe(s=>log('Realtime '+s))
  }catch(e){log('Realtime err '+errMsg(e))}
}

/* ---------- panel Berkas Online ---------- */
async function openFiles(){
  let ov=$('#opaFiles');if(ov)ov.remove();
  ov=document.createElement('div');ov.id='opaFiles';
  ov.className='opf';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Berkas Online');
  ov.innerHTML='<div class="opf-pn"><div class="opf-hd"><b>Berkas Online (Supabase)</b><select id="ofF" aria-label="Filter berkas"><option value="generated">Hasil generate</option><option value="att">Lampiran arsip</option><option value="all">Semua</option><option value="trash">Sampah (terhapus)</option></select><input id="ofQ" placeholder="Cari nama..." aria-label="Cari berkas"><button class="btn s" id="ofX">Tutup</button></div><div id="ofL" class="opf-bd" aria-live="polite"><div class="opf-st"><i class="opf-sp"></i>Memuat berkas...</div></div></div>';
  document.body.appendChild(ov);
  const close=()=>ov.remove();ov.querySelector('#ofX').onclick=close;ov.addEventListener('mousedown',e=>{if(e.target===ov)close()});
  const kb=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  async function load(){
    ov.querySelector('#ofL').innerHTML='<div class="opf-st"><i class="opf-sp"></i>Memuat berkas...</div>';
    const f=ov.querySelector('#ofF').value,q=ov.querySelector('#ofQ').value.trim().toLowerCase(),L=ov.querySelector('#ofL');
    let qq=supa.from('app_files').select('file_key,store,original_name,mime_type,size_bytes,storage_path,source,updated_at,deleted_at');
    qq=(f==='trash'?qq.not('deleted_at','is',null):qq.is('deleted_at',null)).order('updated_at',{ascending:false}).limit(300);
    if(f==='generated')qq=qq.eq('store','generated');else if(f==='att')qq=qq.in('store',FILE_DBS);
    const r=await qq;if(r.error){L.innerHTML='<div class="opf-st er"></div>';L.firstChild.textContent='Gagal memuat: '+errMsg(r.error);return}
    const rows=r.data.filter(x=>!q||String(x.original_name).toLowerCase().includes(q));
    L.innerHTML=rows.length?rows.map((x,i)=>'<div class="opf-row"><div class="opf-nm"><b>'+esc(x.original_name)+'</b><small>'+esc(x.source||x.store)+' · '+kb(x.size_bytes||0)+' · '+new Date(x.updated_at).toLocaleString('id-ID')+'</small></div><button class="btn s" data-i="'+i+'" data-a="dl">Unduh</button>'+(f==='trash'?'<button class="btn s" data-i="'+i+'" data-a="rs">Pulihkan</button><button class="btn s d" data-i="'+i+'" data-a="pm">Hapus permanen</button>':(x.store==='generated'?'<button class="btn s d" data-i="'+i+'" data-a="rm">Hapus</button>':''))+'</div>').join(''):'<div class="opf-st">'+(f==='trash'?'Sampah kosong. Berkas yang dihapus muncul di sini dan bisa dipulihkan.':'Belum ada berkas di kategori ini.')+'</div>';
    L.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const x=rows[+b.dataset.i];
      if(b.dataset.a==='dl'){const s=await supa.storage.from(BUCKET).createSignedUrl(x.storage_path,120,{download:x.original_name});if(s.error)return say('Gagal: '+errMsg(s.error));window.open(s.data.signedUrl,'_blank')}
      else if(b.dataset.a==='rs'){const u=await supa.from('app_files').update({deleted_at:null}).eq('file_key',x.file_key);if(u.error)return say('Gagal: '+errMsg(u.error));say('Berkas dipulihkan');syncFiles(setStatus).catch(()=>{});load()}
      else if(b.dataset.a==='pm'){if(!confirm('Hapus permanen '+x.original_name+'? Tidak bisa dibatalkan.'))return;const d1=await supa.storage.from(BUCKET).remove([x.storage_path]);if(d1.error)return say('Gagal: '+errMsg(d1.error));const d2=await supa.from('app_files').delete().eq('file_key',x.file_key);if(d2.error)return say('Gagal: '+errMsg(d2.error));load()}
      else if(b.dataset.a==='rm'){if(!confirm('Hapus '+x.original_name+' dari cloud?'))return;const u=await supa.from('app_files').update({deleted_at:new Date().toISOString()}).eq('file_key',x.file_key);if(u.error)return say('Gagal: '+errMsg(u.error));load()}}
  }
  ov.querySelector('#ofF').onchange=load;ov.querySelector('#ofQ').oninput=()=>{clearTimeout(ov._t);ov._t=setTimeout(load,250)};load()
}

/* ---------- retensi backup/ (maks. sekali per hari) ---------- */
const BK_KEEP=10,BK_DAYS=60;
/* ---------- objek yatim (ada di Storage, tidak ada di app_files); butuh opa_orphan_objects() dari supabase-setup.sql ---------- */
async function findOrphans(purge){
  if(!ME)return{error:'belum login'};
  const r=await supa.rpc('opa_orphan_objects',{min_age:'1 day'});
  if(r.error){say('Deteksi objek yatim gagal: '+errMsg(r.error));return{error:errMsg(r.error)}}
  const list=r.data||[],bytes=list.reduce((a,x)=>a+(Number(x.size_bytes)||0),0);
  if(!purge||!list.length)return{count:list.length,bytes,names:list.map(x=>x.name),removed:0};
  if(!confirm('Hapus permanen '+list.length+' objek yatim ('+Math.round(bytes/1024)+' KB) dari Storage?'))return{count:list.length,bytes,removed:0,cancelled:true};
  let removed=0;
  for(let i=0;i<list.length;i+=50){const part=list.slice(i,i+50).map(x=>x.name);const d=await supa.storage.from(BUCKET).remove(part);if(d.error){log('purge yatim gagal: '+errMsg(d.error));break}removed+=part.length}
  say('Objek yatim dihapus: '+removed);return{count:list.length,bytes,removed}
}
async function pruneBackups(force){
  if(!ME)return 0;
  const day=new Date().toISOString().slice(0,10);
  if(!force&&lsGet('opa_cloud_prune','')===day)return 0;
  const r=await supa.storage.from(BUCKET).list('backup',{limit:1000,sortBy:{column:'created_at',order:'desc'}});
  if(r.error||!r.data)throw (r.error||new Error('list backup gagal'));
  const g={},del=[],cut=Date.now()-BK_DAYS*864e5;
  for(const o of r.data){
    if(!o||!o.name||o.id===null)continue;
    const grp=o.name.replace(/-\d{10,}\.json$/,'');(g[grp]=g[grp]||[]).push(o)
  }
  for(const grp in g){
    g[grp].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
    g[grp].forEach((o,i)=>{if(i>=BK_KEEP||(i>=1&&new Date(o.created_at).getTime()<cut))del.push('backup/'+o.name)})
  }
  for(let i=0;i<del.length;i+=100){const d=await supa.storage.from(BUCKET).remove(del.slice(i,i+100));if(d.error)throw d.error}
  lsSet('opa_cloud_prune',day);log('Backup dibersihkan: '+del.length+' berkas');return del.length
}

/* ---------- Uji koneksi cloud (v87): cek login, database, folder cloud, realtime, sinkron ---------- */
async function selfTest(client,me){
  client=client||supa;me=me===undefined?ME:me;
  let ov=document.getElementById('opaUji');if(ov)ov.remove();
  ov=document.createElement('div');ov.id='opaUji';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
  ov.style.cssText='position:fixed;inset:0;z-index:120;background:#0008;display:grid;place-items:center;padding:16px';
  ov.innerHTML='<div style="background:var(--sf);color:var(--ink);border:1px solid var(--ln);border-radius:14px;width:min(660px,100%);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 20px 60px #0006"><div style="padding:16px 20px 10px"><b style="font-size:16px">Uji koneksi cloud</b><div style="color:var(--mu);font-size:12.5px;margin-top:3px">Mengecek login, database, folder cloud, dan sinkron. Data Anda tidak diubah; berkas uji dihapus otomatis.</div></div><div id="uji-l" style="padding:2px 20px 8px;overflow:auto;flex:1"></div><div style="display:flex;gap:8px;justify-content:flex-end;align-items:center;padding:12px 20px;border-top:1px solid var(--ln)"><span id="uji-s" style="flex:1;font-size:12.5px;color:var(--mu)">Menguji…</span><button class="btn" id="uji-c" disabled>Salin hasil</button><button class="btn p" id="uji-x">Tutup</button></div></div>';
  document.body.appendChild(ov);
  const close=()=>ov.remove();$('#uji-x').onclick=close;ov.addEventListener('mousedown',e=>{if(e.target===ov)close()});
  const onKey=e=>{if(e.key==='Escape'){close();document.removeEventListener('keydown',onKey)}};document.addEventListener('keydown',onKey);
  const list=$('#uji-l'),res=[],ICON={run:['…','var(--mu)'],ok:['✓','var(--g)'],bad:['✕','var(--r)'],warn:['!','var(--a)'],info:['i','var(--mu)']};
  const hint=m=>/does not exist|schema cache|Could not find/i.test(m)?'Tabel atau fungsi belum ada. Jalankan ulang supabase-setup.sql di SQL Editor Supabase.':/row-level security|permission denied|not allowed|violates/i.test(m)?'Ditolak oleh keamanan. Pastikan SQL sudah dijalankan dan akun Anda aktif (Table Editor → profiles → kolom aktif = true).':/Bucket not found/i.test(m)?'Folder cloud "arsip" belum ada. Jalankan ulang supabase-setup.sql.':/fetch|network|timeout/i.test(m)?'Internet atau alamat Supabase di config.js bermasalah.':'';
  function mk(label){const d=document.createElement('div');d.style.cssText='display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--ln)';d.innerHTML='<span class="ic" style="width:20px;font-weight:700;text-align:center"></span><div style="flex:1;min-width:0"><div class="lb" style="font-weight:600;font-size:13.5px"></div><div class="dt" style="font-size:12.5px;color:var(--mu);white-space:pre-wrap;overflow-wrap:anywhere"></div></div>';d.querySelector('.lb').textContent=label;list.appendChild(d);
    const set=(st,det,h)=>{const i=ICON[st];const ic=d.querySelector('.ic');ic.textContent=i[0];ic.style.color=i[1];d.querySelector('.dt').textContent=[det,h].filter(Boolean).join('\n');if(st!=='run')res.push({st,label,det:det||'',h:h||''})};set('run','');return set}
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const T1='__uji_koneksi',T2='__uji_realtime';let cloudRows=null;
  const checks=[
   ['Login dan profil',async()=>{if(!me||!me.session)return['bad','Belum login.','Keluar lalu login lagi.'];const p=me.profile||{};if(p.aktif===false)return['bad','Akun tidak aktif.','Aktifkan di Table Editor → profiles.'];return['ok','Login aktif, peran: '+(p.role||'-')]}],
   ['Baca database (app_data)',async()=>{const r=await client.from('app_data').select('key,version');if(r.error)throw r.error;cloudRows=(r.data||[]).filter(x=>x.key!==T1&&x.key!==T2);return['ok',cloudRows.length+' baris data di cloud']}],
   ['Tulis database dan nomor versi otomatis',async()=>{try{let r=await client.from('app_data').upsert({key:T1,value:{t:Date.now()}},{onConflict:'key'});if(r.error)throw r.error;r=await client.from('app_data').select('version').eq('key',T1).single();if(r.error)throw r.error;const v1=r.data.version;r=await client.from('app_data').update({value:{t:Date.now(),n:2}}).eq('key',T1);if(r.error)throw r.error;r=await client.from('app_data').select('version').eq('key',T1).single();if(r.error)throw r.error;const v2=r.data.version;if(v2!==v1+1)return['warn','Versi tidak naik otomatis ('+v1+' → '+v2+').','Jalankan ulang supabase-setup.sql (bagian trigger opa_touch). Tanpa ini, penggabungan dua admin kurang aman.'];return['ok','Tulis dan baca berhasil, versi naik '+v1+' → '+v2]}finally{await client.from('app_data').delete().in('key',[T1])}}],
   ['Tabel berkas (app_files)',async()=>{const r=await client.from('app_files').select('file_key',{count:'exact',head:true});if(r.error)throw r.error;return['ok',(r.count==null?'?':r.count)+' catatan berkas']}],
   ['Folder cloud "arsip" (Storage)',async()=>{const path='uji/tes-'+Date.now()+'.txt',isi='uji koneksi '+Date.now();try{let r=await client.storage.from(BUCKET).upload(path,new Blob([isi],{type:'text/plain'}),{contentType:'text/plain'});if(r.error)throw r.error;const d=await client.storage.from(BUCKET).download(path);if(d.error)throw d.error;const tx=await d.data.text();if(tx!==isi)return['bad','Isi berkas yang diunduh berbeda dari yang diunggah.'];return['ok','Unggah dan unduh berhasil']}finally{await client.storage.from(BUCKET).remove([path]).catch(()=>{})}}],
   ['Fungsi pembersih berkas yatim (RPC)',async()=>{const r=await client.rpc('opa_orphan_objects',{min_age:'1 day'});if(r.error)throw r.error;return['ok','Fungsi ada; '+((r.data||[]).length)+' berkas yatim']}],
   ['Realtime (perubahan langsung terlihat)',async()=>{let ch,got=false,subscribed=false;try{await new Promise(done=>{let fin=false;const end=()=>{if(!fin){fin=true;done()}};ch=client.channel('opa_uji_'+Date.now()).on('postgres_changes',{event:'*',schema:'public',table:'app_data'},p=>{const k=(p.new&&p.new.key)||(p.old&&p.old.key);if(k===T2){got=true;end()}}).subscribe(s=>{if(s==='SUBSCRIBED'&&!subscribed){subscribed=true;client.from('app_data').upsert({key:T2,value:{t:Date.now()}},{onConflict:'key'}).then(()=>{})}else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED')end()});setTimeout(end,9000)});
     if(got)return['ok','Perubahan diterima langsung'];if(subscribed)return['warn','Tersambung, tetapi perubahan tidak terdeteksi dalam 9 detik.','Sinkron antar perangkat tetap jalan lewat tombol Tarik atau buka ulang aplikasi. Cek Database → Replication: tabel app_data dan app_files harus aktif.'];return['warn','Tidak bisa tersambung ke Realtime.','Sinkron tetap jalan lewat tombol Tarik atau buka ulang aplikasi.']}finally{try{client.removeChannel(ch)}catch(e){}await client.from('app_data').delete().in('key',[T2])}}],
   ['Data perangkat ini dibanding cloud',async()=>{if(!cloudRows)return['info','Dilewati karena database belum bisa dibaca.'];const cl=new Set(cloudRows.map(x=>x.key)),loc=SYNC_KEYS.filter(k=>localStorage.getItem(k)!==null),miss=loc.filter(k=>!cl.has(k)),pph=cloudRows.filter(x=>x.key.startsWith(PPH_PREFIX)).length;const det=loc.length+' kunci data di perangkat · '+cloudRows.length+' baris di cloud (termasuk '+pph+' data PPh 21)';if(miss.length)return['warn',det+'\nBelum ada di cloud: '+miss.join(', '),'Klik ⋯ → Simpan untuk mengunggah.'];return['ok',det+'. Semua data perangkat sudah ada di cloud.']}],
   ['Pendaftaran bebas harus dimatikan',async()=>['info','Tidak bisa dicek dari aplikasi.','Cek manual: Supabase → Authentication → Sign In / Providers → "Allow new users to sign up" harus mati.']]
  ];
  for(const[label,fn]of checks){const set=mk(label);try{const r=await fn();set(r[0],r[1],r[2])}catch(e){const m=errMsg(e);set('bad',m,hint(m))}}
  const n=k=>res.filter(x=>x.st===k).length;
  $('#uji-s').textContent=n('ok')+' lulus · '+n('bad')+' gagal · '+n('warn')+' peringatan'+(n('bad')?'. Ada yang perlu diperbaiki.':n('warn')?'. Cek peringatan di atas.':'. Semua baik.');
  const cb=$('#uji-c');cb.disabled=false;cb.onclick=async()=>{const tx='Uji koneksi cloud '+new Date().toLocaleString('id-ID')+'\n'+res.map(x=>({ok:'[LULUS] ',bad:'[GAGAL] ',warn:'[PERINGATAN] ',info:'[INFO] '}[x.st])+x.label+(x.det?' - '+x.det.replace(/\n/g,' | '):'')+(x.h?' | Saran: '+x.h:'')).join('\n');try{await navigator.clipboard.writeText(tx);cb.textContent='Tersalin ✓'}catch(e){const ta=document.createElement('textarea');ta.value=tx;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');cb.textContent='Tersalin ✓'}catch(x){cb.textContent='Gagal menyalin'}ta.remove()}};
  return res
}

/* ---------- UI sidebar + login ---------- */
function ensureUserBar(){
  if($('#supaUserBar'))return;
  const fb=document.querySelector('#fb'),dm=document.querySelector('#dmc');if(!fb||!dm)return;
  const bar=document.createElement('div');bar.id='supaUserBar';bar.className='sbu';
  bar.innerHTML='<span class=\"uc-av\" id=\"supaAv\">HR</span><div id=\"supaSyncStatus\" class=\"uc-st\" data-s=\"idle\">Menunggu login...</div>';
  fb.insertBefore(bar,fb.firstChild);
  dm.innerHTML='<div class=\"dmh\"><b id=\"supaUserEmail\"></b><small id=\"supaUserRole\"></small></div><div class="dmg">Online</div><div class="uc-act"><button id="supaFilesBtn" title="Berkas Online" aria-label="Berkas Online"><svg class="i" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><span>Berkas</span></button><button id="supaPushBtn" title="Simpan semua ke cloud" aria-label="Simpan semua ke cloud"><svg class="i" viewBox="0 0 24 24"><path d="M12 16V9m0 0-3 3m3-3 3 3"/><path d="M7 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 10a4 4 0 0 1 0 8"/></svg><span>Simpan</span></button><button id="supaPullBtn" title="Tarik data dari cloud" aria-label="Tarik data dari cloud"><svg class="i" viewBox="0 0 24 24"><path d="M12 4v10m0 0-3-3m3 3 3-3"/><path d="M5 19h14"/></svg><span>Tarik</span></button><button id="supaLogoutBtn" class="out" title="Keluar" aria-label="Keluar"><svg class="i" viewBox="0 0 24 24"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/></svg><span>Keluar</span></button></div><div id=\"supaDebug\"></div>';
  {const tb=document.createElement('button');tb.id='supaTestBtn';tb.title='Uji koneksi cloud';tb.setAttribute('aria-label','Uji koneksi cloud');tb.innerHTML='<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg><span>Uji koneksi</span>';$('#supaPullBtn').after(tb);tb.onclick=()=>selfTest()}
  document.getElementById('dm').appendChild($('#supaLogoutBtn'));
  $('#supaFilesBtn').onclick=openFiles;
  $('#supaPushBtn').onclick=syncNow;
  $('#supaPullBtn').onclick=async()=>{try{setStatus('Menarik dari cloud...');const c=await pullAll();const n=await syncFiles(setStatus);refreshStatus();if(c||n){say('Data dari cloud diterapkan');if(window.reload)window.reload()}else say('Sudah sama dengan cloud')}catch(e){setStatus('Gagal tarik: '+errMsg(e))}};
  $('#supaLogoutBtn').onclick=async()=>{try{if(dirtyCount()){setStatus('Menyimpan sebelum keluar...');for(const k of SYNC_KEYS)if(localStorage.getItem(k)!==null&&lastHashes[k]!==hashStr(localStorage.getItem(k)))await pushKey(k).catch(()=>{});await flush()}}catch(e){}await supa.auth.signOut();location.reload()}
}
async function syncNow(){if(!ME)return;try{setStatus('Menyimpan semua...');for(const k of SYNC_KEYS)if(localStorage.getItem(k)!==null)await pushKey(k);await syncFiles(setStatus);await flush();refreshStatus();say('Semua data & berkas tersimpan online')}catch(e){setStatus('Gagal: '+errMsg(e));refreshStatus()}}
function showLogin(){const l=$('#supaLogin');if(l)l.classList.add('on')}
async function loadProfile(session){
  const r=await supa.from('profiles').select('*').eq('id',session.user.id).single();
  if(r.error||!r.data){loginMsg('Profil tidak ditemukan: '+errMsg(r.error));showLogin();return null}
  if(!r.data.aktif){loginMsg('Akun tidak aktif.');await supa.auth.signOut();showLogin();return null}
  return r.data
}
let booted=false;
async function afterLogin(session){
  if(booted)return;
  let profile;
  try{profile=await loadProfile(session)}catch(e){loginMsg('Tidak bisa terhubung ke Supabase: '+errMsg(e));showLogin();return}
  if(!profile)return;
  booted=true;ME={session,profile};
  const l=$('#supaLogin');if(l)l.classList.remove('on');
  ensureUserBar();$('#supaUserEmail').textContent=profile.nama||profile.email||session.user.email;$('#supaUserRole').textContent=(profile.role||'')+(profile.nama&&profile.email?' · '+profile.email:'');{const av=$('#supaAv');if(av){const w=String(profile.nama||profile.email||'HR').replace(/@.*/,'').split(/[\s._-]+/).filter(Boolean);av.textContent=((w[0]||'H')[0]+(w[1]?w[1][0]:(w[0]||'R')[1]||'')).toUpperCase()}}
  setStatus('Menyinkronkan data...');
  try{await pullAll()}catch(e){setStatus('Gagal tarik data: '+errMsg(e));say('⚠ Gagal tarik data cloud, memakai cache perangkat')}
  const fp=syncFiles(setStatus).catch(e=>log('syncFiles err '+errMsg(e)));
  await Promise.race([fp,sleep(8000)]);
  window.OPA_GATE_OPEN&&window.OPA_GATE_OPEN();
  startWatch();setupRealtime();refreshStatus();schedFlush(500);
  fp.then(()=>refreshStatus());
  setTimeout(()=>{pruneBackups().catch(e=>log('prune err '+errMsg(e)))},20000)
}
window.OPACloud={idbNote,uploadGenerated,openFiles,flush,syncNow,supa,SYNC_KEYS,pruneBackups,findOrphans,selfTest};
window.supaPushAll=()=>{const b=$('#supaPushBtn');b&&b.click()};window.supaSyncPull=()=>{const b=$('#supaPullBtn');b&&b.click()};

const btn=$('#supaLoginBtn');
if(btn){
  btn.onclick=async()=>{
    const email=$('#supaEmail').value.trim(),pass=$('#supaPass').value;
    if(!email||!pass){loginMsg('Isi email dan password');return}
    btn.disabled=true;loginMsg('Memeriksa...');
    try{const r=await supa.auth.signInWithPassword({email,password:pass});if(r.error)throw r.error;loginMsg('Berhasil, memuat data...');await afterLogin(r.data.session)}
    catch(e){loginMsg('Gagal: '+errMsg(e))}
    btn.disabled=false
  };
  $('#supaPass').addEventListener('keydown',e=>{if(e.key==='Enter')btn.click()})
}
supa.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'&&booted)location.reload()});
(async()=>{
  ensureUserBar();
  try{const r=await supa.auth.getSession();if(r.data&&r.data.session)await afterLogin(r.data.session);else{showLogin();setStatus('Belum login')}}
  catch(e){loginMsg('Gagal memeriksa sesi: '+errMsg(e));showLogin()}
})();
})();

