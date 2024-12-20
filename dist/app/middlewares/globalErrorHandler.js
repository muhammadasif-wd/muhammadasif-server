"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const handleValidationError_1 = __importDefault(require("../../errors/handleValidationError"));
const handleZodError_1 = __importDefault(require("../../errors/handleZodError"));
const handleCastError_1 = __importDefault(require("../../errors/handleCastError"));
const globalErrorHandler = (error, req, res, next) => {
    config_1.default.env === "development"
        ? console.log(`🐱‍🏍 globalErrorHandler ~~`, error)
        : console.error(`🐱‍🏍 globalErrorHandler ~~`, error);
    let statusCode = 500;
    let message = "Something went wrong !";
    let errorMessages = [];
    if ((error === null || error === void 0 ? void 0 : error.name) === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error instanceof ApiError_1.default) {
        statusCode = error === null || error === void 0 ? void 0 : error.statusCode;
        message = error.message;
        errorMessages = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: "",
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    else if (error.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error.code === 11000) {
        statusCode = 409;
        message = "Duplicate key error";
        errorMessages = Object.keys(error.keyValue).map((key) => ({
            path: key,
            message: `${key} already exists.`,
        }));
    }
    else if (error.error) {
        statusCode = error.error.http_code;
        message = error.error.message;
        res.status(statusCode).json({
            success: false,
            statusCode: statusCode,
            message,
            data: null,
            stack: config_1.default.env !== "production" ? error === null || error === void 0 ? void 0 : error.stack : undefined,
        });
    }
    else if (error) {
        const validStatusCode = statusCode && !isNaN(statusCode) ? statusCode : 400;
        statusCode = validStatusCode;
        message = error.message;
        res.status(statusCode).json({
            success: false,
            statusCode: statusCode,
            message,
            data: null,
            stack: config_1.default.env !== "production" ? error === null || error === void 0 ? void 0 : error.stack : undefined,
        });
    }
    else if (error instanceof mongoose_1.Error) {
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
        stack: config_1.default.env !== "production" ? error.stack : undefined,
    });
};
exports.default = globalErrorHandler;
