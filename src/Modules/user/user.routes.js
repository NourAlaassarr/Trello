import { Router } from "express";
import * as UserControllers from './user.contollers.js'
import { asyncHandler } from '../utlis/ErrorHandling.js'
import { isAuth } from "../../Middleware/auth.js";
import { SignUPSchema, loginSchema,UpdateSchema,change } from "./users.validationSchema.js"
import {validationCoreFunction}from '../../Middleware/Validation.js'
import {multerFunction} from '../../Services/MulterLocally.js'
import { allowdExtentions } from "../../Services/AllowedExtentions.js";
import { multerCloudFunction } from "../../Services/MulterCloud.js";

const router = Router()
router.post('/signUp',validationCoreFunction(SignUPSchema),asyncHandler(UserControllers.signUp))//signUp

router.get('/ConfirmEmail/:token',asyncHandler(UserControllers.confirm))

router.post('/logIn',validationCoreFunction(loginSchema),asyncHandler(UserControllers.login))//logIn

router.patch('/changepassword',validationCoreFunction(change),isAuth(),asyncHandler(UserControllers.change))//changepassword

router.patch('/updateuser',validationCoreFunction(UpdateSchema),isAuth(),asyncHandler(UserControllers.Update))//updateuser

router.delete('/deleteuser',isAuth(),asyncHandler(UserControllers.deleteuser))//delete user

router.patch('/logout',isAuth(),asyncHandler(UserControllers.logout))//logout

router.patch('/softDelete', isAuth(),asyncHandler(UserControllers.softDelete))//softDelete

router.post('/profilePicture',isAuth(),multerCloudFunction(allowdExtentions.Image).single('profile'),asyncHandler(UserControllers.ProfilePicture))
router.get(isAuth(),asyncHandler(UserControllers.getUser))

router.post('/CoverPic',isAuth(),multerCloudFunction(allowdExtentions.Image).fields([{ name: 'cover',maxCount:3 }]),asyncHandler(UserControllers.coverPictures))
router.get('/GetQr',isAuth(),asyncHandler(UserControllers.getUser))


export default router