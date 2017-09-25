import { Middleware } from "./middleware";

export default inject;

/**
 * Inject a value as is to the context object using the given key.
 */
function inject (key: string, value: any): Middleware {
  return function (ctx, next) {
    ctx.setValue(key, value);
    return next();
  };
}