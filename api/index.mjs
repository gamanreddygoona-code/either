import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
/* eslint-disable-next-line */
const mod = require("../dist/server.vercel.cjs");

export default mod.default ?? mod;
