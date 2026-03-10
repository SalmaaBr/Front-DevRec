import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: '[app-table-cell]',
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: ``
})
export class TableCellComponent {
  @Input() isHeader = false;
  @Input() className = '';
  @HostBinding('class') get classes() { return this.className; }
}

