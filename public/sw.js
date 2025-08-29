// public/sw.js
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let data = {};
    try {
      if (event.data) {
        try { data = event.data.json(); }
        catch { data = { body: await event.data.text() }; }
      }
    } catch {}

    const title = data.title || "Drivigo";
    const body  = data.body  || "You have a new update.";
    const url   = data.url   || "/";
    // keep icon small & valid; missing icons won’t block, but keep it simple while debugging
    await self.registration.showNotification(title, {
      body,
      data: { url },
      // comment icons out if unsure they exist at those paths during debug
      // icon: "/logo.png",
      // badge: "/logo.png",
      // requireInteraction: true, // optional for testing visibility
    });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
