import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { upload } from "../middlewares/multer.middleware.js"


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
    if(!title || !description) throw new ApiError(400, "Please provide title and description to publish a video.");

    const files = req.files;
    const videoFilePath = files?.videoFile[0].path;
    if(!videoFilePath) throw new ApiError(400, "No video file found. Please upload a video file to publish a video.");

    const thumbnailPath = files?.thumbnail[0].path;
    if(!thumbnailPath) throw new ApiError(400, "No thumbnail found. Please upload a thumbnail for the video.");

    const videoResponse = await uploadOnCloudinary(videoFilePath);
    const thumbnailResponse = await uploadOnCloudinary(thumbnailPath);
    if(!videoResponse || !thumbnailResponse) throw new ApiError(500, "Error uploading fileson cloudinary.");

    const video = await Video.create({
        videoFile: videoResponse.url,
        videoFilePublicId: videoResponse.public_id,
        thumbnail: thumbnailResponse.url,
        thumbnailPublicId: thumbnailResponse.public_id,
        title: title,
        description: description,
        duration: videoResponse.duration,
        views: 0,
        isPublished: true,
        owner: req.user._id
    })
    const finalVideoResponse = await Video.findById(video._id).select("-owner");
    if(!video) throw new ApiError(500, "Failed to publish video.");

    res.json(new ApiResponse(200, finalVideoResponse, "Video published successfully."));
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
    if(!videoId) throw new ApiError(400, "No videoid found.");

    const {title, description} = req.body;
    const thumbnailFilePath = req.file?.path;

    if(!title && !description && !thumbnailFilePath) throw new ApiError(400, "Enter data to be updated like title, description, thumbnail.");
    const video = await Video.findById(videoId);

    if(title) {
        video.title = title;
    }
    if(description) {
        video.description = description;
    }
    if(thumbnailFilePath) {
        const response = await uploadOnCloudinary(thumbnailFilePath);
        if(!response) throw new ApiError(500, "Failed to upload file.");
        video.thumbnail = response.url;

        const isDeleted = await deleteFromCloudinary(video.thumbnailPublicId, 'image');
        //if(!isDeleted?.result !== "ok") throw new ApiError(500,"Failed to delete old thumbnail file.");
        video.thumbnailPublicId = response.public_id;
    }

    await video.save({validateBeforeSave: false});
    const updatedVideo = Video.findById(videoId).select("-owner");

    if(!updatedVideo) throw new ApiError(500, "Failed to update video.");
    res.json(new ApiResponse(200, updatedVideo, "Video updated successfully."));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId) throw new ApiError(400, "Pass a valid videoId.");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(401, `Video to be deleted with videoId ${videoId} not found.`);

    const isVideoDeleted = await deleteFromCloudinary(video?.videoFilePublicId, 'video');
    const isThumbnailDeleted = await deleteFromCloudinary(video?.thumbnailPublicId, 'image');

    if(isVideoDeleted?.result !== "ok" || isThumbnailDeleted?.result !== "ok") throw new ApiError(500, `Video or Thumbnail could not be deleted.`);

    const result = await Video.findByIdAndDelete(videoId);
    return res.status(200).json(new ApiResponse(200, result, "Video deleted successfully."));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    //TODO: toggle publish status of video

    const { videoId } = req.params
    // check if videoId is passed else throw error
    if(!videoId) throw new ApiError(400, "No videoId passed. Please pass a valid videoId.");

    // find video by id and update isPublished field
    const video = await Video.findById(videoId);
    // if no video found throw error
    if(!video) throw new ApiError(404, "No video with given videoId found.");
    const isPublished = video.isPublished;
    video.isPublished = !isPublished;
    await video.save({validateBeforeSave: false});

    const response = await Video.findById(videoId);
    console.log(response);
    // return success response
    return res.status(200).json(new ApiResponse(200, response, "Video status toggled successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
