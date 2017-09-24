var Cookies = require("cookies");
var accepts = require("accepts");

class Context {

  /**
   * Constructor.
   *
   * @param   {Request} req
   * @param   {Response} res
   * @param   {Object} opts
   */
  constructor (req, res, opts) {
    this.request      = this.req = req;
    this.response     = this.res = res;
    this.opts         = opts;
    this.accept       = accepts(req);
    this.originalUrl  = req.url;
    this.cookies      = this.createCookies();
  }

}

/**
 * Tests the given key and makes sure that it could be safely set without
 * damaging the base functionality provided by Context and Caffe.  Throws
 * an error if the given key is "not safe" to set.
 *
 * @param  {String} key
 */
Context.assertSafeKey = function (key) {
  if (Context.prototype[key]) {
    throw new Error(`The provided key "${key} is not allowed as it is "protected" by the Context object.`);
  }
}

module.exports = Context;