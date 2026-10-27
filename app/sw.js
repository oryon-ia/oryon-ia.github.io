// App da ORYON no celular: guarda a casca (tela de abertura, icones) pra abrir mesmo sem internet.
// O link do PC (ponte) e a ORYON em si nunca vem do cache: sempre da rede.
const CASCA = "oryon-app-v1";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icone-192.png", "./icone-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CASCA).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== CASCA).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.endsWith("ponte.json")) return;
  // casca: rede primeiro (pega versao nova), cache se estiver sem internet
  e.respondWith(fetch(e.request).then((r) => {
    const copia = r.clone();
    caches.open(CASCA).then((c) => c.put(e.request, copia));
    return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html"))));
});
