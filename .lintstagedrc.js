module.exports = {
  '*/**/*.{js,ts,json,md}': ['npx prettier --write'],
  '*/**/*.{ts}': ['npx tsc --noEmit'],
};
