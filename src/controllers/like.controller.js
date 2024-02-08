import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Comment } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "Enter valid video id.");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video with given Id not found.");

    const like = await Like.findOne({video: videoId});
    if(!like){
        const updatedLike = await Like.create({video: videoId, likedBy: req.user?._id});
        return res.status(200).json(new ApiResponse(200, updatedLike, "Like status toggled ."));
    }
    const likedStatus = like.likedStatus;
    like.likedStatus = !likedStatus;
    const result =  await like.save();
    //const result2 = await Like.findById(like._id);

    return res.status(200).json(new ApiResponse(200, result, "Like status toggled ."));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId || !isValidObjectId(commentId)) throw new ApiError(400, "Enter valid comment id.");

    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404, "Comment with given Id not found.");

    const like = await Like.findOne({comment: commentId});
    if(!like){
        const updatedLike = await Like.create({comment: commentId, likedBy: req.user?._id});
        return res.status(200).json(new ApiResponse(200, updatedLike, "Like status toggled ."));
    }
    const likedStatus = like.likedStatus;
    like.likedStatus = !likedStatus;
    const result =  await like.save();

    return res.status(200).json(new ApiResponse(200, result, "Like status toggled ."));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId || !isValidObjectId(tweetId)) throw new ApiError(400, "Enter valid tweet id.");

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404, "Tweet with given Id not found.");

    const like = await Like.findOne({tweet: tweetId});
    if(!like){
        const updatedLike = await Like.create({tweet: tweetId, likedBy: req.user?._id});
        return res.status(200).json(new ApiResponse(200, updatedLike, "Like status toggled ."));
    }
    const likedStatus = like.likedStatus;
    like.likedStatus = !likedStatus;
    const result =  await like.save();

    return res.status(200).json(new ApiResponse(200, result, "Like status toggled ."));
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                "likedVideo": {
                    $first: "$likedVideo"
                }
            }
        },
        {
            $project: {
                likedVideo: 1
            }
        }
    ])
    console.log(likedVideos);
    const allLikedVideos = likedVideos.map((video) => {console.log(video); return video?.likedVideo});
    return res.status(200).json(new ApiResponse(200, {allLikedVideos}, "All liked videos of User."));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}