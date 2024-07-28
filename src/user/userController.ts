import { Response,Request,NextFunction } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "./userModel";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async(req:Request,res:Response,next:NextFunction)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){ // validation
        const error = createHttpError(400,"All Fields Required")
        return next(error);
    }

    try { // checking if user with email already exists
        const user = await userModel.findOne({email}); 
    if(user){
        const error = createHttpError(400,"Email already exists")
        return next(error);
    }
    } catch (error) {
        return next(createHttpError(500,"Error while getting user"))
    }

    let hashedPassword:string; // hashing password
    try {
        hashedPassword = await bcrypt.hash(password,10)
    } catch (error) {
        return next(createHttpError(500,"Error while Hashing Password"))
    }
    
    let newUser:User;

    try { // creating user 
        newUser = await userModel.create({
            name,
            email,
            password:hashedPassword
        })
    } catch (error) {
        return next(createHttpError(500,'Error while creating user'))
    }

    try { // generation JWT token
    const token= jwt.sign({sub:newUser._id},config.jwtToken as string,{expiresIn:'7d'});
    res.status(201).json({accessToken:token})
    } catch (error) {
        return next(createHttpError(500,"Error while creating JWT token"))
    }
    
}
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) { // validation
        return next(createHttpError(400, "All Fields Required"));
    }

    let user: User | null;
    try { // checking if user exists or not
        user = await userModel.findOne({ email });
        if (!user) {
            return next(createHttpError(400, "User not Found"));
        }
    } catch (error) {
        return next(createHttpError(500, "Error while fetching user"));
    }

    try {
        const matchingPassword = await bcrypt.compare(password, user.password); // matching password stored in the database with req.body password
        if (!matchingPassword) {
            return next(createHttpError(400, "Password is Incorrect"));
        }
    } catch (error) {
        return next(createHttpError(500, "Error while comparing passwords"));
    }

    let token: string;
    const userId = user._id;
    try { // generation JWT token
        token = jwt.sign({ sub: user._id }, config.jwtToken as string, { expiresIn: '7d' });
        res.status(201).json({ accessToken: token ,userId});
    } catch (error) {
        return next(createHttpError(500, "Error while creating JWT token"));
    }
};
export {createUser , loginUser}