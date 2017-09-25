import { ContextInterface } from "./context";
import { Middleware } from "./middleware";
import { isFunc } from "./utils";

export default json;

export interface ResolveJSONFunction {
  (ctx: ContextInterface): any
}

export interface json {
  (code: number, result: object): Middleware;
  (code: number, result: ResolveJSONFunction): Middleware;
}

/**
 * Respond with a JSON response body.
 */
export function json(code, result): Middleware {
  return function (ctx, next) {
    var str = JSON.stringify(isFunc(result) ? result(ctx) : result);
    ctx.statusCode = code;
    ctx.contentType = "application/json";
    ctx.body = str;
    ctx.length = Buffer.byteLength(str);
  };
}
