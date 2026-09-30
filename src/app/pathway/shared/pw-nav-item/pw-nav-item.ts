import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Figma Nav item. Current page gets the tint and aria-current. */
@Component({
  selector: 'a[pw-nav-item], button[pw-nav-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex min-h-14 cursor-pointer items-center justify-center rounded-pw-field border-0 bg-transparent px-5 font-pathway text-pw-button font-semibold text-pw-ink no-underline aria-[current=page]:bg-pw-accent-tint aria-[current=page]:text-pw-accent-strong',
    '[attr.aria-current]': "current() ? 'page' : null",
  },
  templateUrl: './pw-nav-item.html',
})
export class PwNavItem {
  readonly current = input(false);
}
