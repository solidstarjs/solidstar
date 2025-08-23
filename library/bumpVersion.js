import { replaceInFile } from "replace-in-file";
import pkg from "./package.json" with { type: "json" };
const { version } = pkg;

const to = (...g) => g[1] + version + g[2];

await replaceInFile({
  files: "../README.md",
  from: /(solidstar@).*?(\/)/,
  to,
});

await replaceInFile({
  files: "../template/package.json",
  from: /("solidstar": "\^).*?(")/,
  to,
});
