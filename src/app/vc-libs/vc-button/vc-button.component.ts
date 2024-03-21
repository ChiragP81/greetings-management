import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Params } from '@angular/router';
import { VcLoaderComponent } from 'app/vc-libs/vc-loader/vc-loader.component';

@Component({
  selector: 'app-vc-button',
  standalone: true,
  imports: [NgClass, VcLoaderComponent],
  templateUrl: './vc-button.component.html'
})
export class VcButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() class: Params;
  @Input() isDisabled = false;
  @Input() tooltip = '';
  @Input() spin = false;

  @Output() buttonTap = new EventEmitter<Event>();

  click(e: Event) {
    this.buttonTap.emit(e);
  }
}
