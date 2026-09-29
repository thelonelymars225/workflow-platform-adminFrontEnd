import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type PwButtonVariant = 'primary' | 'secondary' | 'quiet';

const VARIANTS: Record<PwButtonVariant, string> = {
  primary: 'bg-pw-accent text-pw-on-accent border-2 border-pw-accent',
  secondary: 'bg-pw-surface text-pw-ink border-2 border-pw-muted',
  quiet: 'bg-transparent text-pw-accent border-2 border-transparent',
};

/**
 * Figma Button/Primary, Button/Secondary and Button/Quiet: one component, three variants.
 * Use as `<button pw-button variant="primary">` or `<a pw-button …>`; always at least 56px tall.
 */
@Component({
  selector: 'button[pw-button], a[pw-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class PwButton {
  readonly variant = input<PwButtonVariant>('primary');
  protected readonly classes = computed(
    () =>
      `inline-flex min-h-14 cursor-pointer items-center justify-center rounded-pw-button px-7 text-center font-pathway text-pw-button font-semibold no-underline ${VARIANTS[this.variant()]}`,
  );
}
