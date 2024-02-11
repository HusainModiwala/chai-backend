import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name || !description) throw new ApiError(400, "Enter valid name and description to create new playlist.");

    const playlist = await Playlist.create({name, description, owner: req.user?._id});
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully."));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId || !isValidObjectId(userId)) throw new ApiError(400, "Enter valid userId data.");

    const playlists = await Playlist.find({owner: userId});
    return res.status(200).json(new ApiResponse(200, playlists, "Playlists of given user fetched successfully."));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId || !isValidObjectId(playlistId)) throw new ApiError(400, "Enter valid playlistId data.");

    const playlist = await Playlist.findById(playlistId);
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully."));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !isValidObjectId(playlistId) || !videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Enter valid playlistId and videoId data.");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if(!playlist) throw new ApiError(404, "No playlist with given playlistId found.");
    if(!video) throw new ApiError(404, "No video with given videoId found.");

    const mongooseVideoId = new mongoose.Types.ObjectId(videoId);
    const checkIfAlreadyPresent = ( playlist.videos.indexOf(mongooseVideoId) !== -1 );
    if(checkIfAlreadyPresent) throw new ApiError(409, "Video already present in playlist.")

    playlist.videos.push(mongooseVideoId);
    const updatedPlaylist = await playlist.save();
    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to given playlist successfully."));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !isValidObjectId(playlistId) || !videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Enter valid playlistId and videoId data.");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if(!playlist) throw new ApiError(404, "No playlist with given playlistId found.");
    if(!video) throw new ApiError(404, "No video with given videoId found.");

    const indexOfVideo = playlist.videos.indexOf(new mongoose.Types.ObjectId(videoId));
    if(indexOfVideo === -1) throw new ApiError(404, "Video dosen't exist in playlist.")

    playlist.videos.splice(indexOfVideo, 1);
    const updatedPlaylist = await playlist.save();
    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from given playlist successfully."));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
