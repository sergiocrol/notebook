import * as esbuild from "esbuild-wasm";
import localForage from "localforage";
import axios from "axios";

// LocalForage is a library to use indexDB API more easily
const fileCache = localForage.createInstance({
  name: "filename",
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: "jsx",
          contents: inputCode,
        };
      });

      // We can use this technique to do not repeat the caching logic in both onload methods below.
      // When esbuild does not find any return inside the method, it will continue loading the rest onLoad methods
      // without error. In this case, if we have the pckg cached, we return the cached result, so the others won't be loaded
      // but if the return is not applied, will run the next onLoad
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        // Check if we've already fetched this file, and if it is in the cache to return it
        // immediately (we will use the unique args.path as key)
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (cachedResult) {
          return cachedResult;
        }
      });

      build.onLoad({ filter: /.css$/ }, async (args: esbuild.OnLoadArgs) => {
        const { data, request } = await axios.get(args.path);

        // We do not have a filesystem here, so esbuild can spit out a JS file if we're using it
        // in a browser. But only JS file, not css, for instance. So esbuild can fetch the css file, and
        // it can process it, but since CSS files are returned in a separated file along with JS, and we do not have
        // a file system, esbuild cannot handle it.
        // The way to solve this is: take the css, wrap it with js code, and use the js to attach the css directly to the DOM
        const escaped = data
          .replace(/\n/g, "")
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");

        const contents = `
            const style = document.createElement('style');
            style.innerText = '${escaped}';
            document.head.appendChild(style);
          `;

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        // store response in the cache
        await fileCache.setItem(args.path, result);

        return result;
      });

      // onLoad will be executed first, and it will return an object that will be handled by onResolve
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        // store response in the cache
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
