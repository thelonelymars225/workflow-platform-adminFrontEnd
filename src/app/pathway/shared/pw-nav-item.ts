import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Figma Nav item. Current page gets the tint and aria-current. */
@Component({
  selector: 'a[pw-nav-item], button[pw-nav-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-current]': "current() ? 'page' : null",
  },
  template: '<ng-content />',
})
export class PwNavItem {
  readonly current = input(false);
  protected readonly classes = computed(
    () =>
      `inline-flex min-h-14 cursor-pointer items-center justify-center rounded-pw-field border-0 px-5 font-pathway text-pw-button font-semibold no-underline ${
        this.current() ? 'bg-pw-accent-tint text-pw-accent-strong' : 'bg-transparent text-pw-ink'
      }`,
  );
}
