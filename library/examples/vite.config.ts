import devtools from "solid-devtools/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    devtools({
      autoname: true,
    }),
    solidPlugin(),
  ],
});
