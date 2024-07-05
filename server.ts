//import { config } from "./src/config/config";
import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";

const startServer = async ()=>{
    await connectDB() // connecting to DB
    const port = config.port || 3000

    app.listen(port,()=>{
        console.log(`Listening on Port ${port}`);
    })
}
startServer()
