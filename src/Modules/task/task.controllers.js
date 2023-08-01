import {TaskModel} from '../../../DB/Models/Task.Model.js'
import  Jwt from 'jsonwebtoken'
import { UserModel } from '../../../DB/Models/user.Model.js'
import cloudinary from '../utlis/CloudinaryConfig.js'

// 1-add task with status (toDo)(user must be logged in)   //na2s hett el date lw valid or not
export const addtask = async (req,res,next)=>{
    const {title,description,deadline,assignTo}=req.body
    const {_id}=req.authUser

const checkuser=await UserModel.findById({_id})
const user=await UserModel.findOne({_id:assignTo})
const checktitle=await TaskModel.findOne({title})
const timestamp = Date.parse(deadline)
if (isNaN(timestamp) || timestamp < Date.now()) {
    return res.json({ Message: 'Invalid date or date is in the past' })
}
if(checktitle)
{
    return res.json({Message:'title already exist'})
}
if(!user )
{
    return res.status(404).json({Message:' assigned to user doesn\'t exist'})
}
if(!checkuser )
{
    return res.status(404).json({Message:'user doesn\'t exist'})
}
if(!checkuser.isOnline || checkuser.isDeleted)
{
    return res.status(400).json({Message:'Please sign in first'})
}
const taskInstance= new TaskModel({title,description,deadline,assignTo,userId:_id})
await taskInstance.save()

return res.status(200).json({Message:'done',taskInstance})
}


//2-update task (title , description , status) and assign task to other user(user must be logged in) (creator only can update task)
export const UpdateTask=async(req,res,next)=>
{
const {title,description,status,deadline,assigTo}=req.body
const {IDTask}=req.params
const {_id}=req.authUser

const User=await UserModel.findById({_id})
const checktitle=await TaskModel.findOne({title})
const findtask=await TaskModel.findById({_id:IDTask})
const timestamp = Date.parse(deadline)
if (isNaN(timestamp) || timestamp < Date.now()) {
    return res.json({ Message: 'Invalid date or date is in the past' })
}
if(!findtask)
{
    return res.status(404).json({Message:'task doesn\'t exist'})
}
if(checktitle)
{
    return res.status(404).json({Message:'title already exist'})
}
if(!User )
{
    return res.status(402).json({Message:'user doesn\'t exist'})
}

if(!User.isOnline || User.isDeleted)
{
    return res.status(400).json({Message:'Please sign in first'})
}
if(!_id == findtask.userId )
{
    return res.status(401).json({Message:'failed not authorized '})
}

const tobeupdated = await TaskModel.findByIdAndUpdate(IDTask,{
title,
description,
status,
deadline,
assigTo
},{new:true})
return res.status(200).json({Message:'Done',Updated:tobeupdated})
}



// 3-delete task(user must be logged in) (creator only can delete task)
export const DeleteTask=async(req,res,next)=>
{
    const {IDTask}=req.params
    const {_id}=req.authUser


const User=await UserModel.findById(_id)
const findtask=await TaskModel.findById(IDTask)
if(!findtask)
{return res.status(404).json({Message:'task doesn\'t exist'})}

if(!User )
{return res.status(404).json({Message:'user doesn\'t exist'})}

if(!User.isOnline || User.isDeleted)
{return res.status(400).json({Message:'Please sign in first'})}

if(_id == findtask.userId.toString())
{   
    try {
    // Delete the task profile picture
    if (findtask.ProfilePic) {
        await cloudinary.uploader.destroy(findtask.ProfilePic.public_id);
    }

    // Delete task cover pictures
    if (findtask.CoverPic && findtask.CoverPic.length > 0) {
        for (const pic of findtask.CoverPic) {
            await cloudinary.uploader.destroy(pic.public_id);
        }
    }

    // Delete (bulk delete)with this prefix
    await cloudinary.api.delete_resources_by_prefix(`Task/Covers/${IDTask}`);

    // Delete the main folder
    await cloudinary.api.delete_folder(`Task/Covers/${IDTask}`);

    // Delete the task document
    await TaskModel.findByIdAndDelete(IDTask);

    return res.status(200).json({ Message: 'Task deleted successfully' });
} catch (error) {
    return next(error); 
}
}
return res.status(401).json({Message:'Failed unauthorized',})


}


// 4-get all tasks with user data  
export const GetAllWithUserData= async(req,res,next)=>
{
const Getall= await TaskModel.find().populate([
    { path: 'userId', select: 'username email _id' },
    { path: 'assignTo', select: 'username email _id' }
])
return res.status(200).json({Message:'done',Getall})
}


// 5-get tasks of oneUser with user data (user must be logged in) //get all tasks assign to me
export const getUserData = async (req,res,next)=>
{
    const {_id}=req.authUser

    const checkuser=await UserModel.findById({_id})
    if(!checkuser )
{
    return res.status(404).json({Message:'user doesn\'t exist'})
}
if(!checkuser.isOnline || checkuser.isDeleted)
{
    return res.status(401).json({Message:'Please sign in first'})
}
const GEt = await TaskModel.find({ assignTo: _id }).populate([
    { path: 'userId', select: 'username email _id' },
    { path: 'assignTo', select: 'username email _id' }
])
return res.status(200).json({Message:'done',GEt})

}


// 6-get all tasks that not done after deadline // "get all late tasks
export const Late = async (req, res, next) => {
    const {_id}=req.authUser
    const checkuser = await UserModel.findById(_id);
    if (!checkuser) {
    return res.status(404).json({ Message: 'User not found' });
    }
    const tasks = await TaskModel.find({
    $or: [{ assignTo: _id }, { userId: _id }],
    deadline: { $lt: Date.now() },
    status: { $ne: 'done' }
    });
    res.status(200).json({ Message: 'Done', tasks });
};


//7 get all  tasks
export const GetAll= async(req,res,next)=>
{
const Get= await TaskModel.find()
return res.status(200).json({Message:'done',Get})
}

//8-get all created tasks
export const getCreated = async (req,res,next)=>
{
    const {_id}=req.authUser

const user= await UserModel.findById(_id)
if(!user){
    return res.status(404).json({Message:'user not found '})
}
if(!user.isOnline || user.isDeleted)
{
    return res.jstatus(400).son({Message:'Please sign in first'})
}
const get = await TaskModel.find({ userId: _id }).populate([
    { path: 'userId', select: 'username email _id' },
    { path: 'assignTo', select: 'username email _id' }
])
return res.status(200).json({Message:'done',get})
}

//only who created the task can upload img
export const taskProfile = async (req, res, next) => {
    const { _id } = req.authUser;
    const { taskId } = req.params;
    const user = await UserModel.findById(_id);

    if (!user) {
        return res.status(404).json({ Message: 'user not found' });
    }
    if (!user.isOnline || user.isDeleted) {
        return res.status(400).json({ Message: 'Please sign in first' });
    }
    if (!req.file) {
        return next(new Error('please upload task pic', { cause: 400 }));
    }

    const taskid = await TaskModel.findById(taskId);

    if (!taskid) {
        return next(new Error('Task is not found', { cause: 404 }));
    }

    if (_id == taskid.userId.toString()) {
        

    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Task/Pic/${taskId}`,
        resource_type: 'image',
        unique_filename: true,
    });

    const task = await TaskModel.findByIdAndUpdate(
        taskId,
        {
            ProfilePic: { public_id, secure_url },
        },
        { new: true },
    );

    if (!task) {
        await cloudinary.uploader.destroy(public_id);
        return res.status(404).json({ Message: 'Task not found' });
    }

    res.status(200).json({ message: 'done', task });
}
return res.status(401).json({ Message: 'Failed unauthorized' });
};



//cover pic only creator can add
export const coverPictures = async (req, res, next) => {
    const { _id } = req.authUser;
    const { taskId } = req.params;
    const user = await UserModel.findById(_id);

    if (!req.files) {
        return next(new Error('please upload Pics', { cause: 400 }));
    }
    if (!user) {
        return res.status(404).json({ Message: 'user not found ' });
    }
    if (!user.isOnline || user.isDeleted) {
        return res.status(400).json({ Message: 'Please sign in first' });
    }

    const taskid = await TaskModel.findById(taskId);

    if (!taskid) {
        return next(new Error('Task is not found', { cause: 404 }));
    }

    if (_id == taskid.userId.toString()) {
        
    

    const coverImages = [];
    for (const file in req.files) {
        for (const key of req.files[file]) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(key.path, {
                folder: `Task/Covers/${taskId}`,
                resource_type: 'image',
            });
            coverImages.push({ secure_url, public_id });
        }
    }

    user.CoverPic.length
        ? coverImages.push(...taskid.CoverPic)
        : coverImages;

    const userNew = await TaskModel.findByIdAndUpdate(
        taskId,
        {
            CoverPic: coverImages,
        },
        {
            new: true,
        },
    );
    res.status(200).json({ message: 'Done', userNew });
    }
    return res.status(401).json({ message: 'unauthorized' });
};
