// ************************************************************************
// This function calls the implementation of fetching videos from "pexels.com" API.
// if you wish to change the implementation or the API, simply add a new service with other API source here.
// ************************************************************************

import { fetchVideosFromPexelsAPI } from './pexels.service';
const fs = require('fs');
import * as config from '../configuration.json';
import { doneDownloading, downloadMovie } from '../services/download';
import { sendToSocket, sendToSockets, VIDEOS_CHANGED } from '../services/socket-io.service'

let currentDownloadedVideos = {};
let newDownloadedVideos = {};
let responseHttpForNewVideos;

/**
* This function checks if the movies exists already, if not it insert them to cache and download them to file system.
* if x movies already exists then the function returns x (the amount to fetch more)
*/
export const downloadVideos = (videos) => {
    let moreToFetch = 0;

    videos.videos.forEach(video => {
        if (currentDownloadedVideos[video.id] === undefined) {     // video not exist - insert it
            let fileType: string = video.video_files[0].file_type;
            fileType = fileType.slice(fileType.indexOf("/") + 1);

            newDownloadedVideos[video.id] = { key: video.id, value: fileType };    // insert to cache
            // download the movie
            downloadMovie(video.video_files[0].link, video.id, fileType);
            console.log(`downloading ${video.id} ...`);
        }
        else {  // the movie already exists in cache - need to fetch more
            moreToFetch++;
        }
    });

    return moreToFetch;
}


/**
* This function returns the newVideosData to be sent to the client
* It reads the videos from the new downloaded files
*/
export const getNewVideosData = () => {
    let newVideosData = [];

    for (let key in newDownloadedVideos) {
        // push the video to the clients list
        newVideosData.push({
            src: `http://localhost:3000/downloads/${key}.${newDownloadedVideos[key].value}`,
            id: key
        })

        // check if we have enough videos for the client
        if (newVideosData.length == config.VIDEO_AMOUNT_TO_CLIENT) {
            break;
        }
    }

    return newVideosData;
}

/**
* This function reads all the video files and set the currentDownloadedVideos variable with all downloaded video id's
*/
const readAllVideoFiles = () => {
    fs.readdir(config.DOWNLOAD_PATH,
        { withFileTypes: true },
        (err, files) => {
            console.log("\nCurrent directory files:");
            if (err)
                console.log(err);
            else {
                files.forEach(file => {
                    const id = file.name.substr(0, file.name.indexOf('.'));
                    const fileType = file.name.substr(file.name.indexOf('.') + 1);
                    console.log(file);
                    currentDownloadedVideos[id] = { key: id, value: fileType };
                })
            }
        })
}


/**
* This function returns the videosData to be sent to the client
* It reads the videos from download folder
*/
export const getVideosData = () => {
    let newVideosData = [];

    for (let key in currentDownloadedVideos) {
        // push the video to the clients list
        newVideosData.push({
            src: `http://localhost:3000/downloads/${key}.${currentDownloadedVideos[key].value}`,
            id: key
        })

        // check if we have enough videos for the client
        if (newVideosData.length == config.VIDEO_AMOUNT_TO_CLIENT) {
            break;
        }
    }

    return newVideosData;
}

/**
* This function delets all videos from the download folder
*/
const deletePreviosVideos = () => {
    for (let key in currentDownloadedVideos) {
        //Delete the file from file system
        try {
            fs.unlinkSync(`${config.DOWNLOAD_PATH}\\${key}.${currentDownloadedVideos[key].value}`);
            //file removed
        } catch (err) {
            console.error(err)
        }
    }

    currentDownloadedVideos = newDownloadedVideos;
    newDownloadedVideos = {};
}

/**
* This function send to client the current videos data
*/
export const sendVideosDataToClient = () => {
    sendToSocket(VIDEOS_CHANGED, getVideosData());
}

/**
* This function send to client the new videos data
*/
export const sendNewVideosDataToClient = () => {
    sendToSockets(VIDEOS_CHANGED, getNewVideosData());
    deletePreviosVideos();
}

/**
* This function fetch for new videos
*/
export const fetchVideos = (page, moreToFetch) => {
    return fetchVideosFromPexelsAPI(page, moreToFetch);
}

readAllVideoFiles();

/**
* This function set the response Http for new videos
*/
export let setResponseHttpForNewVideos = (res) => {
    responseHttpForNewVideos = res;
}

doneDownloading.subscribe(data => {
    console.log("subject observable got value, start sending to client and deleting...")
    sendNewVideosDataToClient();
    responseHttpForNewVideos.status(200).send({ status: "OK" });
})