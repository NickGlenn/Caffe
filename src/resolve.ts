import * as caffe from "./interfaces";

export default resolve;

export interface ResolveFactory {
  (ctx: caffe.ContextInterface): any
}

/**
 * Attaches the result of the given function (promise) to the specified
 * key that can be accessed in following middleware.  Useful for attaching
 * DB instances or authenticated user info.
 */
function resolve (key: string, factory: ResolveFactory): caffe.Middleware {
  return async function (ctx, next) {
    var val = await factory(ctx);
    ctx.setValue(key, val);
    return next();
  };
}