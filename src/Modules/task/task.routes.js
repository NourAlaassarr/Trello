
import { asyncHandler } from "../utlis/ErrorHandling.js";
import * as tc from './task.controllers.js'
import { Router } from "express";
import { isAuth } from "../../Middleware/auth.js";
import { validationCoreFunction } from "../../Middleware/Validation.js";
import { addtaskSchema,UpdateSchema,DeleteTaskSchema } from "./task.validation.js";
import { multerCloudFunction } from "../../Services/MulterCloud.js";
import { allowdExtentions } from "../../Services/AllowedExtentions.js";

const router = Router()
router.post('/addTask',validationCoreFunction(addtaskSchema),isAuth(),asyncHandler(tc.addtask))//Add

router.put('/UpdateTask/:IDTask',validationCoreFunction(UpdateSchema),isAuth(),asyncHandler(tc.UpdateTask))//update

router.get('/GetAllWithuserdata',asyncHandler(tc.GetAllWithUserData))//Get All with user data

router.get('/GetAll',asyncHandler(tc.GetAll))// get all tasks

router.get('/getalltasksassigntoanyuser',isAuth(),asyncHandler(tc.getUserData))//get all tasks assigned to specific user

router.delete('/DeleteTask/:IDTask',validationCoreFunction(DeleteTaskSchema),isAuth(),asyncHandler(tc.DeleteTask))//delete

router.get('/getalllatetasks',isAuth(),asyncHandler(tc.Late))//get late tasks

router.get('/GetCreated',isAuth(),asyncHandler(tc.getCreated))//get all task created by user
router.post('/TaskProfile/:taskId',isAuth(),multerCloudFunction(allowdExtentions.Image).single('profile'),asyncHandler(tc.taskProfile))
router.post('/CoverPic/:taskId',isAuth(),multerCloudFunction(allowdExtentions.Image).fields([{ name: 'cover',maxCount:3 }]),asyncHandler(tc.coverPictures))
export default router