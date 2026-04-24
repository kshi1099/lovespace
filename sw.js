const CACHE = "lovespace-v1";
const ASSETS = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

// Install — cache all assets
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Show notification when triggered from the page
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon } = e.data;
    self.registration.showNotification(title, {
      body,
      icon: icon || "./icon-192.png",
      badge: "./icon-192.png",
      tag: "love-note",
      renotify: true,
      vibrate: [200, 100, 200],
    });
  }
});

// Tap on notification — focus the app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow("./index.html");
    })
  );
});
