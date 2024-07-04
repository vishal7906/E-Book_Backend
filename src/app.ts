/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';

const app = express();
//HTTP methods - GET , POST , PUT , PATCH , DELETE

app.get('/',(req,res,next)=>{
    res.json({message:"Welcom to E-Lib api"})
})

export default app;