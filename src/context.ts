import * as http from "http";
import * as url from "url";
import * as mime from "mime-types";
import vary from "vary";
import * as escape from "escape-html";
import * as accepts from "accepts";
import * as fresh from "fresh";
import { isBetween } from "./utils";

export interface ContextInterface {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  url: string;
  querystring: string;
  query: object;
  fresh: boolean;
  stale: boolean;
  idempotent: boolean;
  protocol: string;
  isSecure: boolean;
  headers: http.IncomingHttpHeaders;
  requestHeaders: http.IncomingHttpHeaders;
  responseHeaders: http.OutgoingHttpHeaders;
  statusCode: number;
  method: string;
  body: any;
  length: number;
  headersSent: boolean;
  contentType: string;
  lastModified: string;
  etag: string;
  accepts(...types: string[]): string;
  acceptsEncodings(...encodings: string[]): string;
  acceptsCharsets(...charsets: string[]): string;
  acceptsLanguages(...langs: string[]): string;
  vary(header: string);
  isMethod(method: string): boolean;
  getValue(key: string): any;
  setValue(key: string, value: any): void;
  hasHeader(name: string): boolean;
  getHeader(name: string): null;
  getHeader(name: string): string;
  getHeader(name: string): string[];
  setHeader(name: string, value: number): void;
  setHeader(name: string, value: string): void;
  setHeader(name: string, value: string[]): void;
  removeHeader(name: string);
  setLastModifiedWithDate(date: Date);
}

export interface CustomValueMap {
  [key: string]: any
}

export class Context implements ContextInterface {

  public req: http.IncomingMessage;
  public res: http.ServerResponse;
  public query: object;
  private _body: any;
  private _customValues: CustomValueMap = {};
  private _statusWasSet: boolean = false;
  private _accept: accepts.Accept;

  constructor(req: http.IncomingMessage, res: http.ServerResponse) {
    this.req = req;
    this.res = res;
    // Set the default status code for the requests
    res.statusCode = 404;
    // Cache the parsed Accept info
    this._accept = accepts(req);
  }

  /**
   * Returns a stored custom value using the given key.
   */
  getValue(key: string): any {
    return (this._customValues[key] || null);
  }

  /**
   * Sets a custom value to the request context.
   */
  setValue(key: string, value: any): void {
    this._customValues[key] = value;
  }

  /**
   * Returns the URL for the request.
   */
  get url(): string {
    return (this.req.url || "");
  }

  /**
   * Returns the "search" part of the URL for the request in
   * string form.
   */
  get querystring(): string {
    return (url.parse(this.url).search || "");
  }

  /**
   * Get origin of URL.
   */
  get origin(): string {
    return `${this.protocol}://${this.host}`;
  }

  /**
   * Returns the request headers.
   */
  get headers(): http.IncomingHttpHeaders {
    return this.req.headers;
  }

  /**
   * Returns the request headers.
   */
  get requestHeaders(): http.IncomingHttpHeaders {
    return this.req.headers;
  }

  /**
   * Returns the response headers.
   */
  get responseHeaders(): http.OutgoingHttpHeaders {
    if (typeof this.res.getHeaders === "function") {
      return this.res.getHeaders();
    } else {
      var res = (this.res as any);
      return res._headers || {};
    }
  }

  /**
   * Check if the request is fresh, aka Last-Modified and/or the ETag still match.
   */
  get fresh(): boolean {
    // GET or HEAD for weak freshness validation only
    if (this.method !== "GET" && this.method !== "HEAD") {
      return false;
    }

    // 2xx or 304 as per rfc2616 14.26
    var code = this.statusCode;
    if ((code >= 200 && code < 300) || 304 == code) {
      return fresh(this.requestHeaders, this.responseHeaders);
    }

    return false;
  }

  /**
   * Inverse of "fresh".
   */
  get stale(): boolean {
    return !this.fresh;
  }

  /**
   * Check if the request is idempotent.
   */
  get idempotent(): boolean {
    const methods = ["GET", "HEAD", "PUT", "DELETE", "OPTIONS", "TRACE"];
    return (methods.indexOf(this.method) !== -1);
  }

  /**
   * Short-hand for: this.protocol === 'https'
   */

  get isSecure(): boolean {
    return this.protocol === "https";
  }

  /**
   * When `app.proxy` is `true`, parse the "X-Forwarded-For" ip address list.
   *
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   */
  // get ips(): string[] {
  //   const proxy = this.proxy;
  //   const val = this.get('X-Forwarded-For');
  //   return proxy && val
  //     ? val.split(/\s*,\s*/)
  //     : [];
  // }

  /**
   * Return subdomains as an array.
   *
   * Subdomains are the dot-separated parts of the host before the main domain
   * of the app. By default, the domain of the app is assumed to be the last two
   * parts of the host. This can be changed by setting `app.subdomainOffset`.
   *
   * For example, if the domain is "tobi.ferrets.example.com":
   * If `app.subdomainOffset` is not set, this.subdomains is
   * `["ferrets", "tobi"]`.
   * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
   */
  // get subdomains(): string[] {
  //   const offset = this.subdomainOffset;
  //   const hostname = this.hostname;
  //   if (net.isIP(hostname)) return [];
  //   return hostname
  //     .split('.')
  //     .reverse()
  //     .slice(offset);
  // },

  /**
   * True if the headers for the response have already been sent.
   */
  get headersSent(): boolean {
    return this.res.headersSent;
  }

  /**
   * Returns the status code for the response.
   */
  get statusCode(): number {
    return this.res.statusCode;
  }

  /**
   * Set the status code for the response.
   */
  set statusCode(code: number) {
    this._statusWasSet = true;
    this.res.statusCode = code;
  }

  /**
   * Set Content-Length field to the given value.
   */

  set length(val: number) {
    this.setHeader("Content-Length", ~~val);
  }

  /**
   * Return parsed response Content-Length when present.
   */
  get length(): number {
    var len   = this.getHeader("Content-Length");
    var body  = this.body;

    if (len === 0) {
      if (!body) return 0;
      if (typeof body === "string") return Buffer.byteLength(body);
      if (Buffer.isBuffer(body)) return body.length;
      return 0;
    }

    return len;
  }

  /**
   * Returns true if the resposne header with the given name has been set.
   */
  hasHeader(name: string): boolean {
    return this.res.hasHeader(name);
  }

  /**
   * Returns a request header with the given name.
   */
  getHeader(name: string): any {
    this.res.getHeader(name);
  }

  /**
   * Set a header for the response.
   */
  setHeader(name: string, value: any) {
    value = (Array.isArray(value) ? value.map(String) : String(value));
    this.res.setHeader(name, value);
  }

  /**
   * Remove a set header for the response.
   */
  removeHeader(name: string) {
    this.res.removeHeader(name);
  }

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `false`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // Accept: text/html
   *     this.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('html');
   *     // => "html"
   *     this.accepts('text/html');
   *     // => "text/html"
   *     this.accepts('json', 'text');
   *     // => "json"
   *     this.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('image/png');
   *     this.accepts('png');
   *     // => false
   *
   *     // Accept: text/*;q=.5, application/json
   *     this.accepts(['html', 'json']);
   *     this.accepts('html', 'json');
   *     // => "json"
   */
  accepts(...types: string[]): string {
    return this._accept.types(...types);
  }

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   */
  acceptsEncodings(...encodings: string[]): string{
    return this._accept.encodings(...encodings);
  }

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   */
  acceptsCharsets(...charsets: string[]): string {
    return this._accept.charsets(...charsets);
  }

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   */
  acceptsLanguages(...langs: string[]): string {
    return this._accept.languages(...langs);
  }

  /**
   * Set the Last-Modified header.
   */
  set lastModified(date: string) {
    this.setHeader("Last-Modified", date);
  }

  /**
   * Returns the Last-Modified header, if set.
   */
  get lastModified(): string {
    return this.res.getHeader("Last-Modified") as string;
  }

  /**
   * Set the Last-Modified header using a Date.
   */
  setLastModifiedWithDate(date: Date) {
    this.lastModified = date.toUTCString();
  }

  /**
   * Set the ETag header for the response.
   * This will normalize the quotes if necessary.
   *
   *     this.response.etag = 'md5hashsum';
   *     this.response.etag = '"md5hashsum"';
   *     this.response.etag = 'W/"123456789"';
   */
  set etag(val: string) {
    if (!/^(W\/)?"/.test(val)) val = `"${val}"`;
    this.setHeader("ETag", val);
  }

  /**
   * Get the ETag header for the response.
   */
  get etag(): string {
    return this.getHeader("ETag") as string;
  }

  /**
   * Returns the content type for the response based on the
   * set Content-Type header.
   */
  get contentType(): string {
    var type = this.res.getHeader("Content-Type");
    return (type === "string" ? type.split(';')[0] : "");
  }

  /**
   * Set the response type for the request using the Content-Type
   * header.
   */
  set contentType(type: string) {
    var setType = mime.contentType(type);
    if (setType) {
      this.setHeader("Content-Type", type);
    } else {
      this.removeHeader("Content-Type");
    }
  }

  /**
   * Returns the Referrer request header.
   */
  get referrer(): string|null {
    if (this.hasHeader("Referrer")) {
      return this.getHeader("Referrer") as string;
    } else {
      return null;
    }
  }

  /**
   * Vary on the given header.
   */
  vary(header: string) {
    vary(this.res, header);
  }

  /**
   * Performs a 302 redirect to the refferer URL.  when the Referrer
   * header is not present, the fallback is used instead.
   */
  back(fallback: string = "/") {
    this.redirect(this.referrer || fallback);
  }

  /**
   * Perform a 302 redirect to `url`.
   */
  redirect(url: string) {
    this.setHeader("Location", url);

    // status
    if (!this._statusWasSet || !isBetween(this.statusCode, 299, 400)) {
      this.statusCode = 302;
    }

    // html
    if (this.accepts("html")) {
      url = escape(url);
      this.contentType = "text/html; charset=utf-8";
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }

    // text
    this.contentType = "text/plain; charset=utf-8";
    this.body = `Redirecting to ${url}.`;
  }

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @param {String} filename
   * @api public
   */

  // attachment(filename) {
  //   if (filename) this.type = extname(filename);
  //   this.set('Content-Disposition', contentDisposition(filename));
  // },

  /**
   * Returns the method for the request.
   */
  get method(): string {
    return (this.req.method || "");
  }

  /**
   * Returns true if the request method matches the given method. This
   * method does a case-insensitive comparison.
   */
  isMethod(method: string): boolean {
    return (this.method.toLowerCase() === method.toLowerCase());
  }

  /**
   * Get response body.
   */
  get body(): any {
    return this._body;
  }

  /**
   * Set response body.
   */
  set body(val: any) {
    if (this.headersSent) {
      console.warn("Attempting to set body after headers have already been sent!");
      return;
    }

    if (val == null) {
      if (!this._statusWasSet) {
        this.statusCode = 204;
      }
      this.removeHeader("Content-Type");
      this.removeHeader("Content-Length");
      this.removeHeader("Transfer-Encoding");
      return;
    }

    if (!this._statusWasSet) {
      this.statusCode = 200;
    }

    this.length = Buffer.byteLength(val);
    this._body = val;
  }

}