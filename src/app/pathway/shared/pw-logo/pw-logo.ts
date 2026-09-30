import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PwIcon } from '../pw-icon/pw-icon';

/** workFlow mark + wordmark, as in the Top bar and Sign in intro. */
@Component({
  selector: 'pw-logo',
  imports: [PwIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-3' },
  templateUrl: './pw-logo.html',
})
export class PwLogo {}
