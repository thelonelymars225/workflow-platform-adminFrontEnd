import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PwIcon } from './pw-icon';

/** workFlow mark + wordmark, as in the Top bar and Sign in intro. */
@Component({
  selector: 'pw-logo',
  imports: [PwIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-3' },
  template: `
    <span
      class="inline-flex size-9 items-center justify-center rounded-[10px] bg-pw-accent text-pw-on-accent"
    >
      <pw-icon name="arrow" [size]="22" />
    </span>
    <span class="font-pathway text-pw-section font-semibold text-pw-ink">workFlow</span>
  `,
})
export class PwLogo {}
