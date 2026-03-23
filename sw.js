// PWA — OFFLINE
// ════════════════════════════════════════════════════════════
window.addEventListener('online',  ()=>{ document.getElementById('offline-banner').classList.remove('show'); toast('✅ Conexión restaurada'); cargarDatos(); });
window.addEventListener('offline', ()=>{ document.getElementById('offline-banner').classList.add('show'); toast('📡 Sin conexión — modo offline','err'); });

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
window.addEventListener('load', cargarDatos);
</script>
</body>
</html>
// ============================================================
// DISPROMAX — Service Worker (PWA Offline)
// ============================================================
const CACHE = 'dispromax-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js'
];

// Instalar y cachear assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activar y limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estrategia: Network first, fallback a cache
self.addEventListener('fetch', e => {
  // No interceptar llamadas a Supabase (siempre necesitan red)
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar copia en cache si es exitoso
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
