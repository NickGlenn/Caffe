import { ContextInterface } from "./context";
import { Middleware } from "./middleware";
import { isFunc } from "./utils";

export default plaintext;

export interface ResolveTextFunction {
  (ctx: ContextInterface): string
}

export interface plaintext {
  (code: number, result: string): Middleware;
  (code: number, result: ResolveTextFunction): Middleware;
}

/**
 * Respond with a JSON response body.
 */
function plaintext(code, result): Middleware {
  return function (ctx, next) {
    var text = (isFunc(result) ? result(ctx) : result);
    ctx.statusCode = code;
    ctx.contentType = "text/plain";
    ctx.body = text;
    ctx.length = text.length;
  };
}
