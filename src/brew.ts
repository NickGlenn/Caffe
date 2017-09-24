import * as caffe from "./interfaces";
import * as http from "http";
import compose from "./compose";

/**
 * Returns a new brew() method that is used for generating a HTTP request
 * handler using Caffe-compatible middleware.
 */
export function customBrew (
  context: caffe.ContextConstructor,
  processResponse: caffe.ResponseHandler,
  onError: caffe.ErrorHandler
): caffe.BrewFunction {
  return function (middleware) {
    var run = compose(Array.isArray(middleware) ? middleware : [middleware]);
    return function (req, res) {
      // Set the default status code to 404
      res.statusCode = 404;
      // Create the context for the request
      var ctx = new context(req, res);
      // Call the middleware stack with the new context
      run(ctx, end).then(() => processResponse(ctx, res)).catch(onError);
    };
  };
}

/**
 * End of request next() function.
 */
function end(): Promise<any> {
  return new Promise((accept, reject) => {
    accept();
  });
}

// /**
//  * Process the context object to generate a response.
//  *
//  * @param  {*} ctx
//  */
// function processResponse (ctx) {
//   // Bypass the response processing
//   if (ctx.skipResponseProcessing === true) return;

//   //
//   if (ctx.method === "HEAD") {
//     if (!ctx.res.headersSent && isJSON(ctx.body)) {
//       ctx.length = Buffer.byteLength(JSON.stringify(ctx.body));
//     }
//     return res.end();
//   }

//   //
//   if (ctx.body === null) {

//   }

//   // status body
//   if (null == body) {
//     body = ctx.message || String(code);
//     if (!res.headersSent) {
//       ctx.type = 'text';
//       ctx.length = Buffer.byteLength(body);
//     }
//     return res.end(body);
//   }

//   // responses
//   if (Buffer.isBuffer(body)) return res.end(body);
//   if ('string' == typeof body) return res.end(body);
//   if (body instanceof Stream) return body.pipe(res);

//   // body: json
//   body = JSON.stringify(body);
//   if (!res.headersSent) {
//     ctx.length = Buffer.byteLength(body);
//   }
//   res.end(body);
// }

// /**
//  * Default error handler.
//  *
//  * @param  {Error} err
//  */
// brew.onerror = function handleError (err) {
//   assert(err instanceof Error, "Non-error thrown: " + err.message);

//   if (err.status === 404 || err.expose || this.silent) {
//     return;
//   }

//   var msg = (err.stack || err.toString());
//   console.error(msg.replace(/^/gm, "  "));
// }

// module.exports = brew;