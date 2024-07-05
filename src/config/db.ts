import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async ()=>{
    try {
        mongoose.connection.on('connected',()=>{
            console.log("Connected Successfuly to DB");
        })
        mongoose.connection.on('error',(error)=>{ // provide error if there is any error after connection to DB
            console.log("Error while connecting to DB",error);
            
        })
        await mongoose.connect(`${config.dburl as string}/ebook-db`);
    } catch (error) {
        console.error("Error while connection to the Database",error);
        process.exit(1); // to stop server if there is any error
    }
}
export default connectDB