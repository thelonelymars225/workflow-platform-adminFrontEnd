import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PwIcon } from '../pw-icon/pw-icon';
import { PwLogo } from '../pw-logo/pw-logo';
import { PwNavItem } from '../pw-nav-item/pw-nav-item';

export type PwSection = 'home' | 'jobs';

/** Figma Top bar: logo, Home / My jobs / Help, and the signed-in person. */
@Component({
  selector: 'pw-top-bar',
  imports: [RouterLink, PwIcon, PwLogo, PwNavItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex min-h-20 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b-2 border-pw-border bg-pw-surface px-4 py-3 min-[900px]:px-10 min-[900px]:py-[11px]',
  },
  templateUrl: './pw-top-bar.html',
})
export class PwTopBar {
  readonly section = input<PwSection>('home');
  readonly userName = input.required<string>();
  readonly help = output<void>();
}
