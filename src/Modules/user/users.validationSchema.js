import joi from 'joi'
import { generalFields } from '../../Middleware/Validation.js'

export const SignUPSchema={
    body:joi.object({
        username:joi.string().max(9).min(3).required(),
        email:generalFields.email,
        password:generalFields.password,
        Cpassword:joi.ref('password'),
        FirstName:joi.string().optional(),
        LastName:joi.string().optional(),
        gender:joi.string().optional(),
        age:joi.number().optional(),
        phone:joi.string().max(11).min(11).required(),
    }).required(),
}

export const loginSchema ={
    body:
    joi.object({
    email:generalFields.email,
    password:generalFields.password,
    })
}

export const UpdateSchema={
    body:
    joi.object({
    FirstName:joi.string().optional(),
    LastName:joi.string().optional(),
    Age:joi.number().optional(),
    phone:joi.string().max(11).min(11).optional(),
    username:joi.string().max(9).min(3).optional(),
    })
}

export const change ={
    body:joi.object({
        oldPassword:generalFields.password,
        newPassword:generalFields.password,
        CNPassword:joi.ref('newPassword'),
    })
}