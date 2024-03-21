import { Component, Input } from '@angular/core';
import { SUPPORTED_AUDIO_TYPES } from '@constants/app.constants';

@Component({
  selector: 'app-vc-audio',
  standalone: true,
  imports: [],
  templateUrl: './vc-audio.component.html'
})
export class VcAudioComponent {
  type: string;

  #src: string;
  @Input({ required: true })
  set src(value: string) {
    if (value) {
      this.#src = value;
      this.type = this.generateAudioType();
    }
  }
  get src(): string {
    return this.#src;
  }

  private generateAudioType(): string {
    const extension = this.getAudioExtension();
    return SUPPORTED_AUDIO_TYPES[extension];
  }

  private getAudioExtension(): string {
    const parts = this.src.split('.');
    return parts.at(-1).toLowerCase();
  }
}
