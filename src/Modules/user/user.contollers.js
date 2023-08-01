import {UserModel}from '../../../DB/Models/user.Model.js'
import bcrypt from 'bcrypt'
import Jwt  from 'jsonwebtoken'

import { asyncHandler } from '../utlis/ErrorHandling.js'
import { sendmailService } from '../../Services/SendEmailService.js'
import cloudinary from '../utlis/CloudinaryConfig.js'
import { generateQRcode } from '../utlis/Qrcodefunction.js'
import { GenerateToken, VerifyToken } from '../utlis/TokenFunctions.js'


//1-signUp 
export const signUp= async(req,res,next)=>
{
    const {username,email,password,Cpassword,gender,age,phone, FirstName, LastName}=req.body
        
        const Check = await UserModel.find({email})
        if(Check.length>0)
        {
        return res.json({Message:'Email already exists,signin instead'})
        }
        const Phonecheck = await UserModel.find({phone})
        if(Phonecheck.length >0)
        {
        return res.json({Message:'phone number already used'})
        }

        if(password!=Cpassword)
        {
            return res.json({Message:'Password doesn\'t match.!'})
        }
        //confirm email
        const token = Jwt.sign({email, id:Check._id},process.env.CONFIRMATION_EMAIL_TOKEN,{
            expiresIn: '1h',})
            const confirmlink= `${req.protocol}//${req.headers.host}/user/ConfirmEmail/${token}`
            const message = `<a href=${confirmlink}> Click to confirm your email </a>`
            const isEmailSent = await sendmailService({
                message,
                to:email,
                subject:'confirmation email'
            })
            if (!isEmailSent) {
                return res.json({ message: 'Please try again later or contact the support team' })
            }

        // await sendmailService({
        //     to:email,
        //     message:`<h1>test sendEmail <h1>`,
        //     subject:'TEST'

        // })
        const hashedPassword = bcrypt.hashSync(password,+process.env.SALT_ROUNDS)
        const UserInstance = new UserModel({username,email,password:hashedPassword,Cpassword:hashedPassword,gender,Age:age,phone, FirstName, LastName})
        await UserInstance.save()
        return res.status(200).json({ message: 'Done', UserInstance })
}

export const confirm = async(req,res,next)=>
{
    const{token}=req.params
    if(!token)
    {
        return res.json('token not provided')
    }
    const decodeddata = VerifyToken({token,
        signbature:process.env.CONFIRMATION_EMAIL_TOKEN})
        if (!decodeddata) {
            return next(
            new Error('token decode fail, invalid token', {
                cause: 400,
            }),
            )}
    const conf = await UserModel.findOne({email:decodeddata.email})
    if (conf.isConfirmed) {
        return res.status(400).json({ message: 'Your email is already confirmed' })
    }
    const user = await UserModel.findOneAndUpdate(
        { email: decodeddata.email },
        { isConfirmed: true },
        {new: true},
    )
    res.status(200).json({ message: 'Confirmed successfully please try to login', user })
    }

// 2-login-->with create token
export const login = async (req,res,next)=>{

        const {email,password}=req.body
        const userExist = await UserModel.findOneAndUpdate({email},{isOnline:true,isDeleted:false,isConfirmed:true})
        if(!userExist)
        {
            return res.status(400).json({Message:'invalid-User Credentials'})
        }
        const MatchPass = bcrypt.compareSync(password,userExist.password)
        if(!MatchPass)
        {
            return res.status(400).json({Message:'invalid-User Credentials'})
        }
        const usertoken=GenerateToken({
            payload:{name:userExist.username,id:userExist._id,isLoggedin:true},
            signbature:process.env.SIGN_IN_TOKEN_SECRET,
            expiresIn:20,
        })
        if(!usertoken){
            return next(
                new Error('token generation failed,payload cannot be empty',{cause :400})
            )
        }
        //const usertoken = Jwt.sign({name:userExist.username,id:userExist._id,isLoggedin:true},process.env.SIGN_IN_TOKEN_SECRET,{expiresIn:20})
        userExist.token=usertoken
        await userExist.save()
        res.status(200).json({ message: 'successfully logged-IN',usertoken })

    
}

// 3-change password (user must be logged in)
export const change= async(req,res,next)=>
{
    const {oldPassword,newPassword,CNPassword}=req.body
        const {_id} = req.authUser

        const user = await UserModel.findById(_id)
        if(!user)
        {
            return res.status(404).json({message: 'NoT found.'})
        }
        
        if(!user.isOnline)
        {
            return res.json({ message: 'Please log-in first'});
        }
        if(user.isDeleted)
        {
            return res.json({ message: 'User Soft Deleted Please log-in first'});
        }
        
        const hashed = bcrypt.compareSync(oldPassword,user.password)
        if(!hashed)
        {
            return res.json({ message: 'Old Password Doesn\'t match' })
        }
        if(newPassword!=CNPassword)
        {
            return res.json({ message: 'password doesn \'t match'})
        }
        const encode = bcrypt.hashSync(newPassword,+process.env.SALT_ROUNDS)
        const update = await UserModel.updateOne({_id},{
            password:encode,
            Cpassword:encode
        })
        return res.json({ message: 'changed successfully',update})       
}

// 4-update user (age , firstName , lastName)(user must be logged in)
export const Update= async(req,res,next)=>
{
    const{FirstName,LastName,Age,phone,username}=req.body
    const {_id}=req.authUser
        const findUser = await UserModel.findById(_id);
        if (!findUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if(!findUser.isOnline )
        {
            return res.json({ message: 'Please log-in first'});
        }
        if(findUser.isDeleted)
        {
            return res.json({ message: 'User Soft Deleted Please log-in first'});
        }
    const checkPhone = await UserModel.findOne({ phone :phone });
    if (checkPhone) {
    return res.json({ message: 'Failed. Phone number already exists.' });
    }
        const updateUser = await UserModel.findByIdAndUpdate({_id },{
            FirstName,
            LastName,
            Age,
            phone,
            username,
            phone
        })
        return res.status(200).json({message: 'Succeffully updated',updateUser}) 
}

// 5-delete user(user must be logged in)
export const deleteuser =async (req,res,next)=>
{
        const {_id}=req.authUser
        const finduser=await UserModel.findOne({_id})
        if(!finduser)
        {
            return res.status(404).json({ message: 'User not found.' });
        }
        if(!finduser.isOnline)
        {
            return res.json({ message: 'Please log-in first'});
        
        }
        if(finduser.isDeleted)
        {
            return res.json({ message: 'User Soft Deleted Please log-in first'});
        }
        await cloudinary.uploader.destroy(finduser.ProfilePic.public_id)
        await cloudinary.api.delete_resources([{public_id:finduser.CoverPic}])//delete pic
        await cloudinary.api.delete_resources_by_prefix( `user/Covers/${_id}`)//delete bulk
        await cloudinary.api.delete_folder(`user/Covers/${_id}`);//delete folder

        const user=await UserModel.deleteOne({_id})
        return res.json({ message: 'Deleted successfully',Delete:user.deletedCount });

}

// 6-soft delete(user must be logged in)
export  const softDelete= async(req,res,next)=>{
    
        const {_id}=req.authUser
        const user = await UserModel.findById({_id})
        
        if(!user)
        {
            return res.status(404).json({message: 'User not found'})
        }
        if(!user.isOnline)
        {
            return res.json({ message: 'Please log-in first'});
        }
        const UserOffline = await UserModel.updateOne({_id},{
            isDeleted:true
        })
        if(UserOffline.modifiedCount)
        {
            return res.json({message: 'soft deleted  successfully',UserOffline})
        }
        return res.json({message: 'failed'})
}



// 7-logout
export const logout =async (req,res,next)=>
{
    const {_id}=req.authUser
        const user = await UserModel.findById({_id})
        if(!user)
        {
            return res.status(404).json({message: 'User not found'})
        }
        if(user.isDeleted)
        {
            return res.json({ message: 'User Soft Deleted Please log-in first'});
        }
        const UserOffline = await UserModel.updateOne({_id},{
            isOnline:false
        })
        if(UserOffline.modifiedCount)
        {
            return res.status(200).json({message: 'Logged Out successfully',UserOffline})
        }
        return res.json({message: 'failed'})
        
}

//locally
 // if (findUser._id.toString() !== _id) {
        //     return res.json({ message: 'Unauthorized access.' });
        // }

// export const ProfilePic = async (req,res,next)=>{
//     const {_id}=req.authUser
//     if(!req.file)
//     {
//         return next(new Error ('please Upload profile pic'))}
//     const user = await UserModel.findByIdAndUpdate(_id,{
//     ProfilePic:req.file.path, 
//     },
//     {new:true},
//     )
//     res.status(200).json({Message:'done', user})
// }


//cloud
export  const ProfilePicture = async (req,res,next)=>
{

    const {_id}=req.authUser
    if(!req.file)
    {
        return next(new Error ('please Upload profile pic'))
    }
        const {public_id,secure_url} = await cloudinary.uploader.upload(req.file.path,{
            folder:`user/profiles/${req.authUser._id}`,
            use_filename:true,
            unique_filename:true,
            resource_type:"image",
        })
        const user = await UserModel.findByIdAndUpdate(_id,{
                ProfilePic:{public_id,secure_url}
                },
                {new:true},
                )
            if(!user)
            {
                await cloudinary.uploader.destroy(public_id)
                // await cloudinary.api.delete_resources([public_id])
            }
            
        res.status(200).json({Message:'done',user})
}


        export const getUser = async (req,res,next)=>
        {
            const{_id}=req.authUser
            const user = await UserModel.findById(_id,'username')
            if(!user){
                res.status(400).json({ message: 'invalid_user Credentials', user })
            }
            const qrcode= await generateQRcode({data:user})
            res.status(200).json({ message: 'Done', qrcode })
        }

// export const CoverPicure  = async (req,res,next)=>{
//     const {_id}=req.authUser
//     if(!req.files)
//     {
//         return next(new Error ('please Upload  pic'))}
//         const CoverImages =[]
//         for(const file of req.files)
//         {
//             CoverImages.push(file.path)
//         }
//         const user = await UserModel.findById(_id)
//         user.CoverPic.length ? CoverImages.push(...user.CoverPic):CoverImages
//         const user2 = await UserModel.findByIdAndUpdate(_id,{
//             CoverPic:CoverImages
//             },
//             {new:true},
//             )
//             res.status(200).json({Message:'done', user2})
//     }
export const coverPictures = async (req, res, next) => {
    const { _id } = req.authUser
    if (!req.files) {
        return next(new Error('please upload Pics', { cause: 400 }))
    }
    const coverImages = []
    for (const file in req.files) {
        for (const key of req.files[file]) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            key.path,
            {
            folder: `user/Covers/${_id}`,
            resource_type: 'image',
        },
        )
        coverImages.push({ secure_url, public_id })
    }
    }
    const user = await UserModel.findById(_id)
    user.CoverPic.length
    ? coverImages.push(...user.CoverPic)
    : coverImages

    const userNew = await UserModel.findByIdAndUpdate(
    _id,
    {
        CoverPic: coverImages,
    },
    {
        new: true,
    },
    )
    res.status(200).json({ message: 'Done', userNew })
}