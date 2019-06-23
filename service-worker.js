var files = [
  "index.html",
  "manifest.json",
  "css/dataTables.bootstrap.min.css",
  "css/main.css",
  "images/icons-192.png",
  "images/sort_asc.png",
  "images/sort_asc_disabled.png",
  "images/sort_both.png",
  "images/sort_desc.png",
  "images/sort_desc_disabled.png",
  "js/bootstrap.min.js",
  "js/install.js",
  "js/jquery-datepicker-pt-BR.js",
  "js/jquery-ui.min.js",
  "js/jquery.dataTables.min.js",
  "js/jquery.min.js",
  "js/main.js"
];
// dev only
if (typeof files == 'undefined') {
  var files = [];
} else {
  files.push('./');
}

var CACHE_NAME = 'cfm-v1';

self.addEventListener('activate', function(event) {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME.indexOf(cacheName) == -1) {
            console.log('[SW] Delete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('install', function(event){
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(
      	files.map(function(file){
      		return cache.add(file);
      	})
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('[SW] fetch ' + event.request.url)
  event.respondWith(
    caches.match(event.request).then(function(response){
      return response || fetch(event.request.clone());
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event);
  clients.openWindow('/');
});