const V='azmi-20261116c';
const CORE=['./','manifest.webmanifest','icon-180.png','icon-192.png','logos/bca.png','logos/bri.png','logos/blu.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const html=r.mode==='navigate'||/(\/|\.html)$/.test(u.pathname)||(r.headers.get('accept')||'').includes('text/html');
  if(html){
    // jaringan dulu supaya revisi langsung terlihat, cache sebagai cadangan offline
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))));
    return;
  }
  // aset statis: cache dulu, perbarui di belakang
  e.respondWith(caches.match(r).then(m=>{
    const n=fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>m);
    return m||n;
  }));
});
