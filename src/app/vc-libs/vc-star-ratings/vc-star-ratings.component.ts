/* eslint-disable */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
type StartIcon = 'star-outline' | 'star' | 'star-half';
@Component({
  selector: 'app-vc-star-ratings',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div class="vc-star-rating">
      @for (index of iconsArray; track index) {
        <button
          [ngStyle]="{ width: fontSize, height: fontSize }"
          [id]="index"
          type="button"
          (click)="changeRating($event)"
        >
          <app-svg-icon
            [ngStyle]="{
              color: getIconColor(index),
              'font-size': fontSize
            }"
            [name]="getIconName(index)"
          />
        </button>
      }
    </div>
  `,
  styles: [
    `
      .vc-star-rating button {
        background: none;
        box-shadow: none;
        -webkit-box-shadow: none;
        padding: 0px;
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: VcStarRatingsComponent,
      multi: true
    }
  ]
})
export class VcStarRatingsComponent implements ControlValueAccessor, OnInit {
  #_rating!: number;
  #onChange: any;
  #onTouched: any;
  disabled!: boolean;

  ngOnInit(): void {
    this.rating = this.rating || 0;
    for (let i = 0; i < this.maxRating; i++) {
      this.iconsArray.push(i);
    }
  }

  getIconColor(index: number) {
    return index < Math.round(this.rating)
      ? this.activeColor
      : this.defaultColor;
  }

  getIconName(index: number): StartIcon {
    if (
      this.halfStar &&
      this.rating - index > 0 &&
      this.rating - index <= 0.5
    ) {
      return this.halfIcon;
    }
    if (index < Math.round(this.rating)) {
      return this.activeIcon;
    }
    return this.defaultIcon;
  }

  writeValue(obj: number): void {
    this.rating = obj;
  }

  registerOnChange(fn: any): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.#onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.readonly = isDisabled;
  }

  @Input()
  set rating(val: number) {
    this.#_rating = val;

    if (this.#onChange) {
      this.#onChange(val);
    }
  }

  get rating(): number {
    return this.#_rating;
  }

  @Output()
  ratingChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input()
  readonly: boolean = false;
  @Input()
  activeColor: string = '#3367B1';
  @Input()
  defaultColor: string = '#aaaaaa';
  @Input()
  activeIcon: StartIcon = 'star';
  @Input()
  defaultIcon: StartIcon = 'star-outline';
  @Input()
  halfIcon: StartIcon = 'star-half';
  @Input()
  halfStar: boolean = false;
  @Input()
  maxRating: number = 5;
  @Input()
  fontSize: string = '28px';
  iconsArray: number[] = [];

  changeRating(event: any) {
    if (this.readonly) return;

    let id = event.target.id
      ? parseInt(event.target.id)
      : parseInt(event.target.parentElement.id);
    if (this.halfStar) {
      this.rating =
        this.rating - id > 0 && this.rating - id <= 0.5 ? id + 1 : id + 0.5;
    } else {
      this.rating = id + 1;
    }
    this.ratingChanged.emit(this.rating);
  }
}
