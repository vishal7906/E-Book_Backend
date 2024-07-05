/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

const GlobalErrorHandler = // Error handling middleware
(err:HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({ message: err.message , errorStack:config.env === "development"?err.stack:"" });
};
export default GlobalErrorHandler;