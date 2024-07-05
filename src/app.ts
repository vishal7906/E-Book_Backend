/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import GlobalErrorHandler from "./middlewares/GlobalErrorHandler";
const app = express();

// HTTP methods - GET , POST , PUT , PATCH , DELETE

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    const error = createHttpError(400,"Something Went Wrong")
    throw error;
    res.json({ message: "Welcome to E-Lib API" });
});

app.use(GlobalErrorHandler)
export default app;
