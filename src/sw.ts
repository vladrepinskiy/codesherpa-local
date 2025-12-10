import { ServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

new ServiceWorkerMLCEngineHandler();

const swSelf = self as any;

swSelf.addEventListener("install", (_event: any) => {
  swSelf.skipWaiting();
});

swSelf.addEventListener("activate", (_event: any) => {
  swSelf.clients.claim();
});
