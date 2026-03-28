import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/widget.js",
      name: "BotDeskWidget",
      fileName: "widget",
      formats: ["iife"], // Immediately Invoked Function Expression — works as a <script> tag
    },
    outDir: "../backend/public/widget", // Output directly into backend's static folder
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
