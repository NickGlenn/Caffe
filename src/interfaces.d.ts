import * as http from "http";

export interface NextFunction {
  (): Promise<any>;
}

export interface Middleware {
  (ctx: ContextInterface, next: NextFunction): any;
}

export interface RequestHandler {
  (req: http.IncomingMessage, res: http.ServerResponse): void;
}

export interface ResponseHandler {
  (ctx: ContextInterface, res: http.ServerResponse): void;
}

export interface ErrorHandler {
  (err: Error): void;
}

export interface BrewFunction {
  (middleware: Middleware[]): RequestHandler;
}

export interface ContextConstructor {
  new(req: http.IncomingMessage, res: http.ServerResponse): ContextInterface;
}

export interface ContextInterface {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  url: string;
  querystring: string;
  query: object;
  headers: http.IncomingHttpHeaders;
  statusCode: number;
  body: any;
  getValue(key: string): any;
  setValue(key: string, value: any): void;
  getHeader(name: string): null;
  getHeader(name: string): string;
  getHeader(name: string): string[];
  setHeader(name: string, value: number): void;
  setHeader(name: string, value: string): void;
  setHeader(name: string, value: string[]): void;
  getResponseType(): string;
  setResponseType(mimeType: string): void;
}