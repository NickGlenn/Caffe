import { ContextInterface } from "./context";

export interface NextFunction {
  (): Promise<any>;
}

export interface Middleware {
  (ctx: ContextInterface, next: NextFunction): any;
}