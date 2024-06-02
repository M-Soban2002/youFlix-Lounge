import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js"; // Assuming you have a Video model
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { _id: likedBy } = req.user;

        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }

        const existingLike = await Like.findOneAndDelete({ video: videoId, likedBy });
        if (existingLike) {
            return res.status(200).json(new ApiResponse(200, null, "Like deleted successfully"));
        }

        const likeVideo = new Like({ video: videoId, likedBy });
        const newLike = await likeVideo.save();
        return res.status(200).json(new ApiResponse(200, newLike, "Video liked successfully"));
    } catch (error) {
        throw new ApiError(400, `Like can't be toggled: ${error.message}`);
    }
});

// Toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const { _id: likedBy } = req.user;

        if (!isValidObjectId(commentId)) {
            throw new ApiError(400, "Invalid comment ID");
        }

        const existingLike = await Like.findOneAndDelete({ comment: commentId, likedBy });
        if (existingLike) {
            return res.status(200).json(new ApiResponse(200, null, "Like deleted successfully"));
        }

        const likeComment = new Like({ comment: commentId, likedBy });
        const newLike = await likeComment.save();
        return res.status(200).json(new ApiResponse(200, newLike, "Comment liked successfully"));
    } catch (error) {
        throw new ApiError(400, `Like can't be toggled: ${error.message}`);
    }
});

// Toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;
        const { _id: likedBy } = req.user;

        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid tweet ID");
        }

        const existingLike = await Like.findOneAndDelete({ tweet: tweetId, likedBy });
        if (existingLike) {
            return res.status(200).json(new ApiResponse(200, null, "Like deleted successfully"));
        }

        const likeTweet = new Like({ tweet: tweetId, likedBy });
        const newLike = await likeTweet.save();
        return res.status(200).json(new ApiResponse(200, newLike, "Tweet liked successfully"));
    } catch (error) {
        throw new ApiError(400, `Like can't be toggled: ${error.message}`);
    }
});

// Get all liked videos for the authenticated user
const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const { _id: userId } = req.user;

        const userLikes = await Like.find({ likedBy: userId, video: { $exists: true } });
        const videoIds = userLikes.map(like => like.video);

        if (!videoIds.length) {
            throw new ApiError(404, "No liked videos found");
        }

        const likedVideos = await Video.find({ _id: { $in: videoIds } });
        return res.status(200).json(new ApiResponse(200, likedVideos, "All liked videos fetched successfully"));
    } catch (error) {
        throw new ApiError(400, `There is some issue in getting the liked videos: ${error.message}`);
    }
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
