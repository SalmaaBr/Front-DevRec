import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: '[app-table-row]',
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class TableRowComponent {
  @Input() className = '';
  @HostBinding('class') get classes() { return this.className; }

}

