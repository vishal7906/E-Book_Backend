import express from 'express'
import { createUser } from './userController';

const userRouter = express.Router();

// user register router
userRouter.post('/register',createUser)

export default userRouter;