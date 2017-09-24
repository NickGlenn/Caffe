var compose = require("compose");
var statuses = require("statuses");
var assert = require("assert");

/**
 * Composes middleware (or an array of middleware) into a single HTTP
 * request handler function.
 *
 * @param  {Middleware[]} middleware
 * @return {Function}
 */
function brew (middleware) {
  // If we received an array of middleware, compose them down to one
  var run = compose(Array.isArray(middleware) ? middleware : [middleware]);
  // Return the request handler
  return function (req, res) {
    // Set the default status code to 404
    res.statusCode = 404;
    // Create the context for the request
    var ctx = new Context(req, res);
    // Create the respone handler for the request
    var handleResponse = () => processResponse(ctx);
    // Call the middleware stack with the new context
    run(ctx).then(this.oncomplete).catch(this.onerror);
  };
}

/**
 * Process the context object to generate a response.
 *
 * @param  {*} ctx
 */
function processResponse (ctx) {
  // Bypass the response processing
  if (ctx.skipResponseProcessing === true) return;

  //
  if (ctx.method === "HEAD") {
    if (!ctx.res.headersSent && isJSON(ctx.body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(ctx.body));
    }
    return res.end();
  }

  //
  if (ctx.body === null) {

  }

  // status body
  if (null == body) {
    body = ctx.message || String(code);
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}

/**
 * Default error handler.
 *
 * @param  {Error} err
 */
brew.onerror = function handleError (err) {
  assert(err instanceof Error, "Non-error thrown: " + err.message);

  if (err.status === 404 || err.expose || this.silent) {
    return;
  }

  var msg = (err.stack || err.toString());
  console.error(msg.replace(/^/gm, "  "));
}

module.exports = brew;