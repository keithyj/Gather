import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "server-only": fileURLToPath(new URL("./tests/helpers/server-only.ts", import.meta.url)) }
  },
  test: { environment: "jsdom", include: ["**/*.test.ts"] }
});
