
/* v75: interaksi kecil untuk login (tampilkan kata sandi) */
(function(){var b=document.getElementById('supaPw'),i=document.getElementById('supaPass');if(!b||!i)return;
b.addEventListener('click',function(){var s=i.type==='password';i.type=s?'text':'password';b.setAttribute('aria-label',s?'Sembunyikan kata sandi':'Tampilkan kata sandi');b.setAttribute('aria-pressed',s?'true':'false');i.focus()})})();

/* v76: toast bertipe (sukses/peringatan/galat/info) dengan ikon + tombol aksi seragam; menggantikan toast() lama */
(function(){
var IC={ok:'✓',wa:'!',er:'✕',info:'i'};
function kind(m){m=String(m||'');
 if(/^(gagal|galat|error|tidak (bisa|dapat|valid)|ditolak|dibatalkan)/i.test(m))return'er';
 if(/(peringatan|perhatian|belum |hati-hati|bentrok|lebih baru|konflik|kedaluwarsa)/i.test(m))return'wa';
 if(/(tersimpan|berhasil|dipulihkan|dihapus|disalin|terkirim|dimuat|selesai|ditambah|diperbarui|dikirim|diunduh)/i.test(m))return'ok';
 return'info'}
window.toast=function(m,act,type){
 var t=document.getElementById('tst');
 if(!t){t=document.createElement('div');t.id='tst';t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);padding:10px 16px;border-radius:10px;font-size:13px;font-weight:500;z-index:90;display:flex;align-items:center';document.body.appendChild(t)}
 var k=type||kind(m);t.dataset.k=k;t.setAttribute('role',k==='er'?'alert':'status');t.setAttribute('aria-live',k==='er'?'assertive':'polite');
 t.textContent='';var i=document.createElement('span');i.className='ti';i.setAttribute('aria-hidden','true');i.textContent=IC[k];
 var s=document.createElement('span');s.className='tm';s.textContent=String(m);t.appendChild(i);t.appendChild(s);
 if(act){var b=document.createElement('button');b.textContent=act[0];b.onclick=function(){t.style.display='none';act[1]()};t.appendChild(b)}
 t.style.display='flex';t.style.animation='none';void t.offsetWidth;t.style.animation='';
 clearTimeout(t._t);t._t=setTimeout(function(){t.style.display='none'},act?6000:(k==='er'?4600:2800))};
})();

/* v76: petunjuk pintasan di palet perintah */
(function(){var p=document.querySelector('#sov .pn');if(!p||p.querySelector('.kbh'))return;
var d=document.createElement('div');d.className='kbh';d.innerHTML='<span><kbd>↑</kbd><kbd>↓</kbd>pilih</span><span><kbd>Enter</kbd>buka</span><span><kbd>Esc</kbd>tutup</span><span><kbd>/</kbd>cari di halaman</span>';p.appendChild(d)})();

/* v77: gambar profil/logo aplikasi (bisa diganti pengguna; disimpan di perangkat) */
(function(){
var KEY='opa_logo',SEL='.hm .mark,.brand .mark,#supaAv,.hm .pr,#supaLogin .lg-side .mark,.lk .card .mark';
function get(){try{return localStorage.getItem(KEY)||''}catch(e){return''}}
function put(v){try{v?localStorage.setItem(KEY,v):localStorage.removeItem(KEY)}catch(e){return false}return true}
function apply(){var v=get(),r=document.documentElement;
 if(v){r.style.setProperty('--opa-logo','url("'+v+'")');r.classList.add('has-logo')}else{r.style.removeProperty('--opa-logo');r.classList.remove('has-logo')}
 var ic=document.querySelector('link[rel~=icon]');if(v){if(!ic){ic=document.createElement('link');ic.rel='icon';document.head.appendChild(ic)}ic.href=v}
 document.querySelectorAll(SEL).forEach(function(e){if(e.dataset.lgz)return;e.dataset.lgz='1';e.setAttribute('role','button');e.setAttribute('tabindex','0');e.setAttribute('title','Ganti gambar profil');e.setAttribute('aria-label','Ganti gambar profil')})}
var q=0;new MutationObserver(function(){cancelAnimationFrame(q);q=requestAnimationFrame(apply)}).observe(document.body,{childList:true,subtree:true});apply();
function crop(file,cb){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=256;
 c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);cb(c.toDataURL('image/webp',.9)||c.toDataURL('image/png'))};im.onerror=function(){cb('')};im.src=fr.result};fr.onerror=function(){cb('')};fr.readAsDataURL(file)}
function dlg(){var o=document.getElementById('lgm');if(o)o.remove();
 o=document.createElement('div');o.id='lgm';o.className='opf';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Gambar profil');
 o.innerHTML='<div class="opf-pn lgm-pn"><div class="opf-hd"><b>Gambar profil</b><button class="btn s" id="lgX">Tutup</button></div><div class="lgm-bd"><div class="lgm-pv" id="lgPv">OPA</div><p>Gambar dipotong persegi dan tampil bulat di logo, avatar, dan ikon tab. Disimpan di perangkat ini.</p><div class="lgm-ac"><label class="btn p" for="lgF" tabindex="0">Pilih gambar</label><input type="file" id="lgF" accept="image/*" hidden><button class="btn s d" id="lgD">Hapus gambar</button></div><div class="lgm-er" id="lgE"></div></div></div>';
 document.body.appendChild(o);var pv=o.querySelector('#lgPv'),er=o.querySelector('#lgE');
 function show(){var v=get();pv.style.backgroundImage=v?'url("'+v+'")':'';pv.textContent=v?'':'OPA';o.querySelector('#lgD').disabled=!v}show();
 var close=function(){o.remove()};o.querySelector('#lgX').onclick=close;o.addEventListener('mousedown',function(e){if(e.target===o)close()});
 o.addEventListener('keydown',function(e){if(e.key==='Escape'){e.stopPropagation();close()}});
 o.querySelector('#lgF').onchange=function(e){var f=e.target.files[0];if(!f)return;er.textContent='';
  if(!/^image\//.test(f.type)){er.textContent='Berkas harus berupa gambar.';return}
  crop(f,function(d){if(!d){er.textContent='Gambar tidak bisa dibaca.';return}if(!put(d)){er.textContent='Penyimpanan perangkat penuh.';return}apply();show();window.toast&&window.toast('Gambar profil disimpan')})};
 o.querySelector('#lgD').onclick=function(){put('');apply();show();window.toast&&window.toast('Gambar profil dihapus')};
 o.querySelector('label[for=lgF]').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();o.querySelector('#lgF').click()}});
 o.querySelector('label[for=lgF]').focus()}
document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest(SEL)&&!e.target.closest('#lgm')){e.preventDefault();dlg()}},true);
document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches(SEL)){e.preventDefault();dlg()}});
window.OPALogo={open:dlg,get:get};
})();

