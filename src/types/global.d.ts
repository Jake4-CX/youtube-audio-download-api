interface RouteType {
  method: "get" | "post" | "put" | "patch" | "delete";
  route: string;
  controller: any;
  action: string;
  authorization: boolean;
  validation: any[];
}

declare global {
  namespace Express {
    export interface Request {
      token: string;
    }
  }
}

export { RouteType };