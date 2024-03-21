import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatNativeDateModule } from '@angular/material/core';
import {
  MatDateRangePicker,
  MatDatepicker,
  MatDatepickerModule
} from '@angular/material/datepicker';
import {
  END_OF_DAY_HOURS,
  END_OF_DAY_MILLISECONDS,
  END_OF_DAY_MINUTES,
  END_OF_DAY_SECONDS
} from '@constants/app.constants';
import { KeyValue } from '@models/common.model';
import { UtilityService } from '@services/utility.service';
import { SearchField, SearchFieldType } from '@vc-libs/types';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcSvgIconComponent } from '@vc-libs/vc-svg-icon/vc-svg-icon.component';

const modules = [
  FormsModule,
  ReactiveFormsModule,
  TranslateModule,
  NgSelectModule,
  MatDatepickerModule,
  MatNativeDateModule
];
const components = [VcInputComponent, VcButtonComponent, VcSvgIconComponent];

@Component({
  selector: 'app-vc-search',
  standalone: true,
  imports: [...modules, ...components],
  templateUrl: './vc-search.component.html'
})
export class VcSearchComponent {
  @Input() loader: boolean;
  @Input({ required: true }) items: SearchField[];
  @Input() set prefillValue(prop: KeyValue) {
    prop && (this.searchParams[prop.key as string] = prop.value);
  }
  @Output() search = new EventEmitter<Record<string, unknown>>();
  @Output() clear = new EventEmitter<Record<string, unknown>>();

  searchParams: Record<string, unknown> = {};
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });
  previousSearchParams: Record<string, unknown> = { searchText: '' };
  today = new Date();

  readonly fieldType = SearchFieldType;

  constructor(
    private translateService: TranslateService,
    private utilityService: UtilityService
  ) {}

  onSearch() {
    this.searchParams.searchText = (
      this.searchParams.searchText as string
    )?.trim();
    if (
      this.utilityService.areObjectsSimilar(
        this.searchParams,
        this.previousSearchParams
      ) &&
      this.utilityService.checkObjectIsEmpty(this.searchParams)
    )
      return;
    this.previousSearchParams = JSON.parse(JSON.stringify(this.searchParams));
    this.search.emit(this.searchParams);
  }

  onClear() {
    if (
      this.utilityService.areObjectsSimilar(
        this.searchParams,
        this.previousSearchParams
      ) &&
      this.utilityService.checkObjectIsEmpty(this.searchParams)
    )
      return;
    this.searchParams = {};
    this.dateRange.reset();
    this.previousSearchParams = { searchText: '' };
    this.search.emit(this.searchParams);
  }

  onClearDate(picker: MatDatepicker<unknown>, key: string) {
    this.searchParams[key] = null;
    picker.close();
  }

  onClearDateRange(picker: MatDateRangePicker<unknown>, key: string) {
    this.dateRange.reset();
    this.searchParams[key] = null;
    picker.close();
  }

  onApplyDateRange(key: string) {
    if (this.dateRange.value.start && this.dateRange.value.end) {
      this.dateRange.value.end.setHours(
        END_OF_DAY_HOURS,
        END_OF_DAY_MINUTES,
        END_OF_DAY_SECONDS,
        END_OF_DAY_MILLISECONDS
      );
      this.searchParams[key] = this.dateRange.value;
    } else {
      this.dateRange.reset();
      this.searchParams[key] = null;
    }
  }

  translationExist(key: string) {
    return this.translateService.instant(key) !== key;
  }
}
