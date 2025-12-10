import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const basePath =
  process.env.NODE_ENV === "production" ? "/codesherpa-local/" : "/";

const serviceWorkerPlugin = (): Plugin => {
  return {
    name: "service-worker",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/sw.js" || req.url === "/src/sw.ts") {
          req.url = "/src/sw.ts";
          res.setHeader("Content-Type", "application/javascript");
        }
        next();
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    serviceWorkerPlugin(),
  ],
  server: {
    port: 3000,
    hmr: {
      overlay: true,
    },
    watch: {
      // Enable file watching
      usePolling: false,
      ignored: ["**/node_modules/**", "**/.git/**"],
    },
  },
  logLevel: "info",
  clearScreen: false,
  optimizeDeps: {
    exclude: ["@electric-sql/pglite", "@mlc-ai/web-llm"],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        main: "./index.html",
        sw: "./src/sw.ts",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "sw" ? "sw.js" : "assets/[name]-[hash].js";
        },
      },
    },
  },
});
