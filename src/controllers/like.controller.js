import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
try {
        const {videoId} = req.params
        const {_id: likedBy} = req.user
    
        //TODO: toggle like on video
        const existingLike = await Like.findByIdAnfDelete({video: videoId, likedBy})
        if(existingLike){
            throw new ApiResponse(200, null, "like deeted successfully")
        }
        const likeVideo = new Like({video: videoId, likedBy});
        const newLike = await likeVideo.save();
        return res
        .status(200)
        .json(
            new ApiResponse(   
                    200,
                    newLike,
                    "video liked successfully!!!"         
            )
        )
} catch (error) {
    throw new ApiError(400, ` Like can't be toggeled ${error}`)
}


})

const toggleCommentLike = asyncHandler(async (req, res) => {
try {
        const {commentId} = req.params
        const {id: likedBy} = req.user
        //TODO: toggle like on comment
        const existingLikeComment = await Like.findByIdAnfDelete(commentId)
    
        if(existingLikeComment){
            new ApiResponse(200, null, "like deleted successfully")
        }
    
        const newLike = new Like({comment: commentId, likedBy})
        const newLikeComment = await newLike.save();
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newLikeComment,
                "comment liked successfully"
            )
        )
} catch (error) {
    throw new ApiError(400,` Like can't be toggeled ${error}`)
    
}
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
try {
        //TODO: get all liked videos
        const {_id:userId} = req.user;
    
        const userLikes = await Like.find({likedBy: userId});
    
        const videoIds = userLikes.map(like => like.video)
    
        if(!videoIds){
            throw new ApiError(400, "no liked Video found :(")
        }
    
        const likedVideos = await Video.find({_id: {$in: videoIds}})
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                likedVideos, 
                "all liked videos fetched successfully")
        )
} catch (error) {
    throw new ApiError(400, "there is some issue in getting the lilked videos")
}
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}