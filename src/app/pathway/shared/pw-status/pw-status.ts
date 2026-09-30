import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PwStatusKind } from '../../data/pathway.models';
import { PwIcon } from '../pw-icon/pw-icon';

/** Figma Status/Done and Status/Waiting. Always icon + word, never colour alone. */
@Component({
  selector: 'pw-status',
  imports: [PwIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex h-10 items-center gap-2 rounded-full pl-3.5 pr-4 font-pathway text-pw-label font-medium data-[kind=done]:bg-pw-success-tint data-[kind=done]:text-pw-success-strong data-[kind=waiting]:bg-pw-accent-tint data-[kind=waiting]:text-pw-accent-strong',
    '[attr.data-kind]': 'kind()',
  },
  templateUrl: './pw-status.html',
})
export class PwStatus {
  readonly kind = input.required<PwStatusKind>();
  readonly label = input.required<string>();
}
