/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response,Request,NextFunction } from "express";

const createUser = async(req:Request,res:Response,next:NextFunction)=>{
    res.json({message:"User Created Successfully"})
}
export {createUser}