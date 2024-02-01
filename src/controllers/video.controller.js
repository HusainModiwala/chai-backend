import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query="", sortBy='createdAt', sortType=1, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // check if userId is passed else throw error
    if(!userId) throw new ApiError(400, "No user id found. Please provide a valid user id to search for related videos.");

    // prepare video query
    const videoQuery = {
        owner: userId,
        $or: [
            {
                title: {$regex: query, $options: 'i'}
            },
            {
                description: {$regex: query, $options: 'i'}
            },
        ]
    }

    // prepare sort criteria
    const sortCriteria = {};
    sortCriteria[sortBy] = sortType;

    // find videos based on query, sort criteria, pagination
    const videos = await Video.find(videoQuery).sort(sortCriteria).skip((page-1) * limit).limit(limit);

    // return success response
    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched for given user successfully."));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // check if videoId is passed else throw error
    if(!videoId) throw new ApiError(400, "No videoId passed. Please pass a valid videoId.");
    const video = await Video.findById(videoId); // find video by id

    // if no video found throw error else return video
    if(!video) throw new ApiError(404, "No video with given videoId found.");
    return res.json(200).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    //TODO: toggle publish status of video

    const { videoId } = req.params
    // check if videoId is passed else throw error
    if(!videoId) throw new ApiError(400, "No videoId passed. Please pass a valid videoId.");

    // find video by id and update isPublished field
    const video = await Video.findByIdAndUpdate(
        videoId,
        {$set: {isPublished: !isPublished }},
        {new: true}
    );

    // if no video found throw error
    if(!video) throw new ApiError(404, "No video with given videoId found.");

    // return success response
    return res.json(200).json(new ApiResponse(200, video, "Video status toggled successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
