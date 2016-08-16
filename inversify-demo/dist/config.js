System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  map: {
    "crypto": "@empty",
    "inversify": "npm:inversify@2.0.0-rc.5",
    "reflect-metadata": "npm:reflect-metadata@0.1.3"
  }
});
