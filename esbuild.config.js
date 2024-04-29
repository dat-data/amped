import { build } from "esbuild";

build({
  entryPoints: ["./src/main.ts"],
  bundle: true,
  outfile: "./dist/bot.js",
  platform: "node",
  target: ["node18"],
  sourcemap: "inline",
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: false,
  keepNames: true,
  legalComments: "none",
  metafile: true,
  alias: {
    "@": "./",
  },
}).catch(() => process.exit(1));
