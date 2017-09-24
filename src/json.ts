import * as caffe from "./interfaces";
import { isFunc } from "./utils";

export default json;

export interface ResolveJSONFunction {
  (ctx: caffe.ContextInterface): any
}

/**
 * Respond with a JSON response body.
 */
function json(code: number, result: object): caffe.Middleware;
function json(code: number, result: ResolveJSONFunction): caffe.Middleware;
function json(code: number, result: any): caffe.Middleware {
  return function (ctx, next) {
    ctx.statusCode = code;
    ctx.setResponseType("application/json");
    ctx.body = JSON.stringify(isFunc(result) ? result(ctx) : result);
  };
}
