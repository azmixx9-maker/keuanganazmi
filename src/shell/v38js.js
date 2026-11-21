
/* v38: strip KPI interaktif di dashboard */
(function(){const box=document.getElementById('dsi');if(!box)return;let busy=0;
function build(){if(busy||!box.querySelector('.dh')||box.querySelector('.kp'))return;busy=1;try{
const d=typeof data==='function'?data():null,ps=typeof pphStat==='function'?pphStat():null;if(!d)return;
const T=[['k1',d.totalEmp,'Karyawan','terdaftar','0|emp'],['k2',d.soon.length,'Perlu perpanjangan','kontrak segera berakhir','0|list'],['k3',d.nc.length+d.lt.length,'Kasus absensi','No Clock & terlambat','1|noclock'],['k4',d.rv,'Surat belum selesai','belum diceklis selesai','2|out'],['k5',ps?ps.pend+ps.bad:0,'BP21 tindakan','belum selesai di Coretax','3|a']];
const h=T.map(([c,n,l,s,g])=>`<button class="kt ${c}${n?'':' z'}" data-g="${g}"><b>${(+n||0).toLocaleString('id-ID')}</b><span>${l}</span><small>${s}</small></button>`).join('');
box.querySelector('.dh').insertAdjacentHTML('afterend','<div class="kp">'+h+'</div>')}catch(e){}finally{busy=0}}
new MutationObserver(build).observe(box,{childList:true});build()})();
