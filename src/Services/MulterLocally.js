import multer from 'multer'
import {customAlphabet} from 'nanoid'
import path from 'path'
import fs from 'fs'
import {allowdExtentions}from'./AllowedExtentions.js'
import { allowedNodeEnvironmentFlags } from 'process'

const nanoid=customAlphabet('trollo12345',4)
export const multerFunction = (allowdExtentionsArr,customPath)=>{
    //destination
const storage = multer.diskStorage({
    destination: function (req,file,cb){
    const destpath = path.resolve(`Uploads/${customPath}`)
    if(!fs.existsSync(destpath))
    {
        fs.mkdirSync(destpath,{recursive:true})
    }
    cb(null,destpath)
    },
      //filename
    filename:function (req,file,cb){
        console.log(file)
        const uniquename=nanoid()+file.originalname
        cb(null,uniquename)
    },
    
})
const filefilter = function(req,file,cb){
    if(allowdExtentionsArr.include(file.mimetype))
    {
        return cb (null,true)
    }
    cb(new Error ('invalid extentions'),false)
}

const fileUploads = multer({ filefilter,storage,limits:{
    fields:2,
    
}})
return fileUploads

}