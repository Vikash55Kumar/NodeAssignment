import express from "express";
import cors from "cors"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"15kb"}))
app.use(express.urlencoded({extended:true, limit:'15kb'}))
app.use(express.static("public"))
app.use(cookieParser())

// routes imported
import userRouter from "./routers/user.router.js"
import cookieParser from "cookie-parser";


//route decleration
app.use("/api/v1/users", userRouter)


export {app}