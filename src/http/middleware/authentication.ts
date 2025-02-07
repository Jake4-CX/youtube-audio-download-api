import { NextFunction, Request, Response } from "express";
var createError = require('http-errors');

export const authentication = async (request: Request, response: Response, next: NextFunction) => {

  if (!request.headers["authorization"]) {
    return next(createError(401, "No authorization token provided!"));
  }

  const token = request.headers["authorization"].split(" ")[1];
  request.token = token;

  if (!token) return next(createError(401, "No authorization token provided!"));

  try {

    // Implement logic here

    next();
  } catch (err) {
    return next(createError(401, "Invalid authorization token provided!"));
  }
}