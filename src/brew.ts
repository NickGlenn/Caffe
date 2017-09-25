import { Middleware } from "./middleware";
import { Context, ContextInterface } from "./context";
import * as http from "http";
import * as assert from "assert";
import * as Stream from "stream";
import compose from "./compose";

export interface RequestHandler {
  (req: http.IncomingMessage, res: http.ServerResponse): void;
}

export interface ResponseHandler {
  (ctx: ContextInterface, res: http.ServerResponse): void;
}

export interface ErrorHandler {
  (err: Error): void;
}

export interface BrewFunction {
  (middleware: Middleware[]): RequestHandler;
}

export interface ContextConstructor {
  new(req: http.IncomingMessage, res: http.ServerResponse): ContextInterface;
}

/**
 * Returns a new brew() method that is used for generating a HTTP request
 * handler using Caffe-compatible middleware.
 */
export function customBrew (
  context: ContextConstructor,
  processResponse: ResponseHandler,
  onError: ErrorHandler
): BrewFunction {
  return function (middleware) {
    const run = compose(Array.isArray(middleware) ? middleware : [middleware]);
    return function (req, res) {
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
  return Promise.resolve();
}

/**
 * The default error handler.
 */
function defaultErrorHandler(err: Error) {
  assert(err instanceof Error, "Non-error thrown: " + err.message);

  // if (err.status === 404 || err.expose || this.silent) {
  //   return;
  // }

  var msg = (err.stack || err.toString());
  console.error(msg.replace(/^/gm, "  "));
}

/**
 * The default response processor.
 */
function defaultResponseProcessor(ctx: ContextInterface, res: http.ServerResponse) {
  if (ctx.body instanceof Stream) {
    ctx.body.pipe(res);
  } else {
    if (ctx.body == null) {
      ctx.body = http.STATUS_CODES[ctx.statusCode];
      ctx.contentType = "text/plain";
    }
    res.end();
  }
}

/**
 * The default brew() implementaion.
 */
export const brew = customBrew(Context, defaultResponseProcessor, defaultErrorHandler);