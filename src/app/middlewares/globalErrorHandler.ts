/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */

import {ErrorRequestHandler, NextFunction, Request, Response} from "express";
import {Error} from "mongoose";
import {ZodError} from "zod";
import config from "../../config";

import ApiError from "../../errors/ApiError";
import handleValidationError from "../../errors/handleValidationError";
import handleZodError from "../../errors/handleZodError";
import {IGenericErrorMessage} from "../interfaces/error";
import handleCastError from "../../errors/handleCastError";

const globalErrorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  config.env === "development"
    ? console.log(`🐱‍🏍 globalErrorHandler ~~`, error)
    : console.error(`🐱‍🏍 globalErrorHandler ~~`, error);

  let statusCode = 500;
  let message = "Something went wrong !";
  let errorMessages: IGenericErrorMessage[] = [];

  if (error?.name === "ValidationError") {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error.message;
    errorMessages = error?.message
      ? [
          {
            path: "",
            message: error?.message,
          },
        ]
      : [];
  } else if (error.name === "CastError") {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate key error";
    errorMessages = Object.keys(error.keyValue).map((key) => ({
      path: key,
      message: `${key} already exists.`,
    }));
  } else if (error.error) {
    statusCode = error.error.http_code;
    message = error.error.message;
    res.status(statusCode).json({
      success: false,
      statusCode: statusCode,
      message,
      data: null,
      stack: config.env !== "production" ? error?.stack : undefined,
    });
  } else if (error) {
    const validStatusCode = statusCode && !isNaN(statusCode) ? statusCode : 400;
    statusCode = validStatusCode;
    message = error.message;
    res.status(statusCode).json({
      success: false,
      statusCode: statusCode,
      message,
      data: null,
      stack: config.env !== "production" ? error?.stack : undefined,
    });
  } else if (error instanceof Error) {
    message = error.message;
    errorMessages = error.message
      ? [
          {
            path: "",
            message: error.message,
          },
        ]
      : [];
  }

  const validStatusCode = statusCode && !isNaN(statusCode) ? statusCode : 400;

  res.status(validStatusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.env !== "production" ? error.stack : undefined,
  });
};

export default globalErrorHandler;
