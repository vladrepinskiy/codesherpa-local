import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const basePath =
  process.env.NODE_ENV === "production" ? "/codesherpa-local/" : "/";

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
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
    exclude: ["@electric-sql/pglite"],
  },
  build: {
    target: "esnext",
  },
});
