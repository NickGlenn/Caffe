import * as caffe from "./interfaces";
import { isFunc } from "./utils";

export default plaintext;

export interface ResolveTextFunction {
  (ctx: caffe.ContextInterface): string
}

/**
 * Respond with a JSON response body.
 */
function plaintext(code: number, result: string): caffe.Middleware;
function plaintext(code: number, result: ResolveTextFunction): caffe.Middleware;
function plaintext(code, result): caffe.Middleware {
  return function (ctx, next) {
    ctx.statusCode = code;
    ctx.setResponseType("text/plain");
    ctx.body = (isFunc(result) ? result(ctx) : result);
  };
}
