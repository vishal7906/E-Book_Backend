/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction , Request , Response} from "express";

const createBook = (req:Request,res:Response,next:NextFunction)=>{
    res.json({message:{}})
}
export {createBook};