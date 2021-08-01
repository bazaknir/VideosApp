import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpStatus } from './interfaces/http.interface';

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {

  GET_VIDEOS_URL = "http://localhost:3000/api/videos/getVideos";
  GET_NEW_VIDEOS_URL = "http://localhost:3000/api/videos/getNewVideos";

  constructor(private http: HttpClient) { }

  getVideos(): Observable<any> {
    return this.http.get<HttpStatus>(this.GET_VIDEOS_URL);
  }

  getNewVideos(): Observable<any> {
    return this.http.get<HttpStatus>(this.GET_NEW_VIDEOS_URL);
  }
}
