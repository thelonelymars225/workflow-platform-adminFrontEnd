import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PwIcon } from '../pw-icon/pw-icon';
import { StepType } from '../../data/pathway.models';

export interface MiniStep {
  type: StepType;
  label: string;
}

/** Compact get → make → check → send row of pills used on job rows. */
@Component({
  selector: 'pw-mini-pathway',
  imports: [PwIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './pw-mini-pathway.html',
})
export class PwMiniPathway {
  readonly steps = input.required<readonly MiniStep[]>();
}
