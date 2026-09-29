import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PwIcon } from './pw-icon';
import { StepType } from './pw-tile';

export interface MiniStep {
  type: StepType;
  label: string;
}

const BG: Record<StepType, string> = {
  get: 'bg-pw-tile-get',
  make: 'bg-pw-tile-make',
  check: 'bg-pw-tile-check',
  send: 'bg-pw-tile-send',
};

/** Compact get → make → check → send row of pills used on job rows. */
@Component({
  selector: 'pw-mini-pathway',
  imports: [PwIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ol class="m-0 flex list-none flex-wrap items-center gap-2 p-0">
      @for (step of steps(); track step.type; let last = $last) {
        <li
          class="inline-flex h-11 items-center gap-2 rounded-pw-pill pl-3 pr-3.5 font-pathway text-pw-label font-medium text-pw-ink"
          [class]="bg[step.type]"
        >
          <pw-icon [name]="step.type" [size]="20" />
          <span
            ><span class="sr-only">{{ step.type }}: </span>{{ step.label }}</span
          >
        </li>
        @if (!last) {
          <li aria-hidden="true" class="inline-flex text-pw-ink">
            <pw-icon name="arrow" [size]="20" />
          </li>
        }
      }
    </ol>
  `,
})
export class PwMiniPathway {
  readonly steps = input.required<readonly MiniStep[]>();
  protected readonly bg = BG;
}
