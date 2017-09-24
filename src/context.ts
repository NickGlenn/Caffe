import * as caffe from "./interfaces";
import * as http from "http";
import * as url from "url";

declare interface CustomValueMap {
  [key: string]: any
}

class Context implements caffe.ContextInterface {

  public req: http.IncomingMessage;
  public res: http.ServerResponse;
  public query: object;
  public body: any;
  private customValues: CustomValueMap;

  constructor(req: http.IncomingMessage, res: http.ServerResponse) {
    this.req = req;
    this.res = res;
  }

  /**
   * Returns a stored custom value using the given key.
   */
  getValue(key: string): any {
    return (this.customValues[key] || null);
  }

  /**
   * Sets a custom value to the request context.
   */
  setValue(key: string, value: any): void {
    this.customValues[key] = value;
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
   * Returns the headers for the request.
   */
  get headers(): http.IncomingHttpHeaders {
    return this.req.headers;
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
    this.res.statusCode = code;
  }

  /**
   * Returns a request header with the given name.
   */
  getHeader(name: string): any {
    name = name.toLowerCase();
    for (var header in this.req.headers) {
      if (header.toLowerCase() === name) {
        return this.req.headers[header];
      }
    }
    return null;
  }

  /**
   * Set a header for the response.
   */
  setHeader(name: string, value: any) {
    this.res.setHeader(name, value);
  }

  /**
   * Returns the response type for the request.
   */
  getResponseType(): string {
    var type = this.res.getHeader("Content-Type");
    if (typeof type === "string") {
      return type;
    }
    return "text/plain";
  }

  /**
   * Set the response type for the request.
   */
  setResponseType(mimetype: string) {
    this.setHeader("Content-Type", mimetype);
  }

}

export default Context;