import { ContextInterface } from "./context";
import { RequestHandler } from "./brew";
import * as http from "http";

/**
 * Start listening using a built app instance.
 */
export function serve(handler: RequestHandler, port: number): http.Server {
  var server = http.createServer(handler);
  server.listen(port, function () {
    // TODO: Something a bit fancier here
    console.log("App is now serving on port " + server.address().port);
  });
  return server;
}