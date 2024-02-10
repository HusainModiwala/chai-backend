import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views1, total subscribers1, total videos1, total likes1 etc.
    const channelId = req.user?._id;

    const videosData = await Video.aggregate([
        {
            $match: {
                owner: channelId
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likesData",
                pipeline: [
                    {
                        $match: {
                            likedStatus: true // Include documents where isLiked is true
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likesData"
                },

            }
        },
        {
            $project: {
                title: 1,
                views: 1,
                likesCount: 1,
            }
        }
    ])
    const totalVideosOfChannel = videosData.length;
    const totalViewsOnChannel = videosData.reduce((acc, curr) => {
        acc += curr.views;
        return acc;
    }, 0);
    const totalLikesOnChannel = videosData.reduce((acc, curr) => {
        acc += curr.likesCount;
        return acc;
    }, 0);
    const totalSubscriberCount = await Subscription.countDocuments({channel: channelId});

    return res.json(new ApiResponse(200, {
        videosData,
        totalViewsOnChannel,
        totalSubscriberCount,
        totalVideosOfChannel,
        totalLikesOnChannel
    }, "All data fetched successfully."));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user?._id;

    const allVideosData = await Video.aggregate([
        {
            $match: {
                owner: channelId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "creator",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                "creator": {
                    $first: "$creator"
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                creator: 1,
                duration: 1,
                isPublished: 1,
                views: 1,
            }
        }
    ])

    return res.json(new ApiResponse(
        200, {Videos: allVideosData}, "Data for all the videos uploaded by the channel fetched successfully."
        ));
})

export {
    getChannelStats,
    getChannelVideos
    }