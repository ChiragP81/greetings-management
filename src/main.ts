import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from '@environment/environment';
import { LoggerService } from '@services/logger.service';

import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';

document.title = environment.title;

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  LoggerService.error(err)
);
