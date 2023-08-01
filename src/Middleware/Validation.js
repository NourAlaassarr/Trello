//req ==> data
//schema => endpoints
import joi from "joi"
const reqMethods = ['body','query','params','headers','file','files']

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
  return helpers.error('any.invalid');
  }
  return value;
};
export const generalFields = {
    email: joi
    .string()
    .email({ tlds: { allow: ['com', 'net', 'org'] } })
    .required(),
    password: joi
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .messages({
        'string.pattern.base': 'Password regex fail',
    })
    .required(),

    IDTask:joi.string().custom(objectId, 'Object Id Validation').required()
}
export const validationCoreFunction = (schema) => {
    return (req, res, next) => {
      // req
    const validationErrorArr = []
    for (const key of reqMethods) {
        if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
            abortEarly: false,
          }) // error
          if (validationResult.error) {
            validationErrorArr.push(validationResult.error.details)
          }
        }
      }
  
      if (validationErrorArr.length) {
        return res
          .status(400)
          .json({ message: 'Validation Error', Errors: validationErrorArr })
      }
  
      next()
    }
  }