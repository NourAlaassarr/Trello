import express from 'express'
import { DBConnection } from './DB/Connection.js'
import * as allroutes from './src/index.routes.js'
import { config } from 'dotenv'
import {  job } from './src/Modules/utlis/crons.js'
import { gracefulShutdown } from 'node-schedule'
config()
const app = express()
const port = process.env.port

app.use(express.json())
DBConnection()

app.use('/Uploads',express.static('./Uploads'))
app.use('/user', allroutes.UserRoutes)
app.use('/task',allroutes.TaskRoutes)
app.use('*',(req,res,next)=>{  // or use.all
    res.json({Message:'404 route is Not found'})
})
app.use((err,req,res,next)=>
{ if (err) {
    // cause
    return res.status(err['cause'] || 500).json({ message: err.message })
}
}
)
job()
gracefulShutdown()
app.listen(port, () => {
    console.log(`Server running on port Number ${port}!`)
})
