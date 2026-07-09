/** @type {import('lint-staged').Configuration} */
module.exports = {
  '*.{ts,tsx,js,jsx,cjs,mjs,json,md,mdx,yml,yaml,css}': ['prettier --write'],
};
