import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PwIcon } from './pw-icon';

/** Figma Arrow: joins two tiles. Points right on desktop, down when the pathway stacks. */
@Component({
  selector: 'pw-arrow',
  imports: [PwIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex h-10 items-center justify-center text-pw-ink min-[900px]:h-[220px] min-[900px]:w-14',
  },
  template: `<span class="inline-flex rotate-90 min-[900px]:rotate-0"
    ><pw-icon name="arrow" [size]="32"
  /></span>`,
})
export class PwArrow {}
