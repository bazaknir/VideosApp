import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { HttpServiceService } from './http-service.service';
import { WsService } from './ws.service';
import { IStatus } from './interfaces/http.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChildren('cmp') components: QueryList<VideoPlayerComponent>;
  @HostListener("window:scroll", ['$event'])
  private onWindowScroll(event: any) {
    if (!this.isScrolling) {
      // if we just start scrolling then pause all videos
      this.changeAllPlayersState("stop");
    }
    this.isScrolling = true;
    this.checkToLoadMoreVideos();
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.isScrolling = false;
      this.changeAllPlayersState("play");
    }, 300);
  };

  errorMessage: string = undefined;
  timeout;
  loading = false;
  isScrolling = false;
  videosData = [];
  renderedVideos = [];
  renderedAmount = 20;

  // Mock data
  mockVidosData = [
    { src: "http://localhost:3000/downloads/852038.mp4", id: 852038 },
    { src: "http://localhost:3000/downloads/853989.mp4", id: 853989 },
    { src: "http://localhost:3000/downloads/854999.mp4", id: 854999 },
    { src: "http://localhost:3000/downloads/855936.mp4", id: 855936 },
    { src: "http://localhost:3000/downloads/856926.mp4", id: 856926 },
    { src: "http://localhost:3000/downloads/857010.mp4", id: 857010 },
    { src: "http://localhost:3000/downloads/857019.mp4", id: 857019 },
    { src: "http://localhost:3000/downloads/857193.mp4", id: 857193 },
    { src: "http://localhost:3000/downloads/1824697.mp4", id: 1824697 },
    { src: "http://localhost:3000/downloads/1828452.mp4", id: 1828452 },
    { src: "http://localhost:3000/downloads/1851768.mp4", id: 1851768 },
    { src: "http://localhost:3000/downloads/1858244.mp4", id: 1858244 },
    { src: "http://localhost:3000/downloads/1899146.mp4", id: 1899146 },
    { src: "http://localhost:3000/downloads/1911457.mp4", id: 1911457 },
    { src: "http://localhost:3000/downloads/2019781.mp4", id: 2019781 },
    { src: "http://localhost:3000/downloads/2021532.mp4", id: 2021532 },
    { src: "http://localhost:3000/downloads/2053100.mp4", id: 2053100 },
    { src: "http://localhost:3000/downloads/2084684.mp4", id: 2084684 },
    { src: "http://localhost:3000/downloads/2099568.mp4", id: 2099568 },
    { src: "http://localhost:3000/downloads/2126081.mp4", id: 2126081 },
    { src: "http://localhost:3000/downloads/2219383.mp4", id: 2219383 },
    { src: "http://localhost:3000/downloads/2282013.mp4", id: 2282013 },
    { src: "http://localhost:3000/downloads/2292093.mp4", id: 2292093 },
    { src: "http://localhost:3000/downloads/2307411.mp4", id: 2307411 },
  ]

  constructor(private wsService: WsService, private httpService: HttpServiceService) { }

  ngOnInit() {
    this.wsService.videosChangedSubject.subscribe(data => {
      // console.log(data);
      this.videosData = data;
      this.renderedVideos = this.videosData.slice(0, this.renderedAmount);   // load only the first x (20) and the rest when the user scroll to the end
      this.loading = false;
    })
  }

  ngAfterViewInit() {
    // start all videos 
    setTimeout(() => {                       // TBD - this is a hotfix ( setTimeout ) - since the scroll called when component loads. -> need to change this.
      this.changeAllPlayersState("play");
    }, 300)
  }

  /**
* This function checks if the user hover on a video.
* if so, then we play the video and pause all other videos
*/
  onHover(id: string) {
    this.components.toArray().forEach(comp => {
      if (comp.id === id) {
        comp.videoplayer.nativeElement.play();
      }
      else {
        comp.videoplayer.nativeElement.pause();
      }
    })
  }

  /**
 * This function checks if the user scrolled to the end.
 * If the user in did scrolled to th end it renders more videos
 */
  checkToLoadMoreVideos() {
    let itemsInRow = Math.floor(window.innerWidth / 470);   // width + margin
    let maxScroll = (this.renderedVideos.length / itemsInRow) * 400;
    if (window.scrollY + 700 > maxScroll) {
      this.renderedAmount += 20;
      this.renderedVideos = this.videosData.slice(0, this.renderedAmount);
    }
  }

  /**
 * This function checks if a video item is visible within the screen.
 */
  isVisible = function (ele) {
    let positionTop = ele.videoplayer.nativeElement.offsetTop;
    let positionBottom = ele.videoplayer.nativeElement.offsetTop + ele.videoplayer.nativeElement.offsetHeight;

    // checking for partial visibility - enough that a part of the video is visable in the screen then play it
    return (
      positionBottom >= 0 + window.scrollY &&
      positionTop <= (window.innerHeight + window.scrollY)
    );
  };

  /**
* This function play/pause all players
*/
  changeAllPlayersState(isPlay) {
    if (isPlay === "play") {
      this.components.toArray().forEach(comp => {
        // We only play the visible videos within the screen to increase performance
        if (this.isVisible(comp)) {
          console.log('Element is partially visible in screen');
          comp.videoplayer.nativeElement.play();
        }
      });
    }
    else {
      this.components.toArray().forEach(comp => {
        comp.videoplayer.nativeElement.pause();
      });
    }
  }

  /**
* This function gets new videos from the server
*/
  getNewVideos() {
    this.loading = true;
    this.httpService.getNewVideos().subscribe(res => {
      if (!(res.status == IStatus.OK)) {
        this.loading = true;
        this.errorMessage = res.status;
      }
    })
  }
}