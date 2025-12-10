import { ServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

let handler: ServiceWorkerMLCEngineHandler | null = null;

const getHandler = (): ServiceWorkerMLCEngineHandler => {
  if (!handler) {
    handler = new ServiceWorkerMLCEngineHandler();
  }
  return handler;
};

const checkGPUAvailability = async (): Promise<boolean> => {
  if (!("gpu" in navigator)) {
    return false;
  }
  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

const swSelf = self as any;

swSelf.addEventListener("install", (event: any) => {
  event.waitUntil(swSelf.skipWaiting());
});

swSelf.addEventListener("activate", (event: any) => {
  event.waitUntil(
    Promise.all([
      swSelf.clients.claim(),
      (async () => {
        getHandler();
        await checkGPUAvailability();
      })(),
    ])
  );
});

swSelf.addEventListener("message", (event: any) => {
  getHandler();
  const msg = event.data;

  if (msg?.kind === "checkWebGPUAvailability") {
    checkGPUAvailability().then((gpuAvailable) => {
      const reply = {
        kind: "return",
        uuid: msg.uuid,
        content: gpuAvailable,
      };
      if (event.source) {
        (event.source as any).postMessage(reply);
      }
    });
  }
});
