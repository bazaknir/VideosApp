// ****************************************************************************************************
// This function is an implementation for fetching videos from "pexels.com" API.
// if you wish to change the implementation or the API, simply add a new service with pthr API source.
// ****************************************************************************************************

import { createClient } from 'pexels';
import * as config from '../configuration.json';

const client = createClient(config.API_KEY);

export const fetchVideosFromPexelsAPI = (page, fetchNum) => {
    return client.videos.popular({ per_page: fetchNum, page: page });
}