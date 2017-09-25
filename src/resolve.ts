import { ContextInterface } from "./context";
import { Middleware } from "./middleware";

export interface ResolveFactory {
  (ctx: ContextInterface): any
}

/**
 * Attaches the result of the given function (promise) to the specified
 * key that can be accessed in following middleware.  Useful for attaching
 * DB instances or authenticated user info.
 */
export function resolve (key: string, factory: ResolveFactory): Middleware {
  return async function (ctx, next) {
    var val = await factory(ctx);
    ctx.setValue(key, val);
    return next();
  };
}