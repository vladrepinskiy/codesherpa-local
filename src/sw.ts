import { ServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const _handler = new ServiceWorkerMLCEngineHandler();

const swSelf = self as any;

swSelf.addEventListener("install", (event: any) => {
  swSelf.skipWaiting();
});

swSelf.addEventListener("activate", (event: any) => {
  swSelf.clients.claim();
});
