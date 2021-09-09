import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { createCellsRouter } from "./routes/cells";

export const serve = (
  port: number,
  filename: string,
  dir: string,
  useProxy: boolean
) => {
  const app = express();

  // We are gonna use a proxy, so whenever we make a request (that is not a intended to save or get a cell)
  // to the local-api, we're gonna suppose that we are requesting to make a call to the local-client
  // make a bundling process and get the new html ans js files with the content.

  // We need to do all this process because when we run this in a user machine, or with local API, we will not have
  // a create react app server (this is only for us, when we are developing), so we won't have access to this dev server and we'll nedd
  // to provide a solution. Also, in other hand, we can be running in our local machine, in developing mode, so in this case we
  // will use a proxy to local CRA dev server. (this is gonna be decided with the useProxy variable)

  if (useProxy) {
    // If useProxy is true, it means we are NOT in production, so we are gonna point to localhost:3000 through a proxy
    app.use(
      createProxyMiddleware({
        target: `http://localhost:3000`,
        ws: true, // websockets
        logLevel: "silent",
      })
    );
  } else {
    // express.static does not work well with symbolic links (which is what we re getting using Lerna), se we'll need to use an absolut path
    const packagePath = require.resolve("local-client/build/index.html");
    app.use(express.static(path.dirname(packagePath)));
  }

  app.use(createCellsRouter(filename, dir));

  // This will return a resolve response if everything is ok, or a reject if not
  // The promise will be handled by the command server in cli package
  return new Promise<void>((resolve, reject) => {
    app.listen(port, resolve).on("error", reject);
  });
};
