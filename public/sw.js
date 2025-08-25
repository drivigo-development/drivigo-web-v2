// public/sw.js

// make updates take effect immediately
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    // Always show a notification (even if payload is bad/missing)
    let data = {};
    try {
      if (event.data) {
        // Try JSON first; if not JSON, fall back to text -> body
        try {
          data = event.data.json();
        } catch {
          data = { body: event.data.text() };
        }
      }
    } catch (_) {
      // ignore
    }

    const title = data.title || "Drivigo";
    const body  = data.body  || "You have a new update.";
    const url   = data.url   || "/";
    const icon  = data.icon  || "/logo.png"; // make sure this exists in /public/icons/

    await self.registration.showNotification(title, {
      body,
      icon,
      badge: "/logo.png",  // optional; also ensure it exists
      data: { url }
    });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
