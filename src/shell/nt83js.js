
/* v83: Catatan + Pengingat + popup "yang perlu dikerjakan" setiap aplikasi dibuka.
   Data: localStorage 'opa-notes' dan 'opa-reminders' (array objek ber-id, ikut sinkron Supabase + cadangan). */
(function(){
'use strict';
var el=document.getElementById('ntv');if(!el)return;
var NK='opa-notes',RK='opa-reminders';
var CAT={kerja:['Pekerjaan','--m2'],catatan:['Catatan','--m4'],penting:['Penting','--r'],lain:['Lainnya','--mu']};
var REP={'':'Tidak berulang',h:'Setiap hari',m:'Setiap minggu',b:'Setiap bulan',y:'Setiap tahun'};
var st={tab:'notes',cat:'',q:'',showDone:false},mo=null,popAuto=[];
var CK='<svg class="i" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
var PIN='<svg class="i npin" viewBox="0 0 24 24"><path d="M12 17v5M9 3h6l-1 6 4 4v2H6v-2l4-4z"/></svg>';
var BELL='<svg class="i" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
var NOTE='<svg class="i" viewBox="0 0 24 24"><path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4M8 9h8M8 13h5"/></svg>';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function q1(s,r){return(r||document).querySelector(s)}
function pad(n){return n<10?'0'+n:''+n}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function tst(m,a){try{toast(m,a)}catch(e){}}
function load(k){try{var v=JSON.parse(localStorage.getItem(k));return Array.isArray(v)?v:[]}catch(e){return[]}}
function save(k,a){try{localStorage.setItem(k,JSON.stringify(a));return true}catch(e){tst('Gagal menyimpan. Penyimpanan peramban mungkin penuh.');return false}}
function opt(k,d){try{var v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}}

/* ---------- tanggal (zona WIB, sama dengan Daily Activity) ---------- */
function today(){return wibD(new Date())}
function shift(d,n){return dlyShift(d,n)}
function diff(d){return Math.round((Date.parse(d+'T12:00:00+07:00')-Date.parse(today()+'T12:00:00+07:00'))/864e5)}
function fmtD(d){return new Date(d+'T12:00:00+07:00').toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Jakarta'})}
function fmtTs(t){return new Date(t).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Jakarta'})}
function dueLabel(r){var n=diff(r.d),t=r.tm?' \u00b7 '+r.tm.replace(':','.'):'';return n<0?'Terlewat '+(-n)+' hari':n===0?'Hari ini'+t:n===1?'Besok'+t:n<=6?n+' hari lagi':fmtD(r.d)}
function addMonths(d,n,dom){var p=d.split('-').map(Number),y=p[0],m=p[1]-1+n;y+=Math.floor(m/12);m=((m%12)+12)%12;var dim=new Date(Date.UTC(y,m+1,0)).getUTCDate();return y+'-'+pad(m+1)+'-'+pad(Math.min(dom||p[2],dim))}
function step(r,d){return r.rep==='h'?shift(d,1):r.rep==='m'?shift(d,7):r.rep==='b'?addMonths(d,1,r.dom):addMonths(d,12,r.dom)}
function nextDue(r){var d=r.d,n=0;do{d=step(r,d);n++}while(d<=today()&&n<800);return d}
function cmpR(a,b){return a.d<b.d?-1:a.d>b.d?1:(a.tm||'99')<(b.tm||'99')?-1:(a.tm||'99')>(b.tm||'99')?1:0}

/* ---------- pengingat: logika ---------- */
function due(){var t=today(),lim=shift(t,3),act=load(RK).filter(function(x){return !x.done}).sort(cmpR);
  return{od:act.filter(function(x){return x.d<t}),td:act.filter(function(x){return x.d===t}),soon:act.filter(function(x){return x.d>t&&x.d<=lim}),all:act}}
function complete(id){var a=load(RK),r=a.filter(function(x){return x.id===id})[0];if(!r)return;
  if(r.rep){r.last=today();r.d=nextDue(r);tst('Selesai. Pengingat berikutnya: '+fmtD(r.d))}else{r.done=1;r.dts=Date.now()}save(RK,a)}
function undone(id){var a=load(RK),r=a.filter(function(x){return x.id===id})[0];if(!r)return;r.done=0;delete r.dts;save(RK,a)}
function postpone(id){var a=load(RK),r=a.filter(function(x){return x.id===id})[0];if(!r)return;r.d=r.d<=today()?shift(today(),1):shift(r.d,1);save(RK,a);tst('Ditunda ke '+fmtD(r.d))}
function remRemove(id){var a=load(RK),r=a.filter(function(x){return x.id===id})[0];if(!r)return;save(RK,a.filter(function(x){return x.id!==id}));
  tst('Pengingat dihapus',['Urungkan',function(){var b=load(RK);b.push(r);save(RK,b);after()}])}

/* ---------- info otomatis dari aplikasi ---------- */
function auto(){
  if(opt('opa-rm-auto','1')==='0')return[];
  var A=[];try{
    if(typeof ready==='undefined'||!ready.every(Boolean))return[];
    var d=data(),ps=pphStat(),add=function(n,t,m,k,tone){if(n>0)A.push({n:n,t:t,m:m,k:k,tone:tone||'w'})};
    add(d.soon.length,d.soon.length+' kontrak segera berakhir atau sudah berakhir',0,'alert');
    add(d.ttd.length,d.ttd.length+' kontrak menunggu tanda tangan',0,'list');
    add(d.nc.length,d.nc.length+' kasus No Clock belum selesai',1,'noclock');
    add(d.lt.length,d.lt.length+' kasus keterlambatan belum selesai',1,'terlambat');
    add(d.fu,d.fu+' surat masuk perlu ditindaklanjuti',2,'in');
    add(d.rv,d.rv+' surat keluar belum selesai',2,'out');
    add(ps.m.nik,ps.m.nik+' therapist dengan NIK bermasalah',3,'m');
    add(ps.pend,ps.pend+' therapist belum dibuat BP21',3,'p');
    add(ps.bad,ps.bad+' file BP21 belum berhasil di Coretax',3,'a');
    add(d.cand.length,d.cand.length+' kandidat rekrutmen sedang diproses',0,'rck','i');
    var lb=+localStorage.getItem('opa-suite-lastbackup')||0,days=lb?Math.floor((Date.now()-lb)/864e5):null;
    if(days===null||days>=7)A.push({n:1,t:days===null?'Data belum pernah dicadangkan':'Terakhir dicadangkan '+days+' hari lalu',act:'bk',tone:'i'});
  }catch(e){}
  return A}

/* ---------- badge lonceng ---------- */
function badge(){var b=q1('#rmb .rmn');if(!b)return;var R=due(),n=R.od.length+R.td.length+auto().length;b.textContent=n>99?'99+':n;b.hidden=!n}

/* ---------- modal ---------- */
function mClose(){if(mo){mo.remove();mo=null}}
function mOpen(html,pop){mClose();mo=document.createElement('div');mo.className='ntm';if(pop)mo.dataset.pop='1';
  mo.innerHTML='<div class="ntp" role="dialog" aria-modal="true">'+html+'</div>';document.body.appendChild(mo);
  mo.addEventListener('mousedown',function(e){if(e.target===mo)mClose()});mo.addEventListener('click',onClick);
  var f=q1('input[type=text],textarea',mo);if(f&&!pop)setTimeout(function(){f.focus()},30)}

/* ---------- popup pengingat ---------- */
function remRow(r,slim){var n=diff(r.d),cls=n<0?'od':n===0?'td':'';
  return '<div class="rrow"><button class="rck" data-a="rdone" data-id="'+r.id+'" aria-label="Tandai selesai" title="Tandai selesai">'+CK+'</button><div class="rm"><b>'+esc(r.t)+'</b>'+(r.n?'<small>'+esc(r.n)+'</small>':'')+'</div>'+
  (r.rep?'<span class="rchip">'+REP[r.rep]+'</span>':'')+'<span class="due '+cls+'">'+dueLabel(r)+'</span><span class="racts"><button data-a="rsnz" data-id="'+r.id+'" title="Tunda sampai besok">Besok</button>'+(slim?'':'<button data-a="redit" data-id="'+r.id+'">Ubah</button><button data-a="rdel" data-id="'+r.id+'">Hapus</button>')+'</span></div>'}
function popHtml(){var R=due(),A=auto();popAuto=A;var L=R.od.concat(R.td,R.soon),total=L.length+A.length,hr=new Date().getHours(),sal=hr<11?'Selamat pagi':hr<15?'Selamat siang':hr<19?'Selamat sore':'Selamat malam',nm=(typeof USER!=='undefined'&&USER.nama)||'HR Admin';
  var h='<div class="pph"><div><small>'+esc(dlyLong(today()))+'</small><h3>'+sal+', '+esc(nm)+'</h3><p>'+(total?'Ada '+total+' hal yang perlu Anda cek atau kerjakan.':'Tidak ada pengingat saat ini. Semua beres.')+'</p></div><button class="nx" data-a="mclose" aria-label="Tutup">\u00d7</button></div><div class="ppb">';
  if(L.length){h+='<div class="pps"><h4>Pengingat Anda <i>'+L.length+'</i></h4>'+L.slice(0,8).map(function(r){return remRow(r,true)}).join('')+(L.length>8?'<p class="pmore">dan '+(L.length-8)+' lainnya. <a href="#" data-a="popopen">Lihat semua</a></p>':'')+'</div>'}
  if(A.length){h+='<div class="pps"><h4>Perlu dicek di aplikasi <i>'+A.length+'</i></h4>'+A.map(function(x,i){return '<div class="rrow au"><span class="adot '+x.tone+'"></span><div class="rm"><b>'+esc(x.t)+'</b></div><button class="nbt" data-a="aopen" data-i="'+i+'">'+(x.act==='bk'?'Cadangkan':'Buka')+'</button></div>'}).join('')+'</div>'}
  if(!total)h+='<div class="em">Tambahkan pengingat di menu <b>Catatan &amp; Pengingat</b> agar muncul di sini setiap aplikasi dibuka.</div>';
  return h+'</div><div class="nmf"><button class="nbt" data-a="popskip" title="Popup ini tidak muncul lagi sampai besok">Jangan tampilkan lagi hari ini</button><span class="sp"></span><button class="nbt" data-a="popopen">Buka Catatan &amp; Pengingat</button><button class="nbt p" data-a="mclose">Tutup</button></div>'}
function popup(manual){var R=due(),A=auto();if(!manual&&!R.od.length&&!R.td.length&&!R.soon.length&&!A.length)return false;if(mo&&!mo.dataset.pop)return false;mOpen(popHtml(),true);return true}
function popRefresh(){if(mo&&mo.dataset.pop){var p=q1('.ntp',mo);if(p)p.innerHTML=popHtml()}}

/* ---------- Catatan: tampilan ---------- */
function noteCard(n){var c=CAT[n.cat]||CAT.catatan;
  return '<div class="ncard" style="--k:var('+c[1]+')" data-a="nedit" data-id="'+n.id+'" role="button" tabindex="0"><div class="nh"><span class="ncat">'+c[0]+'</span>'+(n.pin?PIN:'')+'</div><b>'+esc(n.t||'(Tanpa judul)')+'</b><div class="nb">'+esc(n.b||'')+'</div><small>Diubah '+fmtTs(n.u||n.c||Date.now())+'</small></div>'}
function gridHtml(){var all=load(NK),ql=st.q.toLowerCase(),a=all.filter(function(x){return(!st.cat||x.cat===st.cat)&&(!ql||((x.t||'')+' '+(x.b||'')).toLowerCase().indexOf(ql)>=0)});
  a.sort(function(x,y){return(y.pin?1:0)-(x.pin?1:0)||(y.u||0)-(x.u||0)});
  if(!a.length)return '<div class="em">'+(all.length?'Tidak ada catatan yang cocok.':'Belum ada catatan. Klik <b>+ Catatan baru</b> untuk mulai menulis pekerjaan atau catatan apa saja.')+'</div>';
  return '<div class="ngr">'+a.map(noteCard).join('')+'</div>'}
function notesHtml(){var chips=[['','Semua']].concat(Object.keys(CAT).map(function(k){return[k,CAT[k][0]]}));
  return '<div class="nbar"><input class="nin" id="ntQ" type="search" placeholder="Cari catatan..." value="'+esc(st.q)+'" aria-label="Cari catatan"><button class="nbt p" data-a="nnew">+ Catatan baru</button></div><div class="nchips">'+chips.map(function(c){return '<button class="nchip '+(st.cat===c[0]?'on':'')+'" data-a="ncat" data-c="'+c[0]+'">'+c[1]+'</button>'}).join('')+'</div><div id="ntGrid">'+gridHtml()+'</div>'}
function noteForm(id){var n=id?load(NK).filter(function(x){return x.id===id})[0]:null;n=n||{cat:st.cat||'kerja',pin:0};
  return '<div class="nmh"><h3>'+(id?'Ubah catatan':'Catatan baru')+'</h3><button class="nx" data-a="mclose" aria-label="Tutup">\u00d7</button></div><div class="nmb"><label>Judul<input class="nin" type="text" id="neT" maxlength="120" value="'+esc(n.t||'')+'" placeholder="Mis. Persiapan rapat direksi"></label><label>Isi catatan<textarea class="nin" id="neB" rows="9" placeholder="Tulis pekerjaan, catatan, atau apa saja di sini...">'+esc(n.b||'')+'</textarea></label><div class="nrow"><label>Kategori<select class="nin" id="neC">'+Object.keys(CAT).map(function(k){return '<option value="'+k+'"'+(n.cat===k?' selected':'')+'>'+CAT[k][0]+'</option>'}).join('')+'</select></label><label class="nck"><input type="checkbox" id="neP"'+(n.pin?' checked':'')+'> Sematkan di atas</label></div></div><div class="nmf">'+(id?'<button class="nbt d" data-a="ndel" data-id="'+id+'">Hapus</button><button class="nbt" data-a="ncopy">Salin</button>':'')+'<span class="sp"></span><button class="nbt" data-a="mclose">Batal</button><button class="nbt p" data-a="nsave" data-id="'+(id||'')+'">Simpan</button></div>'}
function noteSave(id){var T=q1('#neT',mo).value.trim(),B=q1('#neB',mo).value.replace(/\s+$/,'');if(!T&&!B.trim()){q1('#neT',mo).focus();return tst('Isi judul atau catatannya dulu')}
  if(!T)T=B.split('\n')[0].slice(0,60);var a=load(NK),n=id?a.filter(function(x){return x.id===id})[0]:null,now=Date.now();
  if(!n){n={id:uid(),c:now};a.push(n)}n.t=T;n.b=B;n.cat=q1('#neC',mo).value;n.pin=q1('#neP',mo).checked?1:0;n.u=now;
  if(save(NK,a)){mClose();st.tab='notes';after();tst('Catatan disimpan')}}
function noteDel(id){var a=load(NK),n=a.filter(function(x){return x.id===id})[0];if(!n)return;save(NK,a.filter(function(x){return x.id!==id}));mClose();after();
  tst('Catatan dihapus',['Urungkan',function(){var b=load(NK);b.push(n);save(NK,b);after()}])}
function noteCopy(){var T=q1('#neT',mo).value.trim(),B=q1('#neB',mo).value,t=(T?T+'\n\n':'')+B;
  try{navigator.clipboard.writeText(t).then(function(){tst('Catatan disalin')},function(){tst('Gagal menyalin')})}catch(e){tst('Gagal menyalin')}}

/* ---------- Pengingat: tampilan ---------- */
function remForm(id){var r=id?load(RK).filter(function(x){return x.id===id})[0]:null;r=r||{d:today(),rep:''};
  return '<div class="nmh"><h3>'+(id?'Ubah pengingat':'Pengingat baru')+'</h3><button class="nx" data-a="mclose" aria-label="Tutup">\u00d7</button></div><div class="nmb"><label>Apa yang harus dikerjakan atau dicek?<input class="nin" type="text" id="reT" maxlength="200" value="'+esc(r.t||'')+'" placeholder="Mis. Cek kontrak yang berakhir bulan ini"></label><label>Catatan tambahan (boleh kosong)<textarea class="nin" id="reN" rows="3" maxlength="600">'+esc(r.n||'')+'</textarea></label><div class="nrow"><label>Tanggal<input class="nin" type="date" id="reD" value="'+esc(r.d)+'"></label><label>Jam (boleh kosong)<input class="nin" type="time" id="reM" value="'+esc(r.tm||'')+'"></label><label>Berulang<select class="nin" id="reR">'+Object.keys(REP).map(function(k){return '<option value="'+k+'"'+(r.rep===k?' selected':'')+'>'+REP[k]+'</option>'}).join('')+'</select></label></div></div><div class="nmf">'+(id?'<button class="nbt d" data-a="rdel" data-id="'+id+'">Hapus</button>':'')+'<span class="sp"></span><button class="nbt" data-a="mclose">Batal</button><button class="nbt p" data-a="rsave" data-id="'+(id||'')+'">Simpan</button></div>'}
function remSave(id,fromModal){var T,N,D,M,R,sc=fromModal?mo:el;
  T=q1(fromModal?'#reT':'#rmT',sc).value.trim();N=fromModal?q1('#reN',sc).value.trim():'';D=q1(fromModal?'#reD':'#rmD',sc).value;M=q1(fromModal?'#reM':'#rmM',sc).value;R=q1(fromModal?'#reR':'#rmR',sc).value;
  if(!T){q1(fromModal?'#reT':'#rmT',sc).focus();return tst('Tulis dulu apa yang harus dikerjakan')}
  if(!D){q1(fromModal?'#reD':'#rmD',sc).focus();return tst('Pilih tanggalnya dulu')}
  var a=load(RK),r=id?a.filter(function(x){return x.id===id})[0]:null;if(!r){r={id:uid(),c:Date.now()};a.push(r)}
  r.t=T;r.d=D;r.tm=M||'';r.rep=R;r.dom=+D.slice(8);if(fromModal)r.n=N;r.done=0;delete r.dts;
  if(save(RK,a)){if(fromModal)mClose();st.tab='rem';after();tst('Pengingat disimpan');if(!fromModal){var t=q1('#rmT',el);if(t){t.value='';t.focus()}}}}
function remHtml(){var a=load(RK),t=today(),act=a.filter(function(x){return !x.done}).sort(cmpR),dn=a.filter(function(x){return x.done}).sort(function(x,y){return(y.dts||0)-(x.dts||0)});
  var od=act.filter(function(x){return x.d<t}),td=act.filter(function(x){return x.d===t}),up=act.filter(function(x){return x.d>t});
  var sec=function(l,cls,arr){return arr.length?'<div class="bx rsec '+cls+'"><h4>'+l+' <i>'+arr.length+'</i></h4>'+arr.map(function(r){return remRow(r,false)}).join('')+'</div>':''};
  var h='<div class="bx radd"><div class="rw"><input class="nin" type="text" id="rmT" maxlength="200" placeholder="Apa yang harus dikerjakan atau dicek? Mis. Kirim laporan ke direksi" aria-label="Pengingat baru"><input class="nin" type="date" id="rmD" value="'+t+'" aria-label="Tanggal"><input class="nin" type="time" id="rmM" aria-label="Jam (boleh kosong)"><select class="nin" id="rmR" aria-label="Berulang">'+Object.keys(REP).map(function(k){return '<option value="'+k+'">'+REP[k]+'</option>'}).join('')+'</select><button class="nbt p" data-a="radd">Tambah</button></div></div>';
  h+=sec('Terlewat','od',od)+sec('Hari ini','td',td)+sec('Mendatang','up',up);
  if(!act.length)h+='<div class="bx"><div class="em">Belum ada pengingat aktif. Tulis di kotak atas, lalu tekan <b>Tambah</b>.</div></div>';
  if(dn.length)h+='<div class="bx rsec dn"><h4>Sudah selesai <i>'+dn.length+'</i> <button class="nlink" data-a="rshowdone">'+(st.showDone?'Sembunyikan':'Tampilkan')+'</button>'+(st.showDone?' <button class="nlink" data-a="rclear">Hapus semua yang selesai</button>':'')+'</h4>'+(st.showDone?dn.slice(0,30).map(function(r){return '<div class="rrow dn"><button class="rck on" data-a="rundo" data-id="'+r.id+'" aria-label="Batalkan selesai" title="Batalkan selesai">'+CK+'</button><div class="rm"><b>'+esc(r.t)+'</b><small>Selesai '+fmtTs(r.dts||Date.now())+'</small></div><span class="racts"><button data-a="rdel" data-id="'+r.id+'">Hapus</button></span></div>'}).join(''):'')+'</div>';
  h+='<div class="bx rset"><h4>Pengaturan popup</h4><label><input type="checkbox" id="rsOn" '+(opt('opa-rm-on','1')!=='0'?'checked':'')+'> Tampilkan popup pengingat setiap aplikasi dibuka</label><label><input type="checkbox" id="rsAuto" '+(opt('opa-rm-auto','1')!=='0'?'checked':'')+'> Sertakan info dari aplikasi (kontrak, absensi, surat, PPh 21, cadangan)</label><p class="hint">Pengaturan popup tersimpan per perangkat. Isi pengingat dan catatan ikut tersinkron ke semua admin dan masuk ke file cadangan.</p><button class="nbt" data-a="rpop">Lihat popup sekarang</button></div>';
  return h}

/* ---------- halaman utama ---------- */
function render(){var R=due(),nN=load(NK).length,nR=R.od.length+R.td.length;
  el.innerHTML='<div><h2>Catatan &amp; Pengingat</h2><p class="sb">Tulis catatan pekerjaan, simpan hal penting, dan atur pengingat. Pengingat yang jatuh tempo muncul sebagai popup setiap aplikasi dibuka.</p><div class="ntabs" role="tablist"><button role="tab" class="'+(st.tab==='notes'?'on':'')+'" data-a="tab" data-t="notes">Catatan<i>'+nN+'</i></button><button role="tab" class="'+(st.tab==='rem'?'on':'')+'" data-a="tab" data-t="rem">Pengingat<i class="'+(nR?'hot':'')+'">'+nR+'</i></button></div>'+(st.tab==='notes'?notesHtml():remHtml())+'</div>'}
function after(){try{if(typeof mod!=='undefined'&&mod===-6)render()}catch(e){}popRefresh();badge()}

/* ---------- aksi klik ---------- */
function onClick(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a,id=b.dataset.id;
  if(a==='popopen'||a==='aopen'||a==='popskip'||a==='mclose')e.preventDefault();
  if(a==='tab'){st.tab=b.dataset.t;render()}
  else if(a==='ncat'){st.cat=b.dataset.c;render()}
  else if(a==='nnew'){mOpen(noteForm(''))}
  else if(a==='nedit'){mOpen(noteForm(id))}
  else if(a==='nsave')noteSave(id);
  else if(a==='ndel')noteDel(id);
  else if(a==='ncopy')noteCopy();
  else if(a==='mclose')mClose();
  else if(a==='radd')remSave('',false);
  else if(a==='rsave')remSave(id,true);
  else if(a==='rdone'){complete(id);after()}
  else if(a==='rundo'){undone(id);after()}
  else if(a==='rsnz'){postpone(id);after()}
  else if(a==='redit'){mOpen(remForm(id))}
  else if(a==='rdel'){mClose();remRemove(id);after()}
  else if(a==='rshowdone'){st.showDone=!st.showDone;render()}
  else if(a==='rclear'){var dn=load(RK).filter(function(x){return x.done});if(dn.length&&confirm('Hapus '+dn.length+' pengingat yang sudah selesai?')){save(RK,load(RK).filter(function(x){return !x.done}));after()}}
  else if(a==='rpop')popup(true);
  else if(a==='popopen'){mClose();st.tab=load(RK).length?'rem':'notes';goto(-6,'notes')}
  else if(a==='popskip'){try{localStorage.setItem('opa-rm-skip',today())}catch(x){}mClose();tst('Popup tidak muncul lagi hari ini')}
  else if(a==='aopen'){var x=popAuto[+b.dataset.i];mClose();if(!x)return;if(x.act==='bk'){try{backupAll()}catch(z){}}else goto(x.m,x.k)}}
el.addEventListener('click',onClick);
el.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.ncard')){e.preventDefault();e.target.click()}else if(e.key==='Enter'&&e.target.id==='rmT'){e.preventDefault();remSave('',false)}});
el.addEventListener('input',function(e){if(e.target.id==='ntQ'){st.q=e.target.value;var g=q1('#ntGrid',el);if(g)g.innerHTML=gridHtml()}});
el.addEventListener('change',function(e){var t=e.target;if(t.id==='rsOn'){try{localStorage.setItem('opa-rm-on',t.checked?'1':'0')}catch(x){}}else if(t.id==='rsAuto'){try{localStorage.setItem('opa-rm-auto',t.checked?'1':'0')}catch(x){}badge()}});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&mo){e.stopPropagation();mClose();return}
  if(mo&&(e.ctrlKey||e.metaKey)&&e.key==='Enter'){var s=q1('[data-a=nsave],[data-a=rsave]',mo);if(s){e.preventDefault();s.click()}}},true);
window.ntRender=render;window.rmPopup=popup;window.rmBadge=badge;

/* ---------- lonceng di bilah atas + tombol di Menu Utama ---------- */
function mkBell(){var thm=document.getElementById('thm');if(!thm||document.getElementById('rmb'))return;var b=document.createElement('button');b.className='ib';b.id='rmb';b.type='button';b.setAttribute('aria-label','Pengingat hari ini');b.title='Pengingat hari ini';b.innerHTML=BELL+'<span class="rmn" hidden></span>';b.addEventListener('click',function(){popup(true)});thm.parentNode.insertBefore(b,thm)}
mkBell();
var hm=document.getElementById('hm');
function mkDock(){if(!hm)return;var dk=q1('.dock',hm);if(!dk||q1('[data-h=rm]',dk))return;var b=document.createElement('button');b.dataset.h='rm';b.dataset.tip='Catatan & Pengingat';b.setAttribute('aria-label','Catatan dan Pengingat');b.innerHTML=NOTE;var ai=q1('[data-h=ai]',dk);dk.insertBefore(b,ai?ai.nextSibling:null)}
if(hm){new MutationObserver(mkDock).observe(hm,{childList:true});mkDock();hm.addEventListener('click',function(e){if(e.target.closest('[data-h=rm]'))goto(-6,'notes')})}

/* ---------- popup otomatis saat aplikasi dibuka (sekali per pembukaan) ---------- */
var shown=false,tries=0;
function boot(){if(shown)return;tries++;
  if(opt('opa-rm-on','1')==='0'||opt('opa-rm-skip','')===today()){shown=true;return}
  if(typeof ready==='undefined'||!ready.every(Boolean))return;
  var lk=document.querySelectorAll('.lk'),i;for(i=0;i<lk.length;i++){if(getComputedStyle(lk[i]).display!=='none')return}
  shown=true;setTimeout(function(){popup(false);badge()},900)}
setInterval(boot,800);setInterval(badge,30000);setTimeout(badge,2500);
})();
