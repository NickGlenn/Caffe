var isFunc = require("lodash/isFunction");
var statuses = require("statuses");

/**
 * Respond with a JSON response body.
 *
 * @param  {Int} statusCode
 * @param  {Object|Function} result
 * @return {Function}
 */
module.exports = function json (status, result) {
  if (statuses.empty[status]) {
    console.warn("The status code \"" + status + "\" is not a known HTTP status code.");
  }

  return function (ctx, next) {
    ctx.statusCode = status;
    ctx.headers["Content-Type"] = "application/json";
    ctx.body = JSON.stringify(isFunc(result) ? result(ctx) : result);
  };
}
