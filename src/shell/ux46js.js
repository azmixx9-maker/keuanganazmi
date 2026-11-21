
(function(){
const SUP=false,PFX='OPA-HR-Suite-',KEEP=14;
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('opa-ux-fs',1);r.onupgradeneeded=()=>r.result.createObjectStore('h');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const hget=async()=>{try{const d=await idb();return await new Promise(r=>{const q=d.transaction('h').objectStore('h').get('dir');q.onsuccess=()=>r(q.result||null);q.onerror=()=>r(null)})}catch(e){return null}};
const hset=async v=>{const d=await idb();return new Promise((res,rej)=>{const t=d.transaction('h','readwrite');v?t.objectStore('h').put(v,'dir'):t.objectStore('h').delete('dir');t.oncomplete=res;t.onerror=()=>rej(t.error)})};
let dir=null,state='off',last=+localStorage.getItem('opa-ux-lastsave')||0,err='',busy=false,sig='',pers=null,tried=false;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hhmm=t=>new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'});
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta'}).format(new Date());
async function perm(ask){if(!dir)return false;const o={mode:'readwrite'};let p=await dir.queryPermission(o);if(p==='granted')return true;if(ask){p=await dir.requestPermission(o);return p==='granted'}return false}
const isEmpty=()=>{const s0=S0();return !(s0.con||[]).length&&!(s0.cand||[]).length};
function sigOf(){const s=JSON.stringify(snapshot().data);let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return s.length+':'+h}
async function build(){const sn=snapshot();sn.v=2;['opa-pic-letters','opa-arch-queue'].forEach(k=>{const v=localStorage.getItem(k);if(v!==null)sn.data[k]=v});sn.idb=await idbDump();sn.cd=await cdDump();const pp=await pphDump();if(pp)sn.pph=pp;return sn}
async function files(){const a=[];for await(const [n,h] of dir.entries()){if(/^OPA-HR-Suite-\d{4}-\d{2}-\d{2}\.json$/.test(n))a.push({n,h})}return a.sort((x,y)=>y.n.localeCompare(x.n))}
async function save(force){if(busy||!dir)return false;try{if(!await perm(false)){state='need';draw();return false}}catch(e){state='need';draw();return false}
 if(isEmpty()){if(!force)return false;if(!await opaConfirm('Data aplikasi masih kosong. Menyimpan sekarang akan menimpa cadangan hari ini di folder. Lanjutkan?'))return false}
 const s0=sigOf();if(!force&&s0===sig&&Date.now()-last<9e5)return false;
 busy=true;draw();let ok=false;
 try{const sn=await build(),fh=await dir.getFileHandle(PFX+today()+'.json',{create:true}),w=await fh.createWritable();await w.write(JSON.stringify(sn));await w.close();sig=s0;last=Date.now();localStorage.setItem('opa-ux-lastsave',last);localStorage.setItem('opa-suite-lastbackup',last);try{dsig=''}catch(e){}state='ok';err='';ok=true;
  try{(await files()).slice(KEEP).forEach(f=>dir.removeEntry(f.n).catch(()=>{}))}catch(e){}}
 catch(e){state='err';err=e.message||String(e)}
 busy=false;draw();return ok}
async function pick(){try{const h=await showDirectoryPicker({id:'opa-hr-suite',mode:'readwrite'});dir=h;await hset(h);state='ok';await save(true);if(state==='ok')toast('Simpan otomatis aktif ke folder "'+h.name+'"')}catch(e){if(e.name!=='AbortError'){state='err';err=e.message;draw()}}}
async function restoreLatest(){let L=null;try{L=dir&&await perm(false)?(await files())[0]:null}catch(e){}if(!L)return toast('Belum ada berkas cadangan di folder ini');const inp=document.getElementById('rst'),dt=new DataTransfer();dt.items.add(await L.h.getFile());inp.files=dt.files;inp.dispatchEvent(new Event('change'))}
function draw(){const b=document.getElementById('svb');if(!b)return;const m={ok:['ok','Tersimpan '+(last?hhmm(last):'')],need:['wa','Aktifkan simpan otomatis'],off:['wa',SUP?'Atur simpan otomatis':'Unduh cadangan'],err:['er','Gagal menyimpan']};let [c,t]=m[state];if(busy){c='wa';t='Menyimpan…'}b.className='svb '+c+(state==='off'&&!busy?' q':'');b.querySelector('span').textContent=t;b.title=(err?err+' · ':'')+'Menu simpan (Ctrl+S)'}
function dlg(){if(document.getElementById('px-ov'))return;const ov=document.createElement('div');ov.id='px-ov';ov.className='t';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.tabIndex=-1;document.body.appendChild(ov);ov.focus();
 const close=()=>ov.remove();
 const view=async()=>{try{pers=navigator.storage&&navigator.storage.persisted?await navigator.storage.persisted():null}catch(e){}
  const L=dir&&state!=='need'?(await files().catch(()=>[])):[];
  ov.innerHTML='<div class="bx"><h3>Simpan data</h3>'+(SUP?(dir?'<dl><dt>Folder</dt><dd>'+esc(dir.name)+'</dd><dt>Status</dt><dd>'+(state==='ok'?'Aktif, terakhir '+(last?hhmm(last):'-'):state==='need'?'Perlu izin folder':state==='err'?'Gagal: '+esc(err):'Menyiapkan')+'</dd><dt>Cadangan</dt><dd>'+L.length+' berkas (disimpan '+KEEP+' hari)</dd><dt>Browser</dt><dd>'+(pers===true?'Penyimpanan permanen':'Penyimpanan standar')+'</dd></dl><p>Data otomatis disalin ke folder tiap 3 menit bila ada perubahan, dan saat tab ditutup.</p>':'<p>Pilih satu folder (disarankan yang tersinkron ke OneDrive atau Google Drive). Data otomatis disalin ke sana, sehingga tetap ada walau data browser terhapus.</p>'):'<p>Browser ini belum mendukung simpan otomatis ke folder. Gunakan Chrome atau Edge. Sementara, unduh cadangan secara berkala.</p>')
  +'<div class="px-g">'+(SUP?(dir?(state==='need'?'<button class="pri" data-a="perm">Aktifkan izin folder</button>':'<button class="pri" data-a="now">Simpan sekarang</button>')+'<button data-a="rest">Pulihkan dari cadangan terbaru</button><button data-a="pick">Ganti folder</button>':'<button class="pri" data-a="pick">Pilih folder simpan</button>'):'')+'<button data-a="dl">Unduh cadangan (.json)</button><button data-a="x">Tutup</button>'+(dir?'<button class="lk" data-a="stop">Hentikan simpan otomatis</button>':'')+'</div></div>'};
 ov.addEventListener('click',async e=>{if(e.target===ov)return close();const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
  if(a==='x')close();else if(a==='pick'){await pick();view()}
  else if(a==='perm'){try{if(await perm(true)){state='ok';await save(true)}}catch(x){}draw();view()}
  else if(a==='now'){const ok=await save(true);view();if(ok)toast('Data disimpan ke folder "'+dir.name+'" pukul '+hhmm(last))}
  else if(a==='rest'){close();restoreLatest()}
  else if(a==='stop'){await hset(null);dir=null;state='off';draw();view()}
  else if(a==='dl'){close();backupAll()}});
 ov.addEventListener('keydown',e=>{if(e.key==='Escape')close()});view()}
async function manual(){if(window.OPACloud&&window.OPACloud.syncNow){window.OPACloud.syncNow();return}if(SUP&&dir&&state!=='need'){const ok=await save(true);if(ok)toast('Data disimpan ke folder "'+dir.name+'" pukul '+hhmm(last));else if(state==='err')dlg()}else dlg()}
async function autoPerm(){if(state!=='need'||tried||!dir)return;let ok;try{ok=await perm(true)}catch(e){return}tried=true;if(ok){state='ok';save(true)}draw()}
const key=e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()==='s'){e.preventDefault();manual()}};
document.addEventListener('keydown',key);document.addEventListener('click',autoPerm,true);
setInterval(()=>{document.querySelectorAll('iframe').forEach(f=>{try{const d=f.contentDocument;if(d&&!d.__sv){d.__sv=1;d.addEventListener('keydown',key);d.addEventListener('click',autoPerm,true)}}catch(x){}})},1500);
const b=document.createElement('button');b.id='svb';b.className='svb wa';b.innerHTML='<i></i><span></span>';b.onclick=async()=>{if(state==='need'){await autoPerm();if(state==='ok')return}dlg()};
const ref=document.getElementById('hlpb')||document.getElementById('thm');if(ref)ref.before(b);
setInterval(()=>save(false),180000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save(false)});window.addEventListener('pagehide',()=>{save(false)});
(async()=>{try{navigator.storage&&navigator.storage.persist&&await navigator.storage.persist()}catch(e){}
 if(SUP){dir=await hget();if(dir){try{state=(await perm(false))?'ok':'need'}catch(e){state='need'}}}draw();
 const t=setInterval(async()=>{if(!ready.every(Boolean))return;clearInterval(t);if(state!=='ok')return;
  if(isEmpty()){try{const L=(await files())[0];if(L&&await opaConfirm('Data aplikasi masih kosong, tetapi ada cadangan "'+L.n+'" di folder simpan. Pulihkan sekarang?'))return restoreLatest()}catch(e){}}
  save(false)},1000)})();
})();
