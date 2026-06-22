const CACHE = 'savings-calc-v3';
const STATIC_ASSETS = ['/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
		)
	);
	self.clients.claim();
});

function isDynamicRequest(request) {
	if (request.mode === 'navigate') return true;
	const accept = request.headers.get('accept') ?? '';
	if (accept.includes('text/html')) return true;

	const { pathname } = new URL(request.url);
	if (pathname.startsWith('/_app/')) return true;
	if (pathname.endsWith('.js') || pathname.endsWith('.css')) return true;

	return false;
}

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	if (isDynamicRequest(event.request)) {
		event.respondWith(fetch(event.request));
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cached) => cached || fetch(event.request))
	);
});