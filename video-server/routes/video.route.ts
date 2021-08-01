import express from 'express';
export const router = express.Router();
import * as config from '../configuration.json';

import { fetchVideos, downloadVideos, sendVideosDataToClient, setResponseHttpForNewVideos } from '../services/video.service';

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now())
    next();
})


const getNewVideos = async (req, res) => {
    console.log("Received a request from client to fetch new videos");

    let videos;
    let pageNum = 1;
    let moreToFetch = 0;

    // @@@@@@@@@@@@@ Do not abuse the API. By default, the API is rate-limited to 200 requests per hour and 20,000 requests per month @@@@@@@@@@@@@
    moreToFetch = config.VIDEO_AMOUNT_TO_CLIENT;
    do {
        let fetchAmount;
        if (moreToFetch > config.MOVIES_PER_PAGE) {
            fetchAmount = config.MOVIES_PER_PAGE;
        }
        else {
            fetchAmount = moreToFetch;
            pageNum = ((pageNum - 1) * (config.MOVIES_PER_PAGE / fetchAmount)) + 1
        }
        try {
            videos = await fetchVideos(pageNum, fetchAmount);
            moreToFetch -= fetchAmount;
        }
        catch (err) {
            console.log(err);
        }
        moreToFetch += downloadVideos(videos);
        ++pageNum;
    }
    while (moreToFetch > 0)

    setResponseHttpForNewVideos(res);

}

const getVideos = async (req, res) => {
    sendVideosDataToClient();
    res.status(200).send({ status: "OK" });
}

router.get('/getVideos', getVideos);
router.get('/getNewVideos', getNewVideos);

