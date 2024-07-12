import { NextFunction , Request , Response} from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from 'node:fs';
import { AuthRequest } from "../middlewares/Authenticate";

const createBook = async (req:Request,res:Response,next:NextFunction)=>{
    const {title,genre,description} = req.body;
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
            resource_type:"raw",
            filename_override:BookFileName,
            folder:"book-pdfs",
            format:"pdf"
        })
    } catch (error) {
        throw createHttpError(500, "Error while uploading book file to Cloudinary");
    } 

    let newBook;
    const _req = req as AuthRequest;

    try {
        newBook = await bookModel.create({ // adding book into database
            title,
            description,
            genre,
            author:_req.userId,
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
    
        res.status(201).json({message:{id:newBook._id}})
    } catch (error) {
        console.log(error);
        return next(createHttpError(500,"Error while Uploading Files"))
    }
}
const updateBook = async(req:Request,res:Response,next:NextFunction)=>{
    const {title,genre} = req.body;
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({_id:bookId});

    if (!book) {
        return next(createHttpError(404,"Book Not Found"));
    }
    const _req = req as AuthRequest;
    
    if(book.author.toString()!= _req.userId){
        return next(createHttpError(403,"Unauthorized Access"))
    }

    let completeCoverImage="";
    const files = req.files as {[fieldname:string]:Express.Multer.File[]};
    if (files.coverImage) {
        //const convertedMimeType = files.coverImage[0].mimetype.split('/').at(-1);
        const coverFileSplit = book.coverImage.split('/');
        const coverImagePublicId = coverFileSplit.at(-2) + "/" + coverFileSplit.at(-1)?.split('.').at(-2);
        try {
            await cloudinary.uploader.destroy(coverImagePublicId); // deleting previously stored coverImage from cloudinary
           } catch (error) {
            return next(createHttpError(500,"Error while Deleting Cover Image"))
        }
        
        const fileName = files.coverImage[0].filename;
        const filePath = path.resolve(__dirname,'../../public/data/uploads',fileName);

        completeCoverImage = fileName

        const uploadResult = await cloudinary.uploader.upload(filePath,{
            filename_override:completeCoverImage,
            folder:"book-covers",
        })
        completeCoverImage = uploadResult.secure_url
        await fs.promises.unlink(filePath)
    }
    let completeFileName = "";
    if(files.file){
        const BookFileSplit = book.file.split('/');
        const BookFilePublicId = BookFileSplit.at(-2) + "/" + BookFileSplit.at(-1);
        try {
            await cloudinary.uploader.destroy(BookFilePublicId,{
                resource_type:"raw"
            });
        } catch (error) {
            return next(createHttpError(500,"Error while Deleting Cover Image"))
        }
        const convertedMimeType = files.file[0].mimetype.split('/').at(-1);
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname,'../../public/data/uploads',bookFileName);

        completeFileName = `${bookFileName}.${convertedMimeType}`;

        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath,{
            resource_type:"raw",
            filename_override:completeFileName,
            folder:"book-pdfs"
        })
        completeFileName=uploadResultPdf.secure_url;
        await fs.promises.unlink(bookFilePath);

    }
    const updateBook = await bookModel.findOneAndUpdate(
        {
            _id:bookId
        },
        {
            title:title,
            genre:genre,
            coverImage:completeCoverImage?completeCoverImage:book.coverImage,
            file:completeFileName?completeFileName:book.file
        },
        {new:true}
    )
   
    res.json(updateBook);
}
const getBook = async(req:Request,res:Response,next:NextFunction)=>{

    try {
        const book = await bookModel.find().populate("author","name");
        return res.status(200).json(book)
    } catch (error) {
        return next(createHttpError(400,"Error while Fetching Books"))
    }
}
const getSingleBook = async(req:Request,res:Response,next:NextFunction)=>{
    const bookId = req.params.bookId;
    try {
        const book = await bookModel.find({_id:bookId}).populate("author","name");
        if (!book) {
            return next(createHttpError(404,"Book Not Found"))
        }
        return res.json(book)
    } catch (error) {
        return next(createHttpError(500,"Error while Fetching Single Book"))
    }
}
const deleteBook = async(req:Request,res:Response,next:NextFunction)=>{
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({_id:bookId})
    if (!book) {
        return next(createHttpError(404,"Book Not Found"));
    }
    
    const _req = req as AuthRequest;
    if(book.author.toString()!= _req.userId){
        return next(createHttpError(403,"Unauthorized Access"))
    }
    const coverFileSplit = book.coverImage.split('/');
    const coverImagePublicId = coverFileSplit.at(-2) + "/" + coverFileSplit.at(-1)?.split('.').at(-2);
    
    const BookFileSplit = book.file.split('/');
    const BookFilePublicId = BookFileSplit.at(-2) + "/" + BookFileSplit.at(-1);
    
   try {
    await cloudinary.uploader.destroy(coverImagePublicId);
   } catch (error) {
    return next(createHttpError(500,"Error while Deleting Cover Image"))
   }
   try {
    await cloudinary.uploader.destroy(BookFilePublicId,{
        resource_type:"raw"
    });
   } catch (error) {
    return next(createHttpError(500,"Error while Deleting File"))
   }
   await bookModel.deleteOne({_id:bookId})
    return res.sendStatus(204);
}
export {createBook,updateBook,getBook,getSingleBook,deleteBook};