import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: '[app-table-header]',
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class TableHeaderComponent {
  @Input() className = '';
  @HostBinding('class') get classes() { return this.className; }
}

