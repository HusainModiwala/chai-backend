import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId) throw new ApiError(400, "No channel found.");
    const subscription = await Subscription.findOne({subscriber: req.user._id, channel: channelId});
    console.log(subscription);
    if(!subscription) {
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId,
        });
    } else{
        const isSubscribed = subscription.isSubscribed;
        subscription.isSubscribed = !isSubscribed;
        const r = await subscription.save({validateBeforeSave: false});
    }
    const updatedSubscription = await Subscription.findOne({subscriber: req.user._id, channel: channelId});
    console.log(updatedSubscription);
    if(!updatedSubscription) throw new ApiError(500, "Failed to update.")
    return res.status(200).json(new ApiResponse(200, updatedSubscription, "subscription toggled successfully."));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId: channelId} = req.params;
    if(!channelId) throw new ApiError(400, "No channel found.");

    let subscriberList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberList",
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
                "subscriberList": {
                    $first: "$subscriberList"
                }
            }
        },
        {
            $project: {
                subscriberList: 1,
            }
        }
    ])
    subscriberList = subscriberList.map((subscriber) => subscriber.subscriberList);
    return res.status(200).json(new ApiResponse(200, {subscriberList}, "Subscriber list fetched successfully."));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}