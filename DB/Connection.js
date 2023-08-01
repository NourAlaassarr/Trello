import mongoose, { Mongoose } from "mongoose"

export const DBConnection= async()=>{
    return await mongoose.connect(process.env.DB_CONNECTION_URL)
    .then((res) => console.log('Connection has been established successfully.'))
    .catch((error)=>console.error('Unable to connect to the database:', error))
}
