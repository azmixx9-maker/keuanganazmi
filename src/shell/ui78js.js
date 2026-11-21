
/* v78: Menu Utama lebih hidup: tanggal+jam, pil status "perlu perhatian", kartu sorot kursor, pintasan angka 1-6 */
(function(){
var hm=document.getElementById('hm');if(!hm)return;
var HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var URUT=['abs','rek','kon','dok','pph','gaji'];
function p2(n){return n<10?'0'+n:''+n}
function stamp(){var d=new Date();return HARI[d.getDay()]+', '+d.getDate()+' '+BLN[d.getMonth()]+' '+d.getFullYear()+' \u00b7 '+p2(d.getHours())+'.'+p2(d.getMinutes())}
function perhatian(){var n=0;hm.querySelectorAll('.tl .bd:not(.ok) i[data-cu]').forEach(function(e){n+=(+e.dataset.cu)||0});return n}
function enhance(){
 var gr=hm.querySelector('.gr');if(!gr||gr.dataset.e78)return;gr.dataset.e78='1';
 var bks=gr.querySelector('.bks');
 if(bks){var s=document.createElement('small');s.className='dt78';s.textContent=stamp();bks.parentNode.insertBefore(s,bks)}
 var n=perhatian(),b=document.createElement('button');b.type='button';b.className='stp'+(n?'':' ok');
 b.setAttribute('aria-label',n?n+' hal perlu perhatian, klik untuk menyorot':'Semua aman');
 b.innerHTML='<i aria-hidden="true"></i><span>'+(n?n+' hal perlu perhatian':'Semua aman')+'</span>';
 var pr=gr.querySelector('.pr');gr.insertBefore(b,pr||null);
 b.addEventListener('click',function(){
  var t=[].slice.call(hm.querySelectorAll('.tl')).filter(function(x){return x.querySelector('.bd:not(.ok)')});
  if(!t.length){if(window.toast)window.toast('Semua aman. Tidak ada yang perlu ditindaklanjuti.');return}
  t.forEach(function(x){x.classList.remove('ping78');void x.offsetWidth;x.classList.add('ping78')});
  setTimeout(function(){t.forEach(function(x){x.classList.remove('ping78')})},2200)})}
new MutationObserver(enhance).observe(hm,{childList:true});enhance();
setInterval(function(){hm.querySelectorAll('.dt78').forEach(function(e){e.textContent=stamp()})},20000);
hm.addEventListener('pointermove',function(e){var t=e.target.closest&&e.target.closest('.tl');if(!t)return;var r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
function terkunci(){var a=document.querySelectorAll('.lk'),i;for(i=0;i<a.length;i++){if(getComputedStyle(a[i]).display!=='none')return true}return !!document.querySelector('[role=dialog]')}
document.addEventListener('keydown',function(e){
 if(e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||!hm.classList.contains('on'))return;
 var t=e.target;if(t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName||'')||t.isContentEditable))return;
 var k=URUT[(+e.key)-1];if(!k||terkunci())return;
 var el=hm.querySelector('[data-ap="'+k+'"]');if(el){e.preventDefault();el.click()}});
})();
