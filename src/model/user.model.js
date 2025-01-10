import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema(
    {
        username: {
            type:String,
            unique:true,
            required: true,
            lowercase: true,
            trim: true,
            index:true
        },
        email: {
            type:String,
            required:true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        }
        
    }, {timestamps: true}
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username:this.username
        },
        process.env.ACCESS_SECRET_TOKEN,
        {
            expiresIn: "1d"
        }
    )
}  

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_SECRET_TOKEN,
        {
            expiresIn: "4d"
        }
    );
}

export const User = mongoose.model('User', userSchema);