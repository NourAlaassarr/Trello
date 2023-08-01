import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema({

    title:{
        type:String,
        unique:true,
        required:true,
        lowercase:true

    } ,
    description:
    {
        type:String,
        required:true,

    } , 
    status:
    {
    type: String,
    enum:['toDo' , 'doing' , 'done'],
    default:'toDo'
},
    userId:
    {
        type:mongoose.Types.ObjectId,
        ref:'user',

    } , 
    assignTo:
    {
        type:mongoose.Types.ObjectId,
        ref:'user',
    }, 
    deadline:
    {
        type:Date,
        default:Date.now

    },
    isDeletedT:
    {
        type:Boolean,
        default:false

    },
    ProfilePic:{
        public_id:String,
        secure_url:String
    },
    CoverPic:[{
        public_id:String,
        secure_url:String
    },
    ],
}

,{timestamps:true})

export const TaskModel=mongoose.model('task',TaskSchema)