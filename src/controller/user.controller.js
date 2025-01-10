import { ApiError } from "../utility/ApiError.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import {User} from "../model/user.model.js"
import { ApiResponse } from "../utility/ApiResponse.js";

const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        
        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "server error while generating refresh and access token")
    }
}

const register = asyncHandler(async(req, res) => {
    const {username, email, password, conformPassword} = req.body
        console.log(username, email, password, conformPassword);
        
    if (
        [username, email, password, conformPassword].some((field) =>
        field?.trim() === "") 
    ) {
        throw new ApiError(400, "All fileds are required")
    }

    if(!(password===conformPassword)) {
        throw new ApiError(400, "password and conform password not same")
    }

    const existingUser = await User.findOne({
        $or:[{username}, {email}]
    })

    if(existingUser) {
        throw new ApiError(400, "Username or email already exist")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Server error while register user")
    }

    return res.status(200).json(
        new ApiResponse(200, "User register successfully")
    )

})

const login = async(req, res) => {
    const {username, password} = req.body

    console.log(username, password);

    if(!username) {
        throw new ApiError(400, "username are required");
    }

    const user = await User.findOne({username})

    if(!user) {
        throw new ApiError(400, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid) {
        throw new ApiError(400, "password are invalid");
    }

    const {refreshToken, accessToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    if(!loggedInUser) {
        throw new ApiError(400, "server error while login user");
    }

    // Only modified by server
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Login Successfully"
        )
    )
}

const forgotPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword, conformPassword} = req.body

    console.log(oldPassword, newPassword, conformPassword);
    
    if(!oldPassword | !newPassword | conformPassword) {
        throw new ApiError(400, "all fields are required");
    }

    if(!(newPassword === conformPassword)) {
        throw new ApiError(400, "new password  and conform password not match");
    }

    const user =await User.findById(req.user._id)
    console.log(user);
    
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid) {
        throw new ApiError(400, "password are invalid");
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json( new ApiResponse(200, "Password forgot Successfully"))
})

const getUser = asyncHandler(async(req, res) => {
    const user =await User.findById(req.user._id)

    return res
    .status(200)
    .json( 
        new ApiResponse(200, user, "User data fetch Successfully")
    )
})

const logout = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, "User Logout Successfully"
        )
    )
})

export {register, login, forgotPassword, getUser, logout}