import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    
    try {
        const { content } = req.body
        const { owner } = req.user._id

        const tweet = new Tweet({ content, owner})
        const newTweet = await tweet.save()
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                newTweet, 
                "Tweet created successfully"
                )
        )
    } catch (error) {
        throw new ApiError(400, "Tweets not found")
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
   
    const userTweets = await Tweet.findById(req.user._id)

    if(!userTweets){
        throw new ApiError(400, "You dont have any tweet so far")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            userTweets,
            "All tweets found successfully!!!"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
   
    const tweet = await Tweet.findByIdAndUpdate(req.params.id //" req.user._id " can be used as well
        , {
        $set: {
            tweet: req.body.content
        }
    }, { new: true })

    if(!tweet){
        throw new ApiError(400, "there is some problem in updating the tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet Updated Successsfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    

   const deletedTweet = await Tweet.findByIdAndDelete(req.params.id)

   if(!deletedTweet){
    throw new ApiError(400, "tweet can't be deleted due to some reason")
   }

   return res
   .status(200)
   .json(
       new ApiResponse(
           200,
           tweet,
           "Tweet Deleted Successsfully"
       )
   )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}