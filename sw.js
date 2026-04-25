const CACHE = "lovespace-v2";
const ASSETS = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
self.addEventListener("message", e => {
  if (e.data?.type === "SHOW_NOTIFICATION") {
    const { title, body } = e.data;
    self.registration.showNotification(title, {
      body, icon: "./icon-192.png", badge: "./icon-192.png",
      tag: "love-note", renotify: true, vibrate: [200, 100, 200],
    });
  }
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type:"window", includeUncontrolled:true }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow("./index.html");
    })
  );
});
