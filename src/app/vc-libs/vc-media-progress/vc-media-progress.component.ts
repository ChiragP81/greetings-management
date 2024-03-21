import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { UploadMediaDetail } from '@models/common.model';
import { FormatBytesPipe } from '@pipes/format-bytes.pipe';
import { MediaUploadService } from '@services/media-upload.service';

@Component({
  selector: 'app-vc-media-progress',
  standalone: true,
  imports: [CommonModule, SvgIconComponent, FormatBytesPipe],
  templateUrl: './vc-media-progress.component.html'
})
export class VcMediaProgressComponent {
  constructor(private mediaUploadService: MediaUploadService) {}

  get uploadedMediaList(): UploadMediaDetail[] {
    return this.mediaUploadService.mediaDetail;
  }

  closeDialog() {
    this.mediaUploadService.mediaDetail = [];
  }
}
