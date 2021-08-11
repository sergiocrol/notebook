import * as esbuild from "esbuild-wasm";

// This plugin is gonna be used every time we call 'build' method of ESBuild along with the plugins property
export const unpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // It takes the arguments specified in the entrypoint property and returns the specified path
      // the next step is onLoad()
      // The filter argument with the regular expression is necessary to control when onResolve and onLoad are executed
      // We can have many different onResolve methods that are executed only for different files/extensions

      // Handle root entry file of index.js
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: "index.js", namespace: "a" };
      });

      // Handle relative paths in a module
      build.onResolve({ filter: /^\.+\// }, (args: esbuild.OnResolveArgs) => {
        return {
          namespace: "a",
          path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
            .href,
        };
      });

      // Handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};
