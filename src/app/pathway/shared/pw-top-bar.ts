import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PwIcon } from './pw-icon';
import { PwLogo } from './pw-logo';
import { PwNavItem } from './pw-nav-item';

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
  template: `
    <a routerLink="/pathway" class="rounded-pw-field no-underline"
      ><pw-logo /><span class="sr-only"> home</span></a
    >
    <nav aria-label="Main" class="order-3 w-full min-[900px]:order-none min-[900px]:w-auto">
      <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
        <li><a pw-nav-item routerLink="/pathway" [current]="section() === 'home'">Home</a></li>
        <li>
          <a pw-nav-item routerLink="/pathway" fragment="jobs" [current]="section() === 'jobs'"
            >My jobs</a
          >
        </li>
        <li>
          <button pw-nav-item type="button" aria-haspopup="dialog" (click)="help.emit()">
            Help
          </button>
        </li>
      </ul>
    </nav>
    <p
      class="m-0 inline-flex h-12 items-center gap-2.5 pl-3 pr-4 font-pathway text-pw-label font-medium text-pw-ink"
    >
      <pw-icon name="user" />
      <span><span class="sr-only">Signed in as </span>{{ userName() }}</span>
    </p>
  `,
})
export class PwTopBar {
  readonly section = input<PwSection>('home');
  readonly userName = input.required<string>();
  readonly help = output<void>();
}
