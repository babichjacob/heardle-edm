import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";
import { qrcode } from "vite-plugin-qrcode";
import Icons from "unplugin-icons/vite";

import { readFile } from "fs/promises";
import { range } from "./src/lib/utils.js";

const answers = JSON.parse(
  await readFile("./src/lib/answers.json", "utf8")
);
const entries = [...range(answers.length).map((i) => `/${i + 1}`)];

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: "404.html",
    }),

    prerender: {
      entries,
      onError: "continue",
    },

    trailingSlash: "always",

    vite: {
      optimizeDeps: {
        exclude: ["@babichjacob/svelte-localstorage"],
      },
      plugins: [
        qrcode(),
        Icons({
          autoInstall: true,
          compiler: "svelte",
        }),
      ],
      ssr: {
        noExternal: ["@babichjacob/svelte-localstorage"],
      },
    },
  },

  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
};

export default config;
