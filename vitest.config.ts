import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@app": fileURLToPath(new URL("./src/app", import.meta.url)),
      "@tests": fileURLToPath(new URL("./tests", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
    restoreMocks: true,
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      thresholds: {
        perFile: true,
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 80,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.config.*",
        "**/*.d.ts",
        "src/env.d.ts",
        "src/pages/**",
        "src/app/providers/**",
        "src/components/**",
      ],
    },
  },
});
