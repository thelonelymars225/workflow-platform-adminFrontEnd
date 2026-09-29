import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PwIcon } from './pw-icon';

export type StepType = 'get' | 'make' | 'check' | 'send';

export const STEP_TYPES: readonly StepType[] = ['get', 'make', 'check', 'send'];

const BG: Record<StepType, string> = {
  get: 'bg-pw-tile-get',
  make: 'bg-pw-tile-make',
  check: 'bg-pw-tile-check',
  send: 'bg-pw-tile-send',
};

const BASE =
  'flex min-h-[220px] w-full flex-col items-start gap-2.5 rounded-pw-tile border-0 p-6 text-left font-pathway text-pw-ink min-[900px]:w-[260px]';

/**
 * Figma Tile (Type=Get/Make/Check/Send). When `editable`, the whole tile is a button
 * (tap a step to change it); otherwise it is a static block.
 */
@Component({
  selector: 'pw-tile',
  imports: [PwIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (editable()) {
      <button
        type="button"
        [id]="'pw-tile-' + type()"
        [class]="classes()"
        [class.outline-3]="selected()"
        [class.outline-pw-accent]="selected()"
        [attr.aria-pressed]="selected()"
        [attr.aria-label]="'Change the ' + type() + ' step: ' + title()"
        (click)="edit.emit(type())"
      >
        <ng-container *ngTemplateOutlet="body" />
      </button>
    } @else {
      <div [class]="classes()"><ng-container *ngTemplateOutlet="body" /></div>
    }
    <ng-template #body>
      <span class="flex items-center gap-2.5">
        <pw-icon [name]="type()" [size]="28" />
        <span class="text-pw-label font-medium uppercase">{{ type() }}</span>
      </span>
      <span class="text-pw-tile font-semibold [overflow-wrap:anywhere]">{{ title() }}</span>
      <span class="text-pw-body text-pw-muted [overflow-wrap:anywhere]">{{ detail() }}</span>
    </ng-template>
  `,
})
export class PwTile {
  readonly type = input.required<StepType>();
  readonly title = input.required<string>();
  readonly detail = input('');
  readonly editable = input(false);
  readonly selected = input(false);
  readonly edit = output<StepType>();
  protected readonly classes = computed(() => `${BASE} ${BG[this.type()]}`);
}
