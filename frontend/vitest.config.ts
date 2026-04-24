import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const srcAliasPath = resolve(__dirname, "src");

export default defineConfig({
  esbuild: {
    jsxInject: "import React from 'react'"
  },
  resolve: {
    alias: {
      "@": srcAliasPath
    }
  },
  test: {
    alias: {
      "@": srcAliasPath
    },
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"]
  }
});
