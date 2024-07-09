import { NextFunction , Request , Response} from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from 'node:fs';

const createBook = async (req:Request,res:Response,next:NextFunction)=>{
    const {title,genre} = req.body;
    try {
        const files = req.files as {[fieldname:string]:Express.Multer.File[]};
        if (!files || !files.coverImage || !files.file) {
            return next(createHttpError(400, "Cover image and book file are required"));
        }

    const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname,'../../public/data/uploads',fileName);


    let uploadResult ;
    try {
        uploadResult = await cloudinary.uploader.upload(filePath,{
            filename_override:fileName,
            folder:"book-covers",
            format:coverImageMimeType
        })
    } catch (error) {
        throw createHttpError(500, "Error while uploading cover image to Cloudinary");
    } 
    
    const BookFileName = files.file[0].filename;
    const BookFilePath = path.resolve(__dirname,'../../public/data/uploads',BookFileName);
    
    let BookFileUploadResult;
    try {
        BookFileUploadResult = await cloudinary.uploader.upload(BookFilePath,{
            resource_typetype:"raw",
            filename_override:BookFileName,
            folder:"book-pdfs",
            format:"pdf"
        })
    } catch (error) {
        throw createHttpError(500, "Error while uploading book file to Cloudinary");
    } 

    let newBook;
    try {
        newBook = await bookModel.create({ // adding book into database
            title,
            genre,
            author:"668a34ecb26ac87de0272623",
            coverImage:uploadResult.secure_url,
            file:BookFileUploadResult.secure_url
        })
    } catch (error) {
        return next(createHttpError(500, "Error while creating book in the database"))
    }    
        // Deleting Temporary files from local system
        try {
            await Promise.all([
                fs.promises.unlink(filePath),
                fs.promises.unlink(BookFilePath)
            ]);
        } catch (error) {
            console.error("Error while deleting temporary files", error);
        }
    
        res.json({message:{id:newBook._id}})
    } catch (error) {
        console.log(error);
        return next(createHttpError(500,"Error while Uploading Files"))
    }
}
export {createBook};