import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { StepType } from '../../data/pathway.models';
import { PwIcon } from '../pw-icon/pw-icon';

/**
 * Figma Tile (Type=Get/Make/Check/Send). When `editable`, the whole tile is a button
 * (tap a step to change it); otherwise it is a static block.
 */
@Component({
  selector: 'pw-tile',
  imports: [PwIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './pw-tile.html',
})
export class PwTile {
  readonly type = input.required<StepType>();
  readonly title = input.required<string>();
  readonly detail = input('');
  readonly editable = input(false);
  readonly selected = input(false);
  readonly edit = output<StepType>();
}
