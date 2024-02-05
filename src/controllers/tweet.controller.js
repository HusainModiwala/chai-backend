import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = req.user?._id;
    const { content } = req.body;
    if(!content) throw new ApiError(400, "Content is required");

    console.log("id", userId);
    const tweet = await Tweet.create({
        content,
        owner: userId,
    })

    return res.json(new ApiResponse(200, tweet, "Tweet created successfully."));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if(!userId) throw new ApiError(400, "No user id found.");
    if(!isValidObjectId(userId)) throw new ApiError(401, "Bad request");

    const user = await User.findById(userId);
    if(!user) throw new ApiError(404, "User not found.");
    console.log(new mongoose.Types.ObjectId(userId));
    const tweets = await Tweet.find({owner: new mongoose.Types.ObjectId(userId)});
    return res.json(new ApiResponse(200, tweets, "Tweets fetched successfully."));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;
    if(!isValidObjectId(tweetId)) throw new ApiError(401, "Bad request");

    if(!tweetId) throw new ApiError(400, "No tweet id found.");
    if(!content) throw new ApiError(400, "Content is required");

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {$set: {content}}, {new: true});
    console.log(updatedTweet);
    return res.json(new ApiResponse(200, updatedTweet, "Tweet updated successfully."));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if(!tweetId) throw new ApiError(400, "No tweet id found.");
    if(!isValidObjectId(tweetId)) throw new ApiError(401, "Bad request");

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId, {new: true});
    console.log(deletedTweet);
    return res.json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully."));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
