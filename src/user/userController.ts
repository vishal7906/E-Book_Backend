/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response,Request,NextFunction } from "express";
import createHttpError from "http-errors";

const createUser = async(req:Request,res:Response,next:NextFunction)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        const error = createHttpError(400,"All Field Required")
        return next(error);
    }
    res.json({message:"User Created Successfully"})
}
export {createUser}