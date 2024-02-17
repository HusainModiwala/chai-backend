import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "Please enter a valid videoId.");
    const allCommentsOnVideo = await Comment.find({video: videoId}).skip((page-1)*limit).limit(limit);

    res.json(new ApiResponse(200, allCommentsOnVideo, "All comments fetched successfully."));
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    if(!content) throw new ApiError(400, "Enter non-emty content to comment.");
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    return res.status(200).json(new ApiResponse(200, comment, "Comment created successfully."));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if(!isValidObjectId(commentId)) throw new ApiError(400, "Enter valid commentId.");
    if(!content) throw new ApiError(400, "Enter non-emty content to update comment.");

    const comment = await Comment.findOneAndUpdate(
        {_id: commentId, owner: req.user?._id},
        {$set: {content}},
        {new: true}
    );

    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully."));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)) throw new ApiError(400, "Enter valid commentId.");

    const comment = await Comment.findOneAndDelete(
        {_id: commentId, owner: req.user?._id},
        {new: true}
    );

    return res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully."));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
