/* ====================== SLIP GAJI ====================== */
const SLK='opa-slip-gaji';
const SL={tab:'slip',per:null,unit:'',q:'',sel:null,imp:null,raw:null,db:null,inited:false};
const SL_DEF={company:'',address:'',hr:'',hrT:'HR Manager',fin:'',finT:'Finance / Direksi',note:'Dokumen ini bersifat rahasia dan hanya untuk karyawan yang bersangkutan. Hubungi HR bila ada ketidaksesuaian data.',o:{bank:1,thr:0,zero:0,sen:1,sign:1,addr:1}};
const SL_LIBS={xlsx:['XLSX','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'],h2p:['html2pdf','https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js']};
const SL_IC={doc:'<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',up:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',set:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',pr:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/>',dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',zip:'<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',tr:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',op:'<path d="M5 12h14M13 6l6 6-6 6"/>'};
const slI=k=>`<svg class="i" viewBox="0 0 24 24">${SL_IC[k]}</svg>`;

/* ---------- penyimpanan ---------- */
function slDB(){let raw=null;try{raw=localStorage.getItem(SLK)}catch(e){}
  if(SL.db&&raw===SL.raw)return SL.db;
  let o=null;try{o=JSON.parse(raw)}catch(e){}
  if(!o||typeof o!=='object')o={};
  o.periods=o.periods||{};o.cfg=Object.assign({},SL_DEF,o.cfg||{});o.cfg.o=Object.assign({},SL_DEF.o,o.cfg.o||{});delete o.cfg.o.mask;
  SL.db=o;SL.raw=raw;return o}
function slSave(){try{const s=JSON.stringify(SL.db);localStorage.setItem(SLK,s);SL.raw=s;return true}catch(e){toast('Gagal menyimpan: penyimpanan browser penuh. Hapus periode lama atau cadangkan dulu.');return false}}
const slKeys=()=>Object.keys(slDB().periods).sort().reverse();
const slLbl=k=>{const[y,m]=String(k).split('-');return(BLN[+m]||'?')+' '+y};
function slStat(){const db=slDB(),ks=slKeys(),l=ks[0]?db.periods[ks[0]]:null;return{np:ks.length,n:l?l.rows.length:0,label:l?l.label:''}}
function slInf(){const s=slStat();return s.np?`${s.label}: ${s.n} slip siap dibuat`:'Belum ada data gaji. Import Excel untuk mulai'}
function slIndex(r){const db=slDB();slKeys().forEach(k=>{const p=db.periods[k];p.rows.forEach(x=>r.push({t:'Slip Gaji',n:x.nama,sub:`${p.label} · ${x.jab||''}`,x:(x.nik||'')+' '+(x.jab||''),f:()=>{SL.per=k;SL.sel=x.id;SL.unit='';SL.q='';goto(-5,'slip')}}))})}

/* ---------- format ---------- */
const slF=(n,dec)=>new Intl.NumberFormat('id-ID',{minimumFractionDigits:dec?2:0,maximumFractionDigits:dec?2:0}).format(+n||0);
const slNum=v=>{if(typeof v==='number')return isFinite(v)?v:0;if(v==null||v==='')return 0;let s=String(v).replace(/[^\d,.\-]/g,'');if(!s)return 0;if(!s.includes(',')&&/^-?\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');if(s.includes(',')&&s.includes('.')){s=s.lastIndexOf(',')>s.lastIndexOf('.')?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'')}else if(s.includes(',')){s=/,\d{1,2}$/.test(s)?s.replace(',','.'):s.replace(/,/g,'')}const n=parseFloat(s);return isFinite(n)?n:0};
const slN=v=>String(v==null?'':v).replace(/\s+/g,' ').trim().toLowerCase();
const slS=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
function slDate(v){if(v==null||v==='')return'';if(v instanceof Date){const d=new Date(v.getTime()+12*36e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Math.round((v-25569)*864e5)+12*36e5);return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0')}
  const s=String(v).trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');
  m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);if(m)return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');return''}
function slTerb(n){n=Math.floor(Math.abs(n));if(!n)return'nol';const s=['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
  const t=x=>{if(x<12)return s[x];if(x<20)return t(x-10)+' belas';if(x<100)return t(Math.floor(x/10))+' puluh'+(x%10?' '+t(x%10):'');if(x<200)return'seratus'+(x%100?' '+t(x%100):'');if(x<1e3)return t(Math.floor(x/100))+' ratus'+(x%100?' '+t(x%100):'');if(x<2e3)return'seribu'+(x%1e3?' '+t(x%1e3):'');if(x<1e6)return t(Math.floor(x/1e3))+' ribu'+(x%1e3?' '+t(x%1e3):'');if(x<1e9)return t(Math.floor(x/1e6))+' juta'+(x%1e6?' '+t(x%1e6):'');if(x<1e12)return t(Math.floor(x/1e9))+' miliar'+(x%1e9?' '+t(x%1e9):'');return t(Math.floor(x/1e12))+' triliun'+(x%1e12?' '+t(x%1e12):'')};
  return t(n)}
function slWords(n,sen){const a=Math.floor(Math.abs(n)),c=Math.round((Math.abs(n)-a)*100);let w=slTerb(a)+' rupiah';if(sen&&c>0&&c<100)w+=' '+slTerb(c)+' sen';return w.charAt(0).toUpperCase()+w.slice(1)}
function slTenure(j,e){if(!j)return'–';const a=new Date(j+'T12:00:00'),b=new Date((e||new Date().toISOString().slice(0,10))+'T12:00:00');if(isNaN(a)||isNaN(b))return'–';let m=(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth();if(b.getDate()<a.getDate())m--;if(m<0)return'–';const y=Math.floor(m/12),mm=m%12;return(y?y+' tahun':'')+(y&&mm?' ':'')+(mm||!y?mm+' bulan':'')}

/* ---------- baca Excel ---------- */
const SL_G=[['basic',/^(basic|gaji pokok)/],['jab',/^tunj\.?\s*jabatan/],['loy',/loyalitas/],['pjk',/^tunj\.?\s*pajak/],['mkn',/^uang makan/],['kmp',/kompensasi/],['lbr',/^lembur/],['tt',/total tunjangan/],['tp',/total pendapatan/],['tlt',/terlambat/],['bpjs',/bpjs/],['kas',/kasbon/],['unp',/unpaid/],['pmk',/potongan makan/],['plain',/potongan lain/],['pph',/^pph|pajak penghasilan/],['tpot',/total potongan/],['ter',/^ter\b/],['net',/^jumlah|take home|gaji bersih/],['thr',/thr/],['rek',/no\.?\s*rekening/],['ran',/nama pemilik/],['bank',/^bank/],['jatah',/jatah cuti/],['ambil',/ambil cuti/],['sisa',/sisa cuti/],['no',/^no\.?$/],['nik',/^nik$/],['ktp',/ktp/],['nama',/^nama( karyawan)?$/],['jabn',/^jabatan$/],['alamat',/^alamat/],['join',/bergabung|^join/],['ptkp',/ptkp/],['hadir',/^hadir|kehadiran/]];
function slMap(rows,hr,sr){const H=rows[hr]||[],S=sr>hr?rows[sr]||[]:[],n=Math.max(H.length,S.length),map={};let g=null;
  for(let c=0;c<n;c++){const h=slN(H[c]);if(h){g=null;for(const[k,re]of SL_G)if(re.test(h)){g=k;break}}
    if(!g)continue;const s=sr>hr?slN(S[c]):'';
    const sub=!s?'t':/qty|jml/.test(s)?'q':/rate|tarif/.test(s)?'r':/lalu/.test(s)?'lalu':/sisa/.test(s)?'sisa':/total/.test(s)?'t':/potongan/.test(s)?'pot':'t';
    map[g]=map[g]||{};if(map[g][sub]===undefined)map[g][sub]=c}
  return map}
function slParse(rows,sheet){
  let hr=-1;for(let r=0;r<Math.min(rows.length,40)&&hr<0;r++){const a=(rows[r]||[]).map(slN);if(a.includes('nik')&&a.some(x=>x.startsWith('nama')))hr=r}
  if(hr<0)throw new Error('baris judul kolom (NIK, Nama Karyawan) tidak ditemukan');
  let sr=-1;for(let r=hr+1;r<=hr+3&&sr<0;r++)if((rows[r]||[]).some(v=>/^(qty|rate|total)$/.test(slN(v))))sr=r;
  const st=(sr>=0?sr:hr)+1,m=slMap(rows,hr,sr>=0?sr:hr);
  if(!m.nama||!m.net&&!m.tp)throw new Error('kolom Nama Karyawan dan Jumlah/Total Pendapatan tidak ditemukan');
  const get=(row,g,k)=>m[g]&&m[g][k]!==undefined?row[m[g][k]]:undefined;
  const tri=(row,g)=>{let q=slNum(get(row,g,'q')),r=slNum(get(row,g,'r')),t=slNum(get(row,g,'t'));if(!t&&q&&r&&get(row,g,'t')===undefined)t=q*r;return[q,r,t]};
  const txt=(row,g)=>slS(get(row,g,'t'));
  let start='',end='',title='';
  for(let r=0;r<hr;r++)for(const v of(rows[r]||[])){if(v==null||v==='')continue;const s=String(v);if(!title&&r===0&&isNaN(+s))title=s;
    if(!end){const iso=[...s.matchAll(/(\d{4}-\d{2}-\d{2})/g)].map(x=>x[1]);if(iso.length>=2){start=iso[0];end=iso[1]}else{const dm=[...s.matchAll(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/g)].map(x=>x[3]+'-'+x[2].padStart(2,'0')+'-'+x[1].padStart(2,'0'));if(dm.length>=2){start=dm[0];end=dm[1]}}}}
  const MNS=['januari','februari','maret','april','mei','juni','juli','agustus','september','oktober','november','desember'],mnm=t=>{const m=String(t||'').toLowerCase().match(/(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/);return m?MNS.indexOf(m[1])+1:0},
    shMonth=/^\s*(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)[\s\-_]*(20\d\d)?\s*$/i.test(slS(sheet));
  const unit=(shMonth?'':slS(sheet))||title.replace(/^worksheet gaji\s*/i,'')||'Perusahaan';
  const out=[],seen={};
  for(let r=st;r<rows.length;r++){const row=rows[r]||[];const nama=txt(row,'nama');
    if(!nama){if(/total/i.test(slS(get(row,'nik','t'))||slS(get(row,'no','t'))))break;continue}
    const e={basic:tri(row,'basic'),jab:tri(row,'jab'),loy:tri(row,'loy'),pjk:tri(row,'pjk'),mkn:tri(row,'mkn'),kmp:tri(row,'kmp'),lbr:tri(row,'lbr')};
    const kas=[slNum(get(row,'kas','lalu')),slNum(get(row,'kas','pot')),slNum(get(row,'kas','sisa'))];
    const d={tlt:tri(row,'tlt'),bpjs:tri(row,'bpjs'),kas,unp:tri(row,'unp'),pmk:tri(row,'pmk'),plain:tri(row,'plain'),pph:tri(row,'pph')};
    const sumE=Object.values(e).reduce((a,x)=>a+x[2],0),sumD=d.tlt[2]+d.bpjs[2]+kas[1]+d.unp[2]+d.pmk[2]+d.plain[2]+d.pph[2];
    const hasTp=m.tp!==undefined,hasTpot=m.tpot!==undefined,hasNet=m.net!==undefined;
    let tp=slNum(get(row,'tp','t')),tpot=slNum(get(row,'tpot','t')),net=slNum(get(row,'net','t')),tt=slNum(get(row,'tt','t'));
    if(!hasTp||!tp)tp=sumE;if(!hasTpot||(!tpot&&sumD))tpot=sumD;if(!hasNet||(!net&&tp))net=tp-tpot;if(!m.tt)tt=sumE-e.basic[2];
    const w=[];if(hasTp&&Math.abs(sumE-tp)>1)w.push('Total pendapatan berbeda dengan jumlah komponen (selisih Rp '+slF(Math.abs(sumE-tp),1)+')');
    if(hasTpot&&Math.abs(sumD-tpot)>1)w.push('Total potongan berbeda dengan jumlah komponen (selisih Rp '+slF(Math.abs(sumD-tpot),1)+')');
    if(hasNet&&Math.abs(tp-tpot-net)>1)w.push('Jumlah bersih tidak sama dengan pendapatan dikurangi potongan');
    if(!txt(row,'nik'))w.push('NIK kosong');
    const nik=txt(row,'nik');let id=unit+'|'+(nik||nama);if(seen[id])id+='#'+(++seen[id]);else seen[id]=1;
    out.push({id,unit,no:slNum(get(row,'no','t'))||out.length+1,nik,ktp:txt(row,'ktp'),nama,jab:txt(row,'jabn'),alamat:txt(row,'alamat'),join:slDate(get(row,'join','t')),ptkp:txt(row,'ptkp'),hadir:slNum(get(row,'hadir','t')),e,tt,tp,d,tpot,ter:slNum(get(row,'ter','t')),net,thr:slNum(get(row,'thr','t')),bank:{no:txt(row,'rek'),an:txt(row,'ran'),bk:txt(row,'bank')},cuti:[slNum(get(row,'jatah','t')),slNum(get(row,'ambil','t')),slNum(get(row,'sisa','t'))],w})}
  if(!out.length)throw new Error('tidak ada baris karyawan');
  let key=(end||start||'').slice(0,7);
  if(!key){const mm=mnm(sheet)||mnm(title),yy=((String(sheet)+' '+title).match(/20\d\d/)||[])[0]||String(new Date().getFullYear());key=mm?yy+'-'+String(mm).padStart(2,'0'):new Date().toISOString().slice(0,7)}
  return{unit,title,start,end,key,rows:out}}
function slLib(k){const[g,url]=SL_LIBS[k];if(window[g])return Promise.resolve(window[g]);
  return new Promise((ok,no)=>{const s=document.createElement('script');s.src=url;s.onload=()=>window[g]?ok(window[g]):no(new Error('pustaka tidak termuat'));s.onerror=()=>{let f;try{f=k==='xlsx'?W(3).XLSX:null}catch(e){}f?ok(f):no(new Error('butuh koneksi internet untuk memuat pustaka'))};document.head.appendChild(s)})}
async function slFile(fl){const fs=Array.from(fl&&fl.length!==undefined?fl:[fl]).filter(Boolean);if(!fs.length)return;
  try{toast('Membaca '+fs.map(f=>f.name).join(', ')+'…');const X=await slLib('xlsx'),parts=[],skipped=[];
    for(const f of fs){const wb=X.read(await f.arrayBuffer(),{type:'array',cellDates:true});
      wb.SheetNames.forEach(sn=>{try{const p=slParse(X.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:null,raw:true,blankrows:true}),sn);p.file=f.name;parts.push(p)}catch(e){skipped.push((fs.length>1?f.name+' / ':'')+sn+': '+e.message)}})}
    if(!parts.length)throw new Error(skipped[0]||'data tidak ditemukan');
    SL.imp={name:fs.map(f=>f.name).join(', '),parts,skipped};toast('File terbaca: '+parts.reduce((a,p)=>a+p.rows.length,0)+' karyawan, '+new Set(parts.map(p=>p.key)).size+' bulan');slRender()}
  catch(e){toast('Gagal membaca file: '+e.message)}}
/* Simpan: setiap sheet masuk ke bulannya sendiri, jadi 1 import bisa berisi banyak bulan */
async function slImpSave(){const imp=SL.imp;if(!imp)return;const db=slDB(),groups=new Map();
  imp.parts.forEach(p=>{if(!groups.has(p.key))groups.set(p.key,[]);groups.get(p.key).push(p)});
  const clash=[...groups].filter(([k,ps])=>{const per=db.periods[k],u=ps.map(p=>p.unit);return per&&per.rows.some(r=>u.includes(r.unit))}).map(([k])=>slLbl(k));
  if(clash.length&&!await opaConfirm('Periode '+clash.join(', ')+' sudah ada. Data lama untuk unit yang sama akan diganti. Lanjutkan?'))return;
  let last='';
  groups.forEach((ps,key)=>{const units=ps.map(p=>p.unit);let per=db.periods[key];
    if(!per)per=db.periods[key]={key,label:slLbl(key),start:'',end:'',rows:[],src:[]};
    per.rows=per.rows.filter(r=>!units.includes(r.unit));per.src=(per.src||[]).filter(s=>!units.includes(s.unit));
    ps.forEach(p=>{p.rows.forEach(r=>per.rows.push(r));per.src.push({unit:p.unit,file:p.file||imp.name,at:new Date().toISOString(),n:p.rows.length});if(p.start){per.start=p.start;per.end=p.end}});
    per.label=slLbl(key);if(key>last)last=key});
  if(!slSave())return;
  const names=[...groups.keys()].sort().map(slLbl);
  SL.mFromU=SL.mToU=0;SL.imp=null;SL.per=last;SL.sel=null;SL.unit='';SL.q='';toast('Tersimpan: '+names.join(', '));goto(-5,'slip')}

/* ---------- kertas slip ---------- */
const SL_E=[['jab','Tunjangan Jabatan',''],['loy','Tunjangan Loyalitas',''],['pjk','Tunjangan Pajak',''],['mkn','Uang Makan','hari'],['kmp','Kompensasi Lainnya',''],['lbr','Lembur','jam']];
const SL_D=[['tlt','Keterlambatan','menit'],['bpjs','BPJS Kesehatan',''],['kas','Potongan Kasbon',''],['unp','Unpaid Leave','hari'],['pmk','Potongan Makan','hari'],['plain','Potongan Lainnya',''],['pph','PPh Pasal 21','']];
/* ---------- kop outlet (data diambil dari modul Kontrak) ---------- */
const SL_HO=/^\s*(ohm\s*holding|humas|pt\.?\s*ohm)\s*$/i,SL_HOADDR='Jl. Leuwipanjang, Bandung',SL_HONAME='OPA Hospitality Management';
function slCD(){const t=Date.now();if(SL.cd&&t-SL.cd.t<1500)return SL.cd.v;let S=null,L='';
  try{if(typeof ev==='function'){S=ev(0,'S');L=ev(0,'LOGO')||''}}catch(e){}
  if(!S||!Array.isArray(S.out)){try{S=JSON.parse(localStorage.getItem('opa_contractdesk_v2'))}catch(e){S=null}}
  const v=S&&Array.isArray(S.emp)&&Array.isArray(S.out)?{S,L}:null;SL.cd={t,v};return v}
function slOutNames(){const cd=slCD();if(!cd)return[];return[...new Set(cd.S.out.map(o=>o.name).concat(cd.S.emp.map(e=>e.out)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id'))}
function slOutOf(r,cd){const k=slN(r.nik),kt=String(r.ktp||'').replace(/\D/g,''),nm=slN(r.nama),E=cd.S.emp;
  const e=E.find(x=>k&&slN(x.no)===k)||E.find(x=>kt&&String(x.nik||'').replace(/\D/g,'')===kt)||E.find(x=>nm&&slN(x.name)===nm);
  let o=e&&e.out||'';if(!o){const u=slN(r.unit);o=(cd.S.out.find(x=>slN(x.name)===u)||{}).name||''}return o}
function slKop(r,cfg){const base={name:cfg.company||r.unit||'Perusahaan',addr:cfg.address||'',logo:''},cd=slCD();if(!cd)return base;
  const on=cfg.kop||slOutOf(r,cd);if(!on)return base;const mg=(cd.S.cfg&&cd.S.cfg.logo)||cd.L||'';
  const o=cd.S.out.find(x=>x.name===on)||{},cl=a=>a?String(a).replace(/\s+/g,' ').trim():'';
  if(SL_HO.test(on)){const oh=cd.S.out.find(x=>/^\s*ohm\s*holding\s*$/i.test(x.name))||{};
    return{name:SL_HONAME,addr:cl(o.addr)||cl(oh.addr)||SL_HOADDR,logo:o.logo||oh.logo||mg}}
  return{name:on,addr:o.addr?String(o.addr).replace(/\s+/g,' ').trim():'',logo:o.logo||mg}}
const slTitle=t=>{t=String(t==null?'':t).trim();if(!t||(t!==t.toUpperCase()&&t!==t.toLowerCase()))return t;return t.toLowerCase().replace(/(^|[\s\/\-.(])([a-z])/g,(m,a,b)=>a+b.toUpperCase())};
const slMask=(n,c)=>{n=String(n||'').replace(/\s+/g,'');return n?n.slice(0,5)+(c||'•').repeat(Math.max(0,n.length-5)):'–'};
/* format akuntansi: Rp rata kiri, angka rata kanan, nol = "-", negatif = (angka) */
function slAcc(v,sen){v=+v||0;const q=sen?Math.round(v*100)/100:Math.round(v);const n=q===0?'-':q<0?'('+slF(-q,sen)+')':slF(q,sen);return'<span class="ac"><i>Rp</i><span>'+n+'</span></span>'}
function slSlip(r,per,cfg){const o=cfg.o,M=n=>slF(n,o.sen),A=v=>slAcc(v,o.sen),K=slKop(r,cfg),comp=K.name;
  const li=(lb,det,v,cls)=>`<li class="${cls?'p-'+cls:''}"><div class="p-lb"><b>${esc(lb)}</b>${det?`<small>${esc(det)}</small>`:''}</div><div class="p-am">${A(v)}</div></li>`;
  const det=(t,u)=>{const q=t[0],rt=t[1];return q&&rt&&(q>1||(q===1&&u))?`${slF(q,q%1)}${u?' '+u:''} × Rp ${slF(rt,rt%1!==0)}`:''};
  let earn=li('Gaji Pokok (Basic)','',r.e.basic[2],'');let tn=0,eh='';
  SL_E.forEach(([k,l,u])=>{const t=r.e[k]||[0,0,0];if(!t[2]&&!o.zero)return;tn++;eh+=li(l,det(t,u),t[2],t[2]?'':'z')});
  if(eh)earn+=`<li class="p-g">Tunjangan &amp; Pendapatan Lain</li>`+eh+`<li class="p-st"><div class="p-lb"><b>Subtotal Tunjangan</b></div><div class="p-am">${A(r.tt)}</div></li>`;
  let ded='',nd=0;
  SL_D.forEach(([k,l,u])=>{let v,d2='';if(k==='kas'){v=r.d.kas[1]}
    else{const t=r.d[k]||[0,0,0];v=t[2];d2=det(t,u);if(k==='pph'){const x=[];if(r.ter)x.push('Tarif TER '+slF(r.ter,r.ter%1!==0).replace(/,00$/,'')+'%');if(r.e.pjk[2]>0&&Math.abs(r.e.pjk[2]-v)<1)x.push('dikompensasi Tunj. Pajak');d2=x.join(' · ')}}
    if(!v&&!o.zero)return;nd++;ded+=li(l,d2,v,v?'':'z')});
  if(!nd)ded='<li class="p-none">Tidak ada potongan bulan ini</li>';
  const pD=r.tp>0?Math.min(100,Math.max(0,r.tpot/r.tp*100)):0,pN=100-pD,pf=x=>x.toLocaleString('id-ID',{maximumFractionDigits:1});
  const cards=[];
  if(o.bank&&(r.bank.no||r.bank.bk))cards.push(`<div><h4>Transfer Gaji</h4><p><span>Bank</span><span>${esc(r.bank.bk||'–')}</span></p><p><span>No. Rekening</span><span>${esc(r.bank.no||'–')}</span></p><p><span>Atas Nama</span><span>${esc(slTitle(r.bank.an||r.nama))}</span></p></div>`);
  if(o.thr&&r.thr>0)cards.push(`<div><h4>Informasi THR</h4><p><span>Alokasi THR bulan ini</span><span>${A(r.thr)}</span></p><p class="p-s"><span>Keterangan</span><span>Cadangan, bukan potongan</span></p></div>`);
  if(SL.kas&&r.d.kas&&(r.d.kas[0]||r.d.kas[1]||r.d.kas[2]))cards.push(`<div><h4>Saldo Kasbon</h4><p><span>Saldo awal</span><span>${A(r.d.kas[0])}</span></p><p><span>Dipotong bulan ini</span><span>${A(r.d.kas[1])}</span></p><p class="p-s"><span>Sisa saldo</span><span>${A(r.d.kas[2])}</span></p></div>`);
  const nm=slTitle(r.nama),pt=per.start&&per.end?`Periode penggajian ${fdt(per.start)} – ${fdt(per.end)}`:'';
  const no='SG/'+String(per.key||'').replace('-','')+'/'+String(r.no).padStart(3,'0');
  return`<article class="slip">${r.sample?'<div class="p-smp">CONTOH</div>':''}<div class="p-fb"></div>
<header class="p-sh"><div class="p-l">${K.logo?`<div class="p-lg p-li"><img src="${esc(K.logo)}" alt=""></div>`:`<div class="p-lg">${esc(ini(comp))}</div>`}<div><b>${esc(slTitle(comp))}</b>${K.addr?`<small>${esc(K.addr)}</small>`:''}</div></div><div class="p-r"><span class="p-tag">Slip Gaji</span><h1>${esc(per.label||slLbl(per.key))}</h1><small>${esc(pt)}</small><small>No. ${esc(no)}</small></div></header>
<section class="p-em"><div class="p-t"><div class="p-av">${esc(ini(r.nama))}</div><div><b>${esc(nm)}</b><small>${esc(slTitle(r.jab)||'–')}${r.unit&&r.unit!==comp?' · '+esc(slTitle(r.unit)):''}</small></div><div class="p-hd"><small>Kehadiran</small><b>${slF(r.hadir,r.hadir%1)} hari</b></div></div>
<div class="p-eg"><div><small>NIK</small><b>${esc(r.nik||'–')}</b></div><div><small>No. KTP</small><b>${esc(slMask(r.ktp))}</b></div><div><small>Status PTKP</small><b>${esc(r.ptkp||'–')}</b></div><div><small>Tanggal Bergabung</small><b>${r.join?esc(fdt(r.join)):'–'}</b></div><div><small>Masa Kerja</small><b>${esc(slTenure(r.join,per.end))}</b></div>${o.addr&&r.alamat?`<div class="p-w" style="grid-column:1/-1"><small>Alamat</small><b>${esc(r.alamat)}</b></div>`:''}</div></section>
<section class="p-cols"><div class="p-cl p-e"><div class="p-ch">Pendapatan</div><ul>${earn}</ul><div class="p-tt"><span>Total Pendapatan</span><span>${A(r.tp)}</span></div></div>
<div class="p-cl p-d"><div class="p-ch">Potongan</div><ul>${ded}</ul><div class="p-tt"><span>Total Potongan</span><span>${A(r.tpot)}</span></div></div></section>
<section class="p-nt"><div class="p-a"><small>Gaji Bersih Diterima</small><b>${A(r.net)}</b><em>Terbilang: ${esc(slWords(r.net,o.sen))}</em></div><div class="p-k"><div><span>Total Pendapatan</span><span>${A(r.tp)}</span></div><div><span>Total Potongan</span><span>${A(-r.tpot)}</span></div><div class="p-bar"><i class="p-a" style="width:${pN}%"></i><i class="p-b" style="width:${pD}%"></i></div><div class="p-lgd"><span>Diterima ${pf(pN)}%</span><span>Potongan ${pf(pD)}%</span></div></div></section>
${cards.length?`<section class="p-in" style="--n:${cards.length}">${cards.join('')}</section>`:''}
${o.sign?`<section class="p-sg"><div><small>Diterima Oleh</small><div class="p-ln"></div><b>${esc(slTitle(r.nama))}</b><span>Karyawan</span></div></section>`:''}
<footer class="p-ft"><p>${esc(cfg.note||'')}</p><p>Dicetak ${esc(new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}))}</p></footer></article>`}
function slSample(){return{id:'x',sample:1,unit:'',no:1,nik:'EMP-0001',ktp:'3273010101900001',nama:'Nama Karyawan Contoh',jab:'Staff Operasional',alamat:'Jl. Contoh No. 1, Bandung',join:'2021-03-15',ptkp:'TK/0',hadir:24,e:{basic:[1,5e6,5e6],jab:[1,1e6,1e6],loy:[1,5e5,5e5],pjk:[0,0,0],mkn:[24,4e4,96e4],kmp:[0,0,0],lbr:[3,3e4,9e4]},tt:2550000,tp:7550000,d:{tlt:[0,0,0],bpjs:[1,1e5,1e5],kas:[5e5,25e4,25e4],unp:[0,0,0],pmk:[0,0,0],plain:[0,0,0],pph:[1,56625,56625]},tpot:406625,ter:.75,net:7143375,thr:714337.5,bank:{no:'1234567890',an:'Nama Karyawan Contoh',bk:'BCA'},cuti:[12,2,10],w:[]}}

/* ---------- cetak & PDF ---------- */
const slFiltered=()=>{const p=slDB().periods[SL.per];if(!p)return[];const q=slN(SL.q);return p.rows.filter(r=>(!SL.unit||r.unit===SL.unit)&&(!q||slN(r.nama+' '+r.nik+' '+r.jab).includes(q)))};
const slFname=(r,per)=>('Slip Gaji '+per.label+' - '+r.nama).replace(/[\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim();
function slPrint(list){const per=slDB().periods[SL.per];if(!per||!list.length)return toast('Tidak ada slip untuk dicetak');slPrintItems(list.map(r=>({r,per})),list.length===1?slFname(list[0],per):'Slip Gaji '+per.label)}
function slPrintItems(items,title){const db=slDB();if(!items.length)return toast('Tidak ada slip untuk dicetak');
  const css=($('#slcss')||{}).textContent||'',body=items.map(x=>slSlip(x.r,x.per,db.cfg)).join('');
  const html=`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}@page{size:A4;margin:0}html,body{margin:0;background:#fff}.slip{break-after:page;page-break-after:always;margin:0 auto}.slip:last-child{break-after:auto;page-break-after:auto}</style></head><body>${body}</body></html>`;
  const fr=document.createElement('iframe');fr.setAttribute('aria-hidden','true');fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';document.body.appendChild(fr);
  const d=fr.contentDocument;d.open();d.write(html);d.close();
  const go=()=>{try{fr.contentWindow.focus();fr.contentWindow.print()}catch(e){toast('Cetak gagal dijalankan')}setTimeout(()=>fr.remove(),180000)};
  Promise.race([d.fonts&&d.fonts.ready||Promise.resolve(),new Promise(r=>setTimeout(r,1500))]).then(()=>setTimeout(go,250))}
const slDl=(b,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
async function slPdf(r){const db=slDB(),per=db.periods[SL.per];await slPdfItems([{r,per}],slFname(r,per))}

/* ---------- slip beberapa bulan dalam 1 PDF ---------- */
const slEk=r=>slN(r.nik)||slN(r.nama);
function slEmps(){const db=slDB(),m=new Map();slKeys().forEach(k=>db.periods[k].rows.forEach(r=>{const e=slEk(r);if(!m.has(e))m.set(e,{k:e,nama:r.nama,jab:r.jab})}));return[...m.values()].sort((a,b)=>a.nama.localeCompare(b.nama,'id'))}
const slFind=(per,e)=>per.rows.find(x=>slEk(x)===e.k)||per.rows.find(x=>slN(x.nama)===slN(e.nama));
function slMonths(a,b){if(a>b){const t=a;a=b;b=t}const o=[];let y=+a.slice(0,4),m=+a.slice(5,7);const y2=+b.slice(0,4),m2=+b.slice(5,7);
  while((y<y2||(y===y2&&m<=m2))&&o.length<60){o.push(y+'-'+String(m).padStart(2,'0'));if(++m>12){m=1;y++}}return o}
/* Batch: 1 bulan atau multi bulan, karyawan semua atau satu, selalu keluar sebagai 1 file */
function slBatch(){const db=slDB(),ks=slKeys().slice().reverse(),multi=SL.mMode==='multi',q=slN(SL.q),all=SL.mEmp==='*',emp=all?null:slEmps().find(e=>e.k===SL.mEmp),items=[],miss=[];
  const months=multi?slMonths(ks.includes(SL.mFrom)?SL.mFrom:ks[0],ks.includes(SL.mTo)?SL.mTo:ks[ks.length-1]):(db.periods[SL.per]?[SL.per]:[]);
  const keep=r=>(!SL.unit||r.unit===SL.unit)&&(!q||slN(r.nama+' '+r.nik+' '+r.jab).includes(q));
  if(!all&&!emp)return{items,miss,months,emp:null,all,multi};
  if(!all){months.forEach(k=>{const p=db.periods[k],r=p&&slFind(p,emp);if(r)items.push({r,per:p});else miss.push(slLbl(k)+(p?' (karyawan tidak ada di bulan ini)':' (data belum diimport)'))})}
  else if(!multi){const p=db.periods[SL.per];if(p)p.rows.filter(keep).forEach(r=>items.push({r,per:p}))}
  else{const g=new Map();months.forEach(k=>{const p=db.periods[k];if(!p){miss.push(slLbl(k)+' (data belum diimport)');return}p.rows.filter(keep).forEach(r=>{const e=slEk(r);if(!g.has(e))g.set(e,[]);g.get(e).push({r,per:p})})});g.forEach(a=>a.forEach(x=>items.push(x)))}
  return{items,miss,months,emp,all,multi}}
function slBName(b){const ms=[...new Set(b.items.map(x=>x.per.key))].sort(),lb=k=>(b.items.find(x=>x.per.key===k)||{per:{}}).per.label||slLbl(k),span=ms.length>1?lb(ms[0])+' s.d. '+lb(ms[ms.length-1]):(ms[0]?lb(ms[0]):''),
  who=b.all?(b.items.length===1?b.items[0].r.nama:'Semua Karyawan'+(SL.unit?' '+SL.unit:'')):b.emp.nama;
  return('Slip Gaji '+span+' - '+who).replace(/[\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim()}
function slDrawMulti(){const el=$('#slMulti');if(!el)return;const db=slDB(),ks=slKeys().slice().reverse(),emps=slEmps();if(!ks.length||!emps.length)return;
  if(SL.mMode!=='multi')SL.mMode='one';
  if(SL.mEmp!=='*'&&!emps.some(e=>e.k===SL.mEmp))SL.mEmp='*';
  if(!SL.mFromU||!ks.includes(SL.mFrom))SL.mFrom=ks[0];if(!SL.mToU||!ks.includes(SL.mTo))SL.mTo=ks[ks.length-1];
  const multi=SL.mMode==='multi',per=db.periods[SL.per],op=s=>ks.map(x=>`<option value="${x}" ${x===s?'selected':''}>${esc(db.periods[x].label)}</option>`).join('');
  el.innerHTML=`<h3>Cetak / Unduh PDF</h3><div class="mdl" role="radiogroup" aria-label="Jumlah bulan"><label class="mo ${multi?'':'on'}"><input type="radio" name="mMode" value="one" ${multi?'':'checked'}><span><b>1 bulan</b><small>Mengikuti Bulan slip di atas${per?': '+esc(per.label):''}</small></span></label><label class="mo ${multi?'on':''}"><input type="radio" name="mMode" value="multi" ${multi?'checked':''}><span><b>Multi bulan</b><small>Pilih rentang bulan, mis. Januari sampai Juni</small></span></label></div>
  <div class="rw"><label class="fld" style="flex:1;min-width:220px">Karyawan<select id="mEmp"><option value="*" ${SL.mEmp==='*'?'selected':''}>Semua karyawan${SL.unit||SL.q?' (sesuai filter di atas)':''}</option>${emps.map(e=>`<option value="${esc(e.k)}" ${e.k===SL.mEmp?'selected':''}>${esc(e.nama)}${e.jab?' · '+esc(e.jab):''}</option>`).join('')}</select></label>${multi?`<label class="fld">Dari bulan<select id="mFrom">${op(SL.mFrom)}</select></label><label class="fld">Sampai bulan<select id="mTo">${op(SL.mTo)}</select></label>`:''}<label class="ck" style="align-self:flex-end;margin:0"><input type="checkbox" id="mKas" ${SL.kas?'checked':''}><span>Tampilkan saldo kasbon di slip<small>Saldo awal, potongan, dan sisa kasbon</small></span></label><span class="sp"></span><div class="rw" style="align-self:flex-end"><button class="bt" data-a="mPrint">${slI('pr')} Cetak</button><button class="bt p" data-a="mPdf">${slI('dl')} <span id="mPdfT">Unduh 1 PDF</span></button></div></div><small id="mSum" style="color:var(--mu);display:block;margin-top:8px"></small>`;slMultiSum()}
function slMultiSum(){const s=$('#mSum');if(!s)return;const b=slBatch(),n=b.items.length,ne=new Set(b.items.map(x=>slEk(x.r))).size,nm=new Set(b.items.map(x=>x.per.key)).size;
  const sep=b.all&&ne>1,bp=$('[data-a=mPrint]'),bt=$('#mPdfT');if(bt)bt.textContent=sep?'Unduh PDF per karyawan (ZIP)':'Unduh 1 PDF';if(bp){bp.disabled=sep;bp.title=sep?'Cetak massal dinonaktifkan karena slip gaji rahasia. Pilih satu karyawan untuk mencetak.':''}
  s.innerHTML=(n?(sep?`Slip gaji bersifat rahasia, jadi <b>tidak digabung</b>: hasilnya 1 file ZIP berisi <b>${ne} PDF terpisah</b>, satu per karyawan${nm>1?' ('+nm+' bulan per PDF)':''}, total ${n} halaman. Cetak langsung dinonaktifkan untuk pilihan ini.`:`Hasilnya <b>1 file PDF ringan</b> berisi ${n} halaman (1 slip = 1 halaman): ${ne} karyawan${nm>1?', '+nm+' bulan':''}. Nama file: ${esc(slBName(b))}.pdf`):'Tidak ada slip pada pilihan ini.')+(b.multi&&slKeys().length<2?`<br><span style="color:#b45309">Baru 1 bulan gaji tersimpan, jadi PDF hanya berisi 1 bulan. Import Excel bulan lain dulu di tab Import Data Gaji.</span>`:'')+(b.miss.length?`<br><span style="color:#b45309">Dilewati: ${esc(b.miss.join(', '))}</span>`:'')}
/* ---------- PDF ringan: dibuat langsung, tanpa gambar, tanpa internet ---------- */
const SLW_R=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const SLW_B=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const slAsc=s=>String(s==null?'':s).replace(/[–—]/g,'-').replace(/×/g,'x').replace(/[·•]/g,'-').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'?');
const SLW_I=SLW_R;
const slEsc=s=>s.replace(/[\\()]/g,'\\$&');
const slTw=(s,z,b)=>{const w=b===2?SLW_I:b?SLW_B:SLW_R;let n=0;for(const c of s)n+=w[c.charCodeAt(0)-32]||556;return n*z/1000};
function slWrap(s,mw,z,b){s=slAsc(s);const out=[];let cur='';s.split(/\s+/).forEach(w=>{const x=cur?cur+' '+w:w;if(cur&&slTw(x,z,b)>mw){out.push(cur);cur=w}else cur=x});if(cur)out.push(cur);return out}
function slLitePage(r,per,cfg,imgs){const o=cfg.o,K=slKop(r,cfg),ops=[],H=842,PW=595,L=40,R=555,Wd=R-L,lg=imgs&&K.logo?imgs.get(K.logo):null,hx=lg?L+68:L;let y=0;
  const NV=[.043,.165,.263],GD=[.055,.455,.565],GL=[.80,.90,.95],BG=[.965,.972,.984],BR=[.69,.43,.47],LN=[.85,.87,.91],WT=[1,1,1],MU=[.40,.44,.52];
  const g=v=>(+v).toFixed(3).replace(/\.?0+$/,'')||'0';
  const cl=c=>Array.isArray(c)?c.map(g).join(' '):g(c||0);
  const fill=c=>cl(c)+(Array.isArray(c)?' rg':' g'),strk=c=>cl(c)+(Array.isArray(c)?' RG':' G');
  const rc=(x,yy,w,h,f,s,lw)=>ops.push((f?fill(f)+' ':'')+(s?strk(s)+' '+(lw||.6)+' w ':'')+`${g(x)} ${g(H-yy-h)} ${g(w)} ${g(h)} re ${f&&s?'B':f?'f':'S'}`);
  const tx=(x,yy,s,z,b,al,c)=>{s=slAsc(s);const w=slTw(s,z,b);const px=al==='r'?x-w:al==='c'?x-w/2:x;ops.push(`BT ${fill(c||0)} /F${b===2?3:b?2:1} ${z} Tf ${g(px)} ${g(H-yy)} Td (${slEsc(s)}) Tj ET`)};
  const ln=(x1,yy,x2,w,c)=>ops.push(`${strk(c||LN)} ${w||.5} w ${g(x1)} ${g(H-yy)} m ${g(x2)} ${g(H-yy)} l S`);
  const money=v=>{v=+v||0;const q=o.sen?Math.round(v*100)/100:Math.round(v);return q===0?'-':q<0?'('+slF(-q,o.sen)+')':slF(q,o.sen)};
  const det=(t0,u)=>{const q=t0[0],rt=t0[1];return q&&rt&&(q>1||(q===1&&u))?`${slF(q,q%1)}${u?' '+u:''} x Rp ${slF(rt,rt%1!==0)}`:''};
  const pt=per.start&&per.end?`Periode ${fdt(per.start)} - ${fdt(per.end)}`:'';
  const no='SG/'+String(per.key||'').replace('-','')+'/'+String(r.no).padStart(3,'0');
  /* ===== pita aksen + kop surat (putih) ===== */
  const INK=[.12,.16,.23],GR=[.62,.64,.70],TE=GD,RS=[.64,.33,.39],TT=[.918,.958,.969],RT=[.973,.937,.943],one=(v,mw,b,z)=>slWrap(String(v==null||v===''?'-':v),mw,z||9.5,b)[0]||'-';
  const clip=(v,mw,b,z)=>{let t=slAsc(v==null||v===''?'-':v),zz=z;while(zz>7.5&&slTw(t,zz,b)>mw)zz-=.25;if(slTw(t,zz,b)>mw){while(t.length>1&&slTw(t+'..',zz,b)>mw)t=t.slice(0,-1);t=t.trim()+'..'}return[t,zz]};
  rc(0,0,PW*.72,5,NV);rc(PW*.72,0,PW*.28,5,TE);
  if(lg){const sc=Math.min(48/lg.w,48/lg.h),dw=lg.w*sc,dh=lg.h*sc;ops.push(`q ${g(dw)} 0 0 ${g(dh)} ${g(L+24-dw/2)} ${g(H-49-dh/2)} cm /Im${lg.n} Do Q`)}
  tx(hx,43,slTitle(K.name||''),14,1,'l',NV);slWrap(K.addr||'',300-(lg?64:0),8.5).slice(0,2).forEach((l,i)=>tx(hx,57+i*10.5,l,8.5,0,'l',MU));
  tx(R,42,'Slip Gaji',22,1,'r',NV);tx(R,59,per.label||slLbl(per.key),10.5,1,'r',TE);tx(R,72,pt||('No. '+no),8.5,0,'r',MU);if(pt)tx(R,83,'No. '+no,8.5,0,'r',MU);
  ln(L,98,R,1.4,NV);
  /* ===== kartu karyawan ===== */
  y=114;const al=(o.addr&&r.alamat)?slWrap(r.alamat,Wd-90,9.5).slice(0,2):[],ch=al.length?134+(al.length-1)*11:114;
  rc(L,y,Wd,ch,BG,LN,.5);rc(L,y,3.5,ch,NV);
  tx(L+16,y+23,slTitle(r.nama),14.5,1,'l',NV);tx(L+16,y+37,one(slTitle(r.jab),300,0,10),10,0,'l',MU);
  tx(R-14,y+17,'Kehadiran',8,0,'r',MU);tx(R-14,y+33,slF(r.hadir,r.hadir%1)+' hari',12.5,1,'r',TE);
  ln(L+16,y+46,R-14,.4,LN);
  const cell=(x,yy,lb,v,mw)=>{const c=clip(v,mw||160,1,10);tx(x,yy,lb,8,0,'l',MU);tx(x,yy+12,c[0],c[1],1,'l',INK)};
  cell(L+16,y+60,'NIK',r.nik);cell(L+190,y+60,'No. KTP',slMask(r.ktp,'*'));cell(L+372,y+60,'Status PTKP',r.ptkp,R-14-(L+372));
  cell(L+16,y+88,'Tgl. Bergabung',r.join?fdt(r.join):'-');cell(L+190,y+88,'Masa Kerja',slTenure(r.join,per.end));cell(L+372,y+88,'Unit / Outlet',slTitle(r.unit||K.name),R-14-(L+372));
  if(al.length){tx(L+16,y+122,'Alamat',8,0,'l',MU);al.forEach((l,i)=>tx(L+66,y+122+i*11,l,9.5,0,'l',INK))}
  y+=ch+14;
  /* ===== ringkasan: 3 kartu angka ===== */
  const tw=(Wd-24)/3,tile=(x,lb,v,fillc,barc,txc,lc,bar)=>{rc(x,y,tw,54,fillc);if(bar)rc(x,y,3.5,54,barc);tx(x+14,y+19,lb,8.5,0,'l',lc);tx(x+14,y+42,'Rp '+(+v?money(v):'0'),16,1,'l',txc)};
  tile(L,'Total Pendapatan',r.tp,TT,TE,TE,MU,1);tile(L+tw+12,'Total Potongan',r.tpot,RT,RS,RS,MU,1);tile(L+2*(tw+12),'Gaji Bersih Diterima',r.net,NV,NV,WT,[.80,.90,.95],0);
  y+=54+13;
  slWrap('Terbilang: '+slWords(r.net,o.sen),Wd,8.5,2).slice(0,2).forEach((l,i)=>{tx(L,y+i*10.5,l,8.5,2,'l',[.28,.33,.41])});
  y+=(Math.min(2,slWrap('Terbilang: '+slWords(r.net,o.sen),Wd,8.5,2).length))*10.5+12;
  /* ===== rincian: pendapatan | potongan ===== */
  const colW=(Wd-20)/2,xA=L,xB=L+colW+20;
  const mk=(x,title,c,rows)=>{let yy=y;rc(x,yy,colW,21,c);tx(x+9,yy+14.5,title,10.5,1,'l',WT);tx(x+colW-8,yy+14.5,'Jumlah (Rp)',8,0,'r',[.92,.95,.97]);yy+=21;
    rows.forEach(q=>{const lb=q[0],dt=q[1],v=q[2],z=q[3],h=dt?27:20;
      tx(x+8,yy+(dt?12:13.5),lb,9.5,v===null?2:0,'l',z||v===null?GR:INK);if(dt)tx(x+8,yy+22,one(dt,colW-90,0,8),8,0,'l',MU);
      if(v!==null)tx(x+colW-8,yy+(dt?12:13.5),money(v),9.5,0,'r',z?GR:INK);ln(x,yy+h,x+colW,.4,LN);yy+=h});return yy};
  const er=[['Gaji Pokok (Basic)','',r.e.basic[2],0]];SL_E.forEach(([kk,l,u])=>{const t0=r.e[kk]||[0,0,0];if(!t0[2]&&!o.zero)return;er.push([l,det(t0,u),t0[2],!t0[2]])});
  const dr=[];SL_D.forEach(([kk,l,u])=>{let v,d2='';if(kk==='kas')v=r.d.kas[1];else{const t0=r.d[kk]||[0,0,0];v=t0[2];d2=det(t0,u);if(kk==='pph'){const x=[];if(r.ter)x.push('Tarif TER '+slF(r.ter,r.ter%1!==0).replace(/,00$/,'')+'%');if(r.e.pjk[2]>0&&Math.abs(r.e.pjk[2]-v)<1)x.push('dikompensasi Tunj. Pajak');d2=x.join(', ')}}
    if(!v&&!o.zero)return;dr.push([l,d2,v,!v])});
  if(!dr.length)dr.push(['Tidak ada potongan bulan ini','',null,0]);
  const yA=mk(xA,'Pendapatan',TE,er),yB=mk(xB,'Potongan',RS,dr),yE=Math.max(yA,yB);
  const tot=(x,lb,v,tint,c)=>{rc(x,yE,colW,26,tint);ln(x,yE,x+colW,1.2,c);tx(x+8,yE+17,lb,10,1,'l',NV);tx(x+colW-8,yE+17,'Rp '+(+v?money(v):'0'),10.5,1,'r',NV)};
  tot(xA,'Total Pendapatan',r.tp,TT,TE);tot(xB,'Total Potongan',r.tpot,RT,RS);
  y=yE+26+20;
  /* ===== kartu informasi tambahan ===== */
  const fm=v=>v?'Rp '+money(v):'-',cards=[],ks=r.d.kas||[0,0,0],cu=r.cuti||[0,0,0],dy=v=>slF(v,v%1)+' hari';
  if(o.bank&&(r.bank.no||r.bank.bk))cards.push(['Transfer Gaji',[['Bank',r.bank.bk||'-'],['No. Rekening',r.bank.no||'-'],['Atas Nama',slTitle(r.bank.an||r.nama)]],TE]);
  if(SL.kas&&(ks[0]||ks[1]||ks[2]))cards.push(['Saldo Kasbon',[['Saldo Awal',fm(ks[0])],['Dipotong Bulan Ini',fm(ks[1])],['Sisa Saldo',fm(ks[2])]],RS]);
  if(cards.length){const n=cards.length,cwid=(Wd-(n-1)*12)/n;
    cards.forEach((cd,i)=>{const x=L+i*(cwid+12);rc(x,y,cwid,70,BG,LN,.5);rc(x,y,cwid,2.6,cd[2]);tx(x+10,y+18,cd[0],9.5,1,'l',NV);
      cd[1].forEach((q,j)=>{const lw=slTw(slAsc(q[0]),8,0)+8;tx(x+10,y+34+j*13,q[0],8,0,'l',MU);{const c=clip(q[1],cwid-20-lw,1,8.5);tx(x+cwid-10,y+34+j*13,c[0],c[1],1,'r',INK)}})});
    y+=70+14}
  if(o.thr&&r.thr>0){rc(L,y,3,12,TE);tx(L+9,y+9.5,'Alokasi THR bulan ini: ',8.5,1,'l',NV);tx(L+9+slTw('Alokasi THR bulan ini: ',8.5,1),y+9.5,'Rp '+money(r.thr)+' (cadangan, bukan potongan)',8.5,0,'l',MU);y+=22}
  /* ===== tanda tangan ===== */
  if(o.sign){const sy=Math.max(y+10,664);tx(465,sy,'Diterima Oleh,',9.5,0,'c',MU);ln(395,sy+50,535,.6,NV);tx(465,sy+62,one(slTitle(r.nama),150,1),10,1,'c',NV);tx(465,sy+73,'Karyawan',8.5,0,'c',MU)}
  /* ===== kaki ===== */
  ln(L,792,R,.6,LN);slWrap(cfg.note||'',Wd-130,7.5,0).slice(0,2).forEach((l,i)=>tx(L,804+i*9.5,l,7.5,0,'l',MU));
  tx(R,804,'Dicetak '+new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),7.5,0,'r',MU);
  rc(0,H-5,PW*.72,5,NV);rc(PW*.72,H-5,PW*.28,5,TE);
  return{c:ops.join('\n'),lg}}
async function slLogoPrep(items,cfg){const m=new Map();let n=0;
  for(const x of items){let K;try{K=slKop(x.r,cfg)}catch(e){continue}if(!K.logo||m.has(K.logo))continue;
    try{const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=K.logo});
      const s=Math.min(1,240/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(1,Math.round(im.naturalWidth*s)),h=Math.max(1,Math.round(im.naturalHeight*s)),cv=document.createElement('canvas');cv.width=w;cv.height=h;
      const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,w,h);c.drawImage(im,0,0,w,h);
      const b=atob(cv.toDataURL('image/jpeg',.9).split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
      m.set(K.logo,{w,h,bytes:u,n:++n})}catch(e){m.set(K.logo,null)}}
  return m}
function slLiteBuild(items,cfg,imgs){const n=items.length,pg=items.map(x=>slLitePage(x.r,x.per,cfg,imgs)),used=[...new Set(pg.map(p=>p.lg).filter(Boolean))],parts=[],off=[];let pos=0;
  const put=s=>{const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;parts.push(u);pos+=u.length},putB=u=>{parts.push(u);pos+=u.length};
  const ib=6+2*n,total=ib+used.length,obj=(id,fn)=>{off[id]=pos;put(id+' 0 obj\n');fn();put('\nendobj\n')},font=(id,nm)=>obj(id,()=>put(`<< /Type /Font /Subtype /Type1 /BaseFont /${nm} /Encoding /WinAnsiEncoding >>`));
  put('%PDF-1.4\n');
  obj(1,()=>put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>put(`<< /Type /Pages /Kids [${items.map((_,i)=>(6+2*i)+' 0 R').join(' ')}] /Count ${n} >>`));
  font(3,'Helvetica');font(4,'Helvetica-Bold');font(5,'Helvetica-Oblique');
  pg.forEach((p,i)=>{obj(6+2*i,()=>put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>${p.lg?` /XObject << /Im${p.lg.n} ${ib+used.indexOf(p.lg)} 0 R >>`:''} >> /Contents ${7+2*i} 0 R >>`));
    obj(7+2*i,()=>put(`<< /Length ${p.c.length} >>\nstream\n${p.c}\nendstream`))});
  used.forEach((m,j)=>obj(ib+j,()=>{put(`<< /Type /XObject /Subtype /Image /Width ${m.w} /Height ${m.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${m.bytes.length} >>\nstream\n`);putB(m.bytes);put('\nendstream')}));
  const xr=pos;put(`xref\n0 ${total}\n0000000000 65535 f \n`);for(let i=1;i<total;i++)put(String(off[i]).padStart(10,'0')+' 00000 n \n');
  put(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);return new Blob(parts,{type:'application/pdf'})}
async function slPdfItems(items,name){if(!items.length)return toast('Tidak ada slip pada pilihan ini');
  try{const cfg=slDB().cfg,imgs=await slLogoPrep(items,cfg),blob=slLiteBuild(items,cfg,imgs);slDl(blob,name+'.pdf');toast('PDF diunduh ('+items.length+' halaman, 1 file, '+Math.max(1,Math.round(blob.size/1024))+' KB)')}
  catch(e){toast('PDF gagal dibuat: '+e.message)}}

/* ZIP tanpa kompresi: tiap karyawan = 1 PDF sendiri (slip gaji rahasia, tidak digabung) */
const slCrcT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const slCrc=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=slCrcT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function slZip(files){const enc=new TextEncoder(),parts=[],cen=[];let pos=0;const d=new Date(),dt=((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xFFFF,dd=(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xFFFF;
  files.forEach(f=>{const nm=enc.encode(f.name),crc=slCrc(f.bytes),sz=f.bytes.length,h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,dt,true);h.setUint16(12,dd,true);h.setUint32(14,crc,true);h.setUint32(18,sz,true);h.setUint32(22,sz,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer),nm,f.bytes);
    const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,dt,true);c.setUint16(14,dd,true);c.setUint32(16,crc,true);c.setUint32(20,sz,true);c.setUint32(24,sz,true);c.setUint16(28,nm.length,true);c.setUint32(42,pos,true);
    cen.push(new Uint8Array(c.buffer),nm);pos+=30+nm.length+sz});
  const cs=cen.reduce((a,u)=>a+u.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,pos,true);
  return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'})}
async function slPdfZip(m){if(!m.items.length)return toast('Tidak ada slip pada pilihan ini');
  try{const cfg=slDB().cfg,imgs=await slLogoPrep(m.items,cfg),g=new Map();m.items.forEach(x=>{const k=slEk(x.r);if(!g.has(k))g.set(k,[]);g.get(k).push(x)});
    const files=[],used=new Set();
    for(const its of g.values()){const bytes=new Uint8Array(await slLiteBuild(its,cfg,imgs).arrayBuffer());let nm=slBName({items:its,all:false,emp:{nama:its[0].r.nama}}),u=nm,i=2;while(used.has(u.toLowerCase()))u=nm+' ('+i++ +')';used.add(u.toLowerCase());files.push({name:u+'.pdf',bytes})}
    const zb=slZip(files),mons=[...new Set(m.items.map(x=>x.per.key))].sort(),zn=('Slip Gaji '+(mons.length>1?slLbl(mons[0])+' s.d. '+slLbl(mons[mons.length-1]):slLbl(mons[0]))+(SL.unit?' - '+SL.unit:'')+' - per karyawan').replace(/[\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim();
    slDl(zb,zn+'.zip');toast('ZIP diunduh: '+files.length+' PDF terpisah, 1 per karyawan')}
  catch(e){toast('ZIP gagal dibuat: '+e.message)}}
/* ---------- tampilan aplikasi ---------- */
const slMon=n=>'Rp '+slF(n,1).replace(/,00$/,'');
const slTabs=t=>`<div class="tabs" role="tablist">${[['slip','Slip Gaji'],['slimp','Import Data Gaji'],['slset','Pengaturan Slip']].map(([k,l])=>`<button data-a="tab" data-k="${k}" class="${k===t?'on':''}" role="tab">${l}</button>`).join('')}</div>`;
function slRender(){const el=$('#slv');if(!el)return;SL.inited||slInit();const t=SL.tab==='slimp'||SL.tab==='slset'?SL.tab:'slip',h=t==='slip'?slViewSlip():t==='slimp'?slViewImp():slViewSet();
  el.innerHTML=`<div>${h}</div>`;if(t==='slip'&&slKeys().length){slDrawList();slDrawPv();slDrawMulti()}if(t==='slset')slDrawSet()}
function slViewSlip(){const db=slDB(),ks=slKeys();
  const hd=`<h2>Slip Gaji</h2><p class="sb">Pilih bulan dan karyawan. Banyak slip sekaligus: pakai Cetak / Unduh PDF (1 file).</p>`+slTabs('slip');
  if(!ks.length)return hd+`<div class="bx em"><b style="display:block;font-size:15px;color:var(--ink);margin-bottom:4px">Belum ada data gaji</b>Import file Excel gaji dulu, slip gaji akan dibuat otomatis per karyawan.<br><br><button class="bt p" data-a="tab" data-k="slimp">${slI('up')} Import Data Gaji</button></div>`;
  if(!db.periods[SL.per])SL.per=ks[0];const per=db.periods[SL.per],units=[...new Set(per.rows.map(r=>r.unit))];if(SL.unit&&!units.includes(SL.unit))SL.unit='';
  return hd+`<div class="bx"><div class="rw"><label class="fld">Bulan slip<select id="slPer">${ks.map(k=>`<option value="${k}" ${k===SL.per?'selected':''}>${esc(db.periods[k].label)} · ${db.periods[k].rows.length} karyawan</option>`).join('')}</select></label>${units.length>1?`<label class="fld">Unit<select id="slUnit"><option value="">Semua unit</option>${units.map(u=>`<option ${u===SL.unit?'selected':''}>${esc(u)}</option>`).join('')}</select></label>`:''}${slOutNames().length?`<label class="fld">Outlet pada kop<select id="slKop"><option value="">Otomatis (outlet karyawan)</option>${slOutNames().map(n=>`<option ${n===db.cfg.kop?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`:''}<label class="fld" style="flex:1;min-width:180px">Cari karyawan<input type="text" id="slQ" placeholder="Nama, NIK, atau jabatan" value="${esc(SL.q)}" autocomplete="off"></label></div>${per.start&&per.end?`<small style="color:var(--mu);display:block;margin-top:8px">Periode penggajian ${esc(fdt(per.start))} sampai ${esc(fdt(per.end))}</small>`:''}</div>
  <div class="bx" id="slMulti"></div>
  <div class="wk"><div class="ls"><div class="hd"><b id="slCnt"></b><br><small id="slTot"></small></div><div class="lb" id="slList"></div></div><div class="pv" id="slPv"></div></div>`}
function slDrawList(){const l=$('#slList');if(!l)return;const rows=slFiltered();if(!rows.some(r=>r.id===SL.sel))SL.sel=rows[0]?rows[0].id:null;
  $('#slCnt').textContent=rows.length+' karyawan';$('#slTot').textContent='Total gaji bersih '+slMon(rows.reduce((a,r)=>a+r.net,0));
  l.innerHTML=rows.length?rows.map(r=>`<button class="it ${r.id===SL.sel?'on':''}" data-a="sel" data-id="${esc(r.id)}"><div class="av">${esc(ini(r.nama))}</div><div class="m"><b>${esc(r.nama)}</b><small>${esc(r.jab||'–')}</small></div><span class="am">${slF(r.net,0)}</span></button>`).join(''):'<div class="em">Tidak ada karyawan yang cocok.</div>'}
function slDrawPv(){const pv=$('#slPv');if(!pv)return;const db=slDB(),per=db.periods[SL.per],r=slFiltered().find(x=>x.id===SL.sel);
  if(!r){pv.innerHTML='<div class="bx em">Pilih karyawan di sebelah kiri.</div>';return}
  pv.innerHTML=`<div class="pvh"><div><b>${esc(r.nama)}</b><br><small>${esc(per.label)} · Gaji bersih ${esc(slMon(r.net))}</small></div><span class="sp"></span><button class="bt" data-a="print">${slI('pr')} Cetak</button><button class="bt p" data-a="pdf">${slI('dl')} Unduh PDF slip ini</button></div>${r.w&&r.w.length?`<div class="wn">Perlu dicek di Excel: ${esc(r.w.join('; '))}</div>`:''}<div class="paper" id="slPaper">${slSlip(r,per,db.cfg)}</div>`;slZoom()}
function slZoom(){const p=$('#slPaper');if(!p)return;const s=p.firstElementChild;if(!s)return;const w=p.clientWidth-(innerWidth<=860?16:36);if(w<=0)return;const z=Math.min(1,w/794);s.style.zoom=z}
addEventListener('resize',()=>{if(mod===-5)slZoom()});
function slViewImp(){const db=slDB(),imp=SL.imp,ks=slKeys();
  let h=`<h2>Import Data Gaji</h2><p class="sb">Import file Excel worksheet gaji. Bulan slip diambil dari tanggal akhir periode di file dan bisa Anda ubah sebelum disimpan. Anda bisa memilih beberapa file sekaligus, atau satu file dengan beberapa sheet bulan berbeda: tiap sheet disimpan ke bulannya sendiri. Import berikutnya menambah pilihan bulan, data bulan lama tetap tersimpan.</p>`+slTabs('slimp');
  h+=`<div class="bx"><h3>1. Pilih file Excel</h3><label class="dz" id="slDz" for="slFile"><b>Klik di sini atau seret satu atau beberapa file Excel ke sini</b>Format .xlsx, .xls, atau .csv dengan susunan kolom seperti worksheet gaji</label><input id="slFile" type="file" accept=".xlsx,.xls,.csv" multiple hidden></div>`;
  if(imp){const all=imp.parts.flatMap(p=>p.rows),sum=k=>all.reduce((a,r)=>a+r[k],0),bad=all.filter(r=>r.w&&r.w.length),ks2=[...new Set(imp.parts.map(p=>p.key))].sort(),ex=ks2.filter(k=>db.periods[k]);
    h+=`<div class="bx"><h3>2. Periksa, lalu simpan</h3><div class="stt"><div><small>Karyawan</small><b>${all.length}</b></div><div><small>Total pendapatan</small><b>${esc(slMon(sum('tp')))}</b></div><div><small>Total potongan</small><b>${esc(slMon(sum('tpot')))}</b></div><div><small>Total gaji bersih</small><b>${esc(slMon(sum('net')))}</b></div></div>
    <div class="tw" style="margin-bottom:8px"><table class="tb"><thead><tr><th>Sheet / Unit</th><th>File</th><th>Periode di file</th><th>Bulan slip</th><th class="n">Karyawan</th></tr></thead><tbody>${imp.parts.map((p,i)=>{const mo=+p.key.slice(5,7),yr=+p.key.slice(0,4);return`<tr><td>${esc(p.unit)}</td><td>${esc(p.file||'')}</td><td>${p.end?esc(fdt(p.start))+' sampai '+esc(fdt(p.end)):'tidak terbaca'}</td><td><div class="rw" style="gap:6px;flex-wrap:nowrap"><select data-pm="${i}" aria-label="Bulan slip">${BLN.slice(1).map((n,x)=>`<option value="${x+1}" ${x+1===mo?'selected':''}>${n}</option>`).join('')}</select><input type="number" data-py="${i}" value="${yr}" min="2000" max="2100" style="width:84px" aria-label="Tahun"></div></td><td class="n">${p.rows.length}</td></tr>`}).join('')}</tbody></table></div>
    ${ex.length?`<div class="wn">Bulan ${esc(ex.map(slLbl).join(', '))} sudah ada. Jika disimpan, data unit yang sama akan diganti.</div>`:''}
    ${bad.length?`<div class="wn"><b>${bad.length} baris perlu dicek</b> (tetap bisa disimpan):<ul>${bad.slice(0,6).map(r=>`<li>${esc(r.nama)}: ${esc(r.w.join('; '))}</li>`).join('')}${bad.length>6?`<li>dan ${bad.length-6} baris lainnya</li>`:''}</ul></div>`:`<div class="ok">Semua baris konsisten: total pendapatan, potongan, dan gaji bersih cocok.</div>`}
    ${imp.skipped.length?`<div class="wn">Sheet dilewati: ${esc(imp.skipped.join('; '))}</div>`:''}
    <div class="tw"><table class="tb"><thead><tr><th>No</th><th>Nama</th><th>Jabatan</th><th class="n">Hadir</th><th class="n">Pendapatan</th><th class="n">Potongan</th><th class="n">Gaji bersih</th><th></th></tr></thead><tbody>${all.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.nama)}</td><td>${esc(r.jab)}</td><td class="n">${slF(r.hadir,r.hadir%1)}</td><td class="n">${slF(r.tp,1)}</td><td class="n">${slF(r.tpot,1)}</td><td class="n"><b>${slF(r.net,1)}</b></td><td>${r.w&&r.w.length?'⚠':'✓'}</td></tr>`).join('')}</tbody></table></div>
    <div class="rw" style="margin-top:12px"><span class="sp"></span><button class="bt" data-a="impNo">Batal</button><button class="bt p" data-a="impOk">Simpan ${ks2.length>1?ks2.length+' bulan: '+esc(ks2.map(slLbl).join(', ')):'sebagai '+esc(slLbl(ks2[0]))}</button></div></div>`}
  h+=`<div class="bx"><h3>Bulan tersimpan</h3>${ks.length?ks.map(k=>{const p=db.periods[k];return`<div class="pl"><div class="m"><b>${esc(p.label)}</b><small>${p.rows.length} karyawan · bersih ${esc(slMon(p.rows.reduce((a,r)=>a+r.net,0)))}${p.start?' · periode '+esc(fdt(p.start))+' sampai '+esc(fdt(p.end)):''}</small></div><button class="bt" data-a="perOpen" data-k="${k}">Buka slip</button><button class="bt d" data-a="perDel" data-k="${k}" aria-label="Hapus ${esc(p.label)}">${slI('tr')}</button></div>`}).join(''):'<div class="em">Belum ada bulan tersimpan.</div>'}</div>`;
  return h}
const SL_OPT=[['bank','Rekening transfer','Bank, nomor rekening, dan atas nama'],['addr','Alamat karyawan',''],['thr','Informasi alokasi THR','Hanya informasi, tidak mengurangi gaji'],['zero','Tampilkan komponen bernilai nol','Baris tunjangan atau potongan yang Rp 0'],['sen','Nominal dengan sen','Mati: dibulatkan ke rupiah penuh'],['sign','Kolom tanda tangan karyawan','Hanya kolom penerima (karyawan yang bersangkutan)']];
function slViewSet(){const c=slDB().cfg;const f=(id,l,v,p)=>`<label class="fld">${l}<input type="text" data-cf="${id}" value="${esc(v)}" placeholder="${esc(p||'')}"></label>`;
  return`<h2>Pengaturan Slip</h2><p class="sb">Atur identitas perusahaan, tanda tangan, dan informasi yang tampil di slip. Perubahan tersimpan otomatis dan langsung terlihat di contoh.</p>`+slTabs('slset')+`<div class="wk st"><div><div class="bx"><h3>Identitas</h3><div style="display:grid;gap:10px">${f('company','Nama cadangan (jika outlet tidak ditemukan)',c.company,'Kosong = nama sheet Excel')}${f('address','Alamat cadangan (jika outlet tidak ditemukan)',c.address,'Jl. ... , Kota')}<label class="fld">Catatan kaki<textarea data-cf="note" rows="3">${esc(c.note)}</textarea></label></div></div>
  <div class="bx"><h3>Isi slip</h3>${SL_OPT.map(([k,l,s])=>`<label class="ck"><input type="checkbox" data-op="${k}" ${c.o[k]?'checked':''}><span>${l}${s?`<small>${s}</small>`:''}</span></label>`).join('')}</div></div><div class="pv"><div class="pvh"><b>Contoh tampilan</b><small>${slKeys().length?'memakai data karyawan pertama':'data contoh'}</small></div><div class="paper" id="slPaper"></div></div></div>`}
function slDrawSet(){const p=$('#slPaper');if(!p)return;const db=slDB(),k=slKeys()[0],per=k?db.periods[k]:{key:new Date().toISOString().slice(0,7),label:slLbl(new Date().toISOString().slice(0,7)),start:'',end:''},r=k&&db.periods[k].rows[0]?db.periods[k].rows[0]:slSample();p.innerHTML=slSlip(r,per,db.cfg);slZoom()}
function slInit(){SL.inited=true;const el=$('#slv');
  el.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,db=slDB();
    if(a==='tab')goto(-5,b.dataset.k);
    else if(a==='sel'){SL.sel=b.dataset.id;const r0=slFiltered().find(x=>x.id===SL.sel);if(r0&&SL.mMode==='multi')SL.mEmp=slEk(r0);slDrawList();slDrawPv();slDrawMulti()}
    else if(a==='print'){const r=slFiltered().find(x=>x.id===SL.sel);if(r)slPrint([r])}
    else if(a==='pdf'){const r=slFiltered().find(x=>x.id===SL.sel);if(r)slPdf(r)}
    else if(a==='mPdf'){const m=slBatch();if(m.all&&new Set(m.items.map(x=>slEk(x.r))).size>1)slPdfZip(m);else slPdfItems(m.items,slBName(m))}
    else if(a==='mPrint'){const m=slBatch();if(m.all&&new Set(m.items.map(x=>slEk(x.r))).size>1)toast('Cetak massal dinonaktifkan (slip rahasia). Pilih satu karyawan.');else if(m.items.length)slPrintItems(m.items,slBName(m));else toast('Tidak ada slip pada pilihan ini')}
    else if(a==='impOk')slImpSave();
    else if(a==='impNo'){SL.imp=null;slRender()}
    else if(a==='perOpen'){SL.per=b.dataset.k;SL.sel=null;SL.unit='';SL.q='';goto(-5,'slip')}
    else if(a==='perDel'){const k=b.dataset.k;opaConfirm('Hapus data gaji '+slLbl(k)+'? Slip bulan ini tidak bisa dibuat lagi sebelum diimport ulang.').then(ok=>{if(!ok)return;delete db.periods[k];if(slSave()){if(SL.per===k)SL.per=null;toast('Data '+slLbl(k)+' dihapus');slRender()}})}});
  el.addEventListener('change',e=>{const t=e.target;
    if(t.id==='slPer'){SL.per=t.value;SL.sel=null;SL.unit='';slRender()}
    else if(t.id==='slKop'){const d=slDB();d.cfg.kop=t.value;slSave();slDrawPv()}
    else if(t.name==='mMode'){SL.mMode=t.value==='multi'?'multi':'one';if(SL.mMode==='multi'){if(SL.mEmp==='*'){const r0=slFiltered().find(x=>x.id===SL.sel);if(r0)SL.mEmp=slEk(r0)}}else SL.mEmp='*';slDrawMulti()}
    else if(t.id==='mKas'){SL.kas=t.checked?1:0;slDrawPv()}
    else if(t.id==='mEmp'){SL.mEmp=t.value;slMultiSum()}
    else if(t.id==='mFrom'){SL.mFrom=t.value;SL.mFromU=1;slMultiSum()}
    else if(t.id==='mTo'){SL.mTo=t.value;SL.mToU=1;slMultiSum()}
    else if(t.id==='slUnit'){SL.unit=t.value;slDrawList();slDrawPv();slDrawMulti()}
    else if(t.id==='slFile'){const fl=Array.from(t.files);t.value='';if(fl.length)slFile(fl)}
    else if(t.dataset.pm!==undefined||t.dataset.py!==undefined){const i=+(t.dataset.pm!==undefined?t.dataset.pm:t.dataset.py),m=+$('[data-pm="'+i+'"]').value,y=Math.min(2100,Math.max(2000,+$('[data-py="'+i+'"]').value||new Date().getFullYear()));SL.imp.parts[i].key=y+'-'+String(m).padStart(2,'0');slRender()}
    else if(t.dataset.op){const db=slDB();db.cfg.o[t.dataset.op]=t.checked?1:0;slSave();slDrawSet()}});
  el.addEventListener('input',e=>{const t=e.target;
    if(t.id==='slQ'){SL.q=t.value;slDrawList();slDrawPv();slDrawMulti()}
    else if(t.dataset.cf){const db=slDB();db.cfg[t.dataset.cf]=t.value;slSave();slDrawSet()}});
  const dz=()=>$('#slDz');
  el.addEventListener('dragover',e=>{if(e.target.closest('#slDz')){e.preventDefault();dz().classList.add('ov')}});
  el.addEventListener('dragleave',e=>{if(dz())dz().classList.remove('ov')});
  el.addEventListener('drop',e=>{if(e.target.closest('#slDz')){e.preventDefault();dz().classList.remove('ov');const fl=Array.from(e.dataTransfer.files);if(fl.length)slFile(fl)}})}
