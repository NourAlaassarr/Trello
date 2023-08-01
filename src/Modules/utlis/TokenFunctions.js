/// generation/////////////
import Jwt  from "jsonwebtoken"
export const GenerateToken = ({
    payload={},
    signbature = process.env.DEFAULT_SIGNATUE,
    expiresIn='1d',

}={})=>{
    if(!object.keys(payload.length))
    {
        return false
    }
    const token = Jwt.sign(payload,signbature,{expiresIn})
    return token
}




//verify
export const VerifyToken = ({
    token='',
    signbature = process.env.DEFAULT_SIGNATUE,
    

}={})=>{
    if(!token)
    {
        return false
    }
    const data = Jwt.verify(token,signbature)
    return data
}
