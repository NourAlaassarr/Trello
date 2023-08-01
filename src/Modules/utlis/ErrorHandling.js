//error handler

export const  asyncHandler=(API)=>{
    return (req,res,next)=>
    {
        API(req,res,next).catch((error)=>{
            console.log(error)
        return res.json({Message:'Error',Error:error})
        })
    }

}