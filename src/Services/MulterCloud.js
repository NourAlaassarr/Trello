import multer from 'multer'

import {allowdExtentions}from'./AllowedExtentions.js'
import {customAlphabet}from 'nanoid'
const nanoid=customAlphabet('trollo12345',4)
export const multerCloudFunction = (allowdExtentionsArr)=>{

const storage = multer.diskStorage({})

const filefilter = function(req,file,cb){
    if(allowdExtentionsArr.include(file.mimetype))
    {
        return cb (null,true)
    }
    cb(new Error ('invalid extentions'),false)
}

const fileUploads = multer({ filefilter,storage
})
return fileUploads

}