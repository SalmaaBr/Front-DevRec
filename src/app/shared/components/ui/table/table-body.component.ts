import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: '[app-table-body]',
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class TableBodyComponent {
  @Input() className = '';
  @HostBinding('class') get classes() { return this.className; }
}
