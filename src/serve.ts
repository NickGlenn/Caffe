import * as caffe from "./interfaces";
import * as http from "http";

export default serve;

/**
 * Start listening using a built app instance.
 */
function serve(handler: caffe.RequestHandler, port: number): http.Server {
  var server = http.createServer(handler);
  server.listen(port, function () {
    // TODO: Something a bit fancier here
    console.log("App is now serving on port " + server.address().port);
  });
  return server;
}