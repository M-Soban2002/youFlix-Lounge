import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


//a healthcheck response that simply returns the OK status as json with a message
const healthcheck = asyncHandler(async (req, res) => {
    try {
        // Simulating a potential point of failure
        if (!req) {
            throw new ApiError(500, "Health check failed");
        }
        res.status(200).json(new ApiResponse(200, null, "OK"));
    } catch (error) {
        // Handle any unexpected errors
        if (error instanceof ApiError) {
            res.status(error.statusCode).json(error);
        } else {
            res.status(500).json(new ApiError(500, "An unexpected error occurred"));
        }
    }
});

export {
    healthcheck
    }
    