import { v2 as cloudinary } from 'cloudinary';
import { config } from './config';

cloudinary.config({ 
    cloud_name: config.cloudname,
    api_key: config.cloudApiKey, 
    api_secret: config.cloudSecretKey // Click 'View Credentials' below to copy your API secret
});
export default cloudinary;