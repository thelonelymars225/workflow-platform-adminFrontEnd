import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PwButtonVariant = 'primary' | 'secondary' | 'quiet';

/**
 * Figma Button/Primary, Button/Secondary and Button/Quiet: one component, three variants.
 * Use as `<button pw-button variant="primary">` or `<a pw-button …>`; always at least 56px tall.
 */
@Component({
  selector: 'button[pw-button], a[pw-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex min-h-14 cursor-pointer items-center justify-center rounded-pw-button border-2 px-7 text-center font-pathway text-pw-button font-semibold no-underline data-[variant=primary]:border-pw-accent data-[variant=primary]:bg-pw-accent data-[variant=primary]:text-pw-on-accent data-[variant=secondary]:border-pw-muted data-[variant=secondary]:bg-pw-surface data-[variant=secondary]:text-pw-ink data-[variant=quiet]:border-transparent data-[variant=quiet]:bg-transparent data-[variant=quiet]:text-pw-accent',
    '[attr.data-variant]': 'variant()',
  },
  templateUrl: './pw-button.html',
})
export class PwButton {
  readonly variant = input<PwButtonVariant>('primary');
}
