import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent {
  @ViewChild('videoPlayer') videoplayer: ElementRef;
  @Input() src;
  @Input() id;
  @Input() isScrolling;
  @Output() onHover: EventEmitter<string> = new EventEmitter();

  constructor() { }

  /**
* This function gets called if the user hover on a video
* It emits an event to with the id of the hover video id
*/
  onMouseHover() {
    if (!this.isScrolling) {
      this.onHover.emit(this.id);
    }
  }

}
