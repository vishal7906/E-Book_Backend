import { config as conf } from "dotenv";
conf() // By using this conf all .env variable will be available to environment variable
const _config = {
    port: process.env.PORT,
    dburl: process.env.MONGODB_URL,
    env:process.env.NODE_ENV
}
export const config = Object.freeze(_config);// object.freeze makes a property read-only