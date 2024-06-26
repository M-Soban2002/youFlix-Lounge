import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id; // Assuming the user is authenticated and available in req.user

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });

    if (existingSubscription) {
        // Unsubscribe (delete the subscription)
        await Subscription.findByIdAndDelete(existingSubscription._id);
        res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        // Subscribe (create a new subscription)
        const subscription = new Subscription({ subscriber: subscriberId, channel: channelId });
        await subscription.save();
        res.status(201).json(new ApiResponse(201, subscription, "Subscribed successfully"));
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate('subscriber', 'username fullName avatar');

    res.status(200).json(new ApiResponse(200, subscribers));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate('channel', 'username fullName avatar');

    res.status(200).json(new ApiResponse(200, subscriptions));
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}