import { noInvisible } from "./no-invisible.ts";

const plugin = {
  meta: {
    name: "unicode",
  },
  rules: {
    "no-invisible": noInvisible,
  },
};

export default plugin;
