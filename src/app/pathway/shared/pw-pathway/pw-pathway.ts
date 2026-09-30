import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PwArrow } from '../pw-arrow/pw-arrow';
import { PwStatusKind, StepType } from '../../data/pathway.models';
import { PwStatus } from '../pw-status/pw-status';
import { PwTile } from '../pw-tile/pw-tile';

export interface PathStep {
  type: StepType;
  title: string;
  detail: string;
  status?: { kind: PwStatusKind; label: string };
}

/** Four tiles joined by arrows: a row at 900px+, a vertical stack below. */
@Component({
  selector: 'pw-pathway',
  imports: [PwTile, PwArrow, PwStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './pw-pathway.html',
})
export class PwPathway {
  readonly steps = input.required<readonly PathStep[]>();
  readonly editable = input(false);
  readonly selected = input<StepType | null>(null);
  readonly edit = output<StepType>();
}
