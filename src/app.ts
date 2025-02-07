import bodyParser = require('body-parser');
import logger from '@/utils/logger';
import * as express from 'express';
import { Express, NextFunction } from 'express';
import morgan = require('morgan');
import cors = require('cors');

import * as http from 'http';

import 'reflect-metadata';
import { validationResult } from 'express-validator';
import { authentication } from '@/http/middleware/authentication';
import { Routes } from '@/routes';

import type { RouteType } from '@/types/global';
import { app, server } from '@/server.server';

export default class App {
  public app: Express;
  public server: http.Server;

  public async start() {
    this.app = app;
    this.server = server;

    this.app.use(morgan('tiny'));
    this.app.use(bodyParser.json());
    this.app.use(cors({ origin: '*', credentials: true }));

    logger.info('Setting up routes...');

    await this.setupRoutes(Routes, '');

    logger.info('Routes setup complete.');

    this.app.use(this.handleError);

  }

  private async setupRoutes(routes: RouteType[], prefix: string) {
    logger.info(`Setting up routes for '${prefix}'`);
    const router = express.Router();

    routes.forEach((route) => {
      (router as any)[route.method](route.route,
        ...route.validation,
        route.authorization === true ? authentication : [],
        async (req: express.Request, res: express.Response, next: NextFunction) => {
          try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            }

            const result = await new route.controller()[route.action](req, res, next);
            if (result) {
              res.json(result);
            }
          } catch (error) {
            next(error);
          }
        }
      );
    });

    this.app.use(prefix, router);
  }

  public handleError(
    error: any,
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ) {
    // logger.error(error);
    res.status(error.statusCode || 500).send({ message: error.message });
  }
}