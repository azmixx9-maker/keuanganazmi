
/* v79: Dashboard Suite: angka kartu ringkasan menghitung naik saat halaman tampil */
(function(){
var el=document.getElementById('dsi');if(!el)return;
function hitung(){el.querySelectorAll('.stg .sc b,.kp .kt b').forEach(function(b){
 var t=parseInt(String(b.textContent).replace(/\./g,''),10);if(!(t>0)||b.dataset.c79===String(t))return;b.dataset.c79=String(t);
 var t0=performance.now();(function f(n){var q=Math.min(1,(n-t0)/650);b.textContent=Math.round(t*(1-Math.pow(1-q,3))).toLocaleString('id-ID');if(q<1)requestAnimationFrame(f)})(t0)})}
new MutationObserver(hitung).observe(el,{childList:true});hitung();
})();
