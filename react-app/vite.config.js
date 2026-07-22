import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/WyandotCountyInformation/",
  define: {
    // Injected at build/dev-start time; drives the footer build stamp.
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
