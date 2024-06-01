import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const filter = {};
    if (query) {
        filter.title = { $regex: query, $options: 'i' }; // Case-insensitive search
    }
    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 }
    };

    const videos = await Video.paginate(filter, options);
    res.status(200).json(new ApiResponse(200, videos));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { file } = req; // Assuming file is attached in req.file

    if (!file) {
        throw new ApiError(400, "No video file provided");
    }

    const uploadResponse = await uploadOnCloudinary(file.path);

    if (!uploadResponse) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
    }

    const video = new Video({
        title,
        description,
        videoFile: uploadResponse.secure_url,
        thumbnail: req.body.thumbnail || uploadResponse.secure_url, // Use video URL as thumbnail if not provided
        duration: req.body.duration,
        owner: req.user._id // Assuming the user is authenticated and available in req.user
    });

    await video.save();
    res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate('owner', 'username fullName avatar');
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;

    await video.save();
    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();
    
    res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"));
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}