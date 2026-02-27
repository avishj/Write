import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@lib": new URL("./src/lib", import.meta.url).pathname,
      "@app": new URL("./src/app", import.meta.url).pathname,
      "@tests": new URL("./tests", import.meta.url).pathname,
    },
  },
  test: {
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
      ],
    },
  },
});
