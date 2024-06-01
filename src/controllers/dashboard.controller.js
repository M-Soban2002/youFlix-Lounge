import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        const channel = req.user._id;

        // Total likes
        const likes = await Like.countDocuments({ userId: channel });
        
        // Total videos
        const totalVideos = await Video.countDocuments({ userId: channel });

        // Total subscribers
        const totalSubscribers = await Subscription.countDocuments({ channel: channel });

        // Total subscriptions (channels this user is subscribed to)
        const totalSubscriptions = await Subscription.countDocuments({ subscriber: channel });

        // Total views
        const videos = await Video.find({ userId: channel });
        const totalViews = videos.reduce((acc, video) => acc + video.views, 0);

        const stats = {
            totalLikes: likes,
            totalVideos,
            totalSubscribers,
            totalSubscriptions,
            totalViews,
        };

        return res.status(200).json(new ApiResponse(200, stats, "Channel stats obtained successfully"));
    } catch (error) {
        throw new ApiError(400, `Something went wrong: ${error.message}`);
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const channel = req.user._id;

        const videos = await Video.find({ userId: channel });

        return res.status(200).json(
            new ApiResponse(200, { videos }, "All videos obtained successfully")
        );
    } catch (error) {
        throw new ApiError(400, `Something went wrong: ${error.message}`);
    }
});

export {
    getChannelStats,
    getChannelVideos,
};
