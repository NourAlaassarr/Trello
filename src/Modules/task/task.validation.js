
import Joi from 'joi'
import { generalFields } from '../../Middleware/Validation.js';

const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.error('any.invalid');
    }
    return value;
};
export const addtaskSchema = {
body: Joi.object({
    
    title: Joi.string().min(4).max(10).required(),
    description: Joi.string().min(4).max(10).optional(),
    deadline: Joi.date().required(),
    assignTo:Joi.string().custom(objectId, 'Object Id Validation').required()
}).required().options({allowUnknown:true})
};

export const UpdateSchema = {
    body: Joi.object({
        
        title: Joi.string().min(4).max(10).optional,
        description: Joi.string().min(4).max(15).optional(),
        deadline: Joi.date().required().optional(),
        status:Joi.string().valid('toDo', 'doing', 'done').optional(),
        assignTo:Joi.string().custom(objectId, 'Object Id Validation').optional()
    }).required().options({allowUnknown:true}),
    params:Joi.object({
        IDTask:generalFields.IDTask
    })
    };
    export const DeleteTaskSchema={
        params:Joi.object({
            IDTask:Joi.string().custom(objectId, 'Object Id Validation').required()
        })
    }