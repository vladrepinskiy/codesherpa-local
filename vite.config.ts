import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/codesherpa-local/",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
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
