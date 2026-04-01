const CACHE_NAME = "jjhub-v1";

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
		)
	);
});

// Handle notification clicks — open the app to /fitness
self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	event.waitUntil(
		clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if (client.url.includes("/fitness") && "focus" in client) {
					return client.focus();
				}
			}
			if (clients.openWindow) {
				return clients.openWindow("/fitness");
			}
		})
	);
});

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;
	if (event.request.url.includes("supabase.co")) return;

	event.respondWith(
		fetch(event.request)
			.then((response) => {
				const clone = response.clone();
				caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
				return response;
			})
			.catch(() => caches.match(event.request))
	);
});
