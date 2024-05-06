const { build } = require("esbuild");

build({
  entryPoints: ["./src/main.ts"],
  bundle: true,
  outfile: "dist/amped.js",
  platform: "node",
  target: ["node16"],
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
