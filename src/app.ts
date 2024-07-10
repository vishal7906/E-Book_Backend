/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response, NextFunction } from "express";
import cors from 'cors';
import GlobalErrorHandler from "./middlewares/GlobalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./Book/bookRouter";
import { config } from "./config/config";
const app = express();

// HTTP methods - GET , POST , PUT , PATCH , DELETE
app.use(express.json()) // it is used to parse json data from the user
app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Welcome to E-Lib API" });
});
app.use(cors({
    origin:config.FrontendUrl
}));


app.use('/api/users',userRouter);
app.use('/api/books',bookRouter);


app.use(GlobalErrorHandler)
export default app;
