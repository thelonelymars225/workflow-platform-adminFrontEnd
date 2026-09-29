import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PwIcon } from './pw-icon';

export type PwStatusKind = 'done' | 'waiting';

/** Figma Status/Done and Status/Waiting. Always icon + word, never colour alone. */
@Component({
  selector: 'pw-status',
  imports: [PwIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<pw-icon [name]="kind() === 'done' ? 'tick' : 'clock'" [size]="20" /><span>{{
      label()
    }}</span>`,
})
export class PwStatus {
  readonly kind = input.required<PwStatusKind>();
  readonly label = input.required<string>();
  protected readonly classes = computed(
    () =>
      `inline-flex h-10 items-center gap-2 rounded-full pl-3.5 pr-4 font-pathway text-pw-label font-medium ${
        this.kind() === 'done'
          ? 'bg-pw-success-tint text-pw-success-strong'
          : 'bg-pw-accent-tint text-pw-accent-strong'
      }`,
  );
}
