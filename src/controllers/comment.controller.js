import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"; // Assuming you have a Video model

// Get all comments for a video with pagination
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const comments = await Comment.aggregate([
        { $match: { video: mongoose.Types.ObjectId(videoId) } },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit, 10) },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $project: {
                content: 1,
                video: 1,
                owner: { username: 1, _id: 1 },
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    const totalComments = await Comment.countDocuments({ video: videoId });
    const totalPages = Math.ceil(totalComments / limit);

    res.status(200).json(new ApiResponse(200, {
        comments,
        totalComments,
        totalPages,
        currentPage: page
    }, "Comments fetched successfully"));
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { content, videoId } = req.body;
    const { _id: ownerId } = req.user;

    if (!content || !videoId) {
        throw new ApiError(400, "Content and videoId are required");
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = new Comment({ content, video: videoId, owner: ownerId });
    await comment.save();

    res.status(201).json(new ApiResponse(201, comment, "Comment created successfully"));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const { _id: ownerId } = req.user;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: ownerId },
        { content },
        { new: true }
    );

    if (!comment) {
        throw new ApiError(404, "Comment not found or user not authorized");
    }

    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { _id: ownerId } = req.user;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findOneAndDelete({ _id: commentId, owner: ownerId });

    if (!comment) {
        throw new ApiError(404, "Comment not found or user not authorized");
    }

    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
