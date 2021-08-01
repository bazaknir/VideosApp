import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as socketIoClient from 'socket.io-client';
import { HttpServiceService } from './http-service.service';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  videosChangedSubject: Subject<any> = new Subject<any>();   // TBD - change any to type
  
  constructor(private httpService: HttpServiceService) {
    this.initSocketIo();
  }

  initSocketIo() {
    // const io = require('socket.io-client');
    const socket = socketIoClient.io('ws://localhost:3000');

    socket.on('connect', () => {
      socket.send('Hello From Client');

      this.httpService.getVideos().subscribe(data => {
        // this.videosData = data;
        console.log(data);
      })
    });

    // handle the event sent with socket.send()
    socket.on('message', data => {
      // console.log(data);
    });

    // *********************************************************************************************************************************
    // ******************************************** handle the events sent with socket.emit() *******************************************
    // *********************************************************************************************************************************

    socket.on("VIDEOS_CHANGED", msg => {
      let obj = JSON.parse(msg);
      console.log("VIDEOS_CHANGED was called in client");
      console.log(obj);
      this.videosChangedSubject.next(obj);
    });
  }
}
