import * as http from 'http';
import * as express from 'express';
import { Express } from 'express';

let app: Express = express();
let server: http.Server = http.createServer(app);

declare global {
  var __app: Express | undefined;
  var __server: http.Server | undefined;
}

if (!global.__app) {
  global.__app = app;
}

if (!global.__server) {
  global.__server = server;
}

app = global.__app;
server = global.__server;

export { app, server };