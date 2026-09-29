import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PwArrow } from './pw-arrow';
import { PwStatus, PwStatusKind } from './pw-status';
import { PwTile, StepType } from './pw-tile';

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
  template: `
    <ol
      class="m-0 flex list-none flex-col items-stretch p-0 min-[900px]:flex-row min-[900px]:items-start"
    >
      @for (step of steps(); track step.type; let last = $last) {
        <li class="flex flex-col items-center gap-3">
          <pw-tile
            class="w-full"
            [type]="step.type"
            [title]="step.title"
            [detail]="step.detail"
            [editable]="editable()"
            [selected]="selected() === step.type"
            (edit)="edit.emit($event)"
          />
          @if (step.status; as s) {
            <pw-status [kind]="s.kind" [label]="s.label" />
          }
        </li>
        @if (!last) {
          <li aria-hidden="true" class="flex justify-center"><pw-arrow /></li>
        }
      }
    </ol>
  `,
})
export class PwPathway {
  readonly steps = input.required<readonly PathStep[]>();
  readonly editable = input(false);
  readonly selected = input<StepType | null>(null);
  readonly edit = output<StepType>();
}
