import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.{js,mjs}"],
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["public/js/**/*.js"],
      exclude: ["public/vibe-machine/**", "**/*.test.js"],
    },
  },
});
