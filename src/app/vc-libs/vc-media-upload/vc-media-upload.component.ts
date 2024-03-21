import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP, TOTAL_PERCENT } from '@constants/app.constants';
import { MediaUploadService } from '@services/media-upload.service';
import { TabFormService } from '@services/tab-form.service';

@Component({
  selector: 'app-vc-media-upload',
  standalone: true,
  imports: [CommonModule],
  template: ''
})
export class VcMediaUploadComponent implements OnInit {
  #destroyRef = inject(DestroyRef);

  constructor(
    private mediaUploadService: MediaUploadService,
    private tabFormService: TabFormService
  ) {}

  ngOnInit(): void {
    this.uploadMedia();
  }

  uploadMedia() {
    this.mediaUploadService.mediaDetail$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((media) => {
        for (const m of media) {
          this.mediaUploadService
            .uploadMedia(m)
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((progress) => {
              if (typeof progress === 'boolean') {
                setTimeout(() => {
                  this.mediaUploadService.mediaUploaded$.next(
                    this.tabFormService.currentTabIndex
                  );
                }, APP.TIME_DELAY);
              } else {
                const index = this.mediaUploadService.mediaDetail.findIndex(
                  (item) => item.url === m.url
                );
                if (index !== -1) {
                  this.mediaUploadService.mediaDetail[index].progress =
                    progress;
                  if (progress === TOTAL_PERCENT) {
                    setTimeout(() => {
                      this.mediaUploadService.mediaDetail =
                        this.mediaUploadService.mediaDetail.filter(
                          (item) => item.url !== m.url
                        );
                    }, APP.TIME_DELAY);
                  }
                } else {
                  this.mediaUploadService.mediaDetail.push({ ...m, progress });
                }
              }
            });
        }
      });
  }
}
