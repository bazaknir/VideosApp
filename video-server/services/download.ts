const fetch = require('node-fetch');
const fs = require('fs');
import { Subject } from 'rxjs';
import * as config from '../configuration.json';

let count = 0;
export let doneDownloading = new Subject();
export const downloadMovie = async (url, fileName, fileType) => {

    const response = await fetch(url);
    const buffer = await response.buffer();

    fs.writeFile(`${config.DOWNLOAD_PATH}/${fileName}.${fileType}`, buffer, () => {
        console.log(`${++count} Download Completed`);

        if (config.VIDEO_AMOUNT_TO_CLIENT === count) {
            doneDownloading.next("Done");
            count = 0;
        }
    });
}