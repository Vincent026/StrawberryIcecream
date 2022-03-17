const { mdsvex } = require("mdsvex");

const config = {
  extensions: [".svelte", ...mdsvexConfig.extensions],
  preprocess: [mdsvex(mdsvexConfig)],
};


module.exports = config;
