const compose = require("./compose");
const pathToRegex = require("path-to-regexp");
// const debug = require("debug")("caffe");

/**
 * Returns true if the given method matches, or is contained within,
 * the allowed method(s).
 *
 * @param  {String} allowed
 * @param  {String} method
 * @return {Boolean}
 */
function matches (allowed, method) {
  return (
    Array.isArray(allowed) ?
    allowed.indexOf(method) !== -1 :
    allowed === method
  );
}

/**
 * Returns a params object if the route is a match, otherwise,
 * returns null.
 *
 * @param  {Array} args
 * @return {Object}
 */
function getParams (path, ctx) {
  var arg, key, keys = [], params = {};
  var args = pathToRegex(path, keys).exec(ctx.path);
  if (args) {
    args = args.slice(1);
    for (var i = 0; i < args.length; i++) {
      key = keys[i].name;
      arg = args[i];
      params[key] = (arg ? decodeURIComponent(arg) : arg);
    }
    return params;
  }
  return false;
}

/**
 * Passes control flow to the given middleware or handler if the
 * current method and path matches the configured route.
 *
 * @param  {String} method
 * @param  {String} path
 * @param  {Function} middleware
 * @return {Function}
 */
function route (method, path, middleware) {
  if (Array.isArray(middleware)) {
    middleware = compose(middleware);
  }
  return function (ctx, next) {
    if (matches(method, ctx.method)) {
      const params = getParams(path, ctx);
      if (params) {
        // debug('%s %s matches %s %j', ctx.method, path, ctx.path, params);
        ctx.params = params;
        return middleware(ctx, next);
      }
    }
    return next(ctx, next);
  };
}