import { config as conf } from "dotenv";
conf() // using this all .env variable will be available to environment variable
const _config = {
    port: process.env.PORT
}
export const config = Object.freeze(_config);// object.freeze makes a property read-only