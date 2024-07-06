/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response,Request,NextFunction } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "./userModel";

const createUser = async(req:Request,res:Response,next:NextFunction)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        const error = createHttpError(400,"All Field Required")
        return next(error);
    }
    const user = await userModel.findOne({email}); // checking if user with email already exists
    if(user){
        const error = createHttpError(400,"Email already exists")
        return next(error);
    }
    const hashedPassword = await bcrypt.hash(password,10)

    const newUser = await userModel.create({
        name,
        email,
        password:hashedPassword
    })
    res.json({id:newUser._id})
}
export {createUser}