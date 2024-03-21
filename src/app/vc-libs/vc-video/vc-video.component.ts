import { AfterViewInit, Component, Input } from '@angular/core';
import { SUPPORTED_VIDEO_TYPES } from '@constants/app.constants';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Component({
  selector: 'app-vc-video',
  standalone: true,
  imports: [],
  templateUrl: './vc-video.component.html'
})
export class VcVideoComponent implements AfterViewInit {
  player: Player;
  type: string;

  #src: string;
  @Input({ required: true })
  set src(value: string) {
    if (value) {
      this.#src = value;
      this.type = this.generateVideoType();
    }
  }
  get src(): string {
    return this.#src;
  }

  ngAfterViewInit(): void {
    const options = {
      responsive: true,
      userActions: {
        doubleClick: () => {
          this.player.isFullscreen()
            ? this.player.exitFullscreen()
            : this.player.requestFullscreen();
        }
      }
    };

    this.player = videojs('vc-video', options, async () => {
      await this.player.play();
    });
  }

  private generateVideoType(): string {
    const extension = this.getVideoExtension();
    return SUPPORTED_VIDEO_TYPES[extension];
  }

  private getVideoExtension(): string {
    const parts = this.src.split('.');
    return parts.at(-1).toLowerCase();
  }
}
