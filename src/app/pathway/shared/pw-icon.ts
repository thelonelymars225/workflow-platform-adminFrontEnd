import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type PwIconName =
  | 'get'
  | 'make'
  | 'check'
  | 'send'
  | 'arrow'
  | 'pencil'
  | 'lock'
  | 'user'
  | 'clock'
  | 'tick'
  | 'help';

/**
 * Outline icons on a 24px grid, matching the Figma icon/* set (inbox, document, eye, paper
 * plane, …). The exact Figma SVG exports could not be downloaded in the build environment, so
 * these are equivalent redraws. Replace the paths with the exported assets when available.
 */
const PATHS: Record<PwIconName, readonly string[]> = {
  get: [
    'M22 12h-6l-2 3h-4l-2-3H2',
    'M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z',
  ],
  make: [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
    'M8 13h8M8 17h8',
  ],
  check: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', 'M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0'],
  send: ['M22 2 11 13', 'M22 2 15 22l-4-9-9-4z'],
  arrow: ['M5 12h14', 'm12 5 7 7-7 7'],
  pencil: ['M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z'],
  lock: [
    'M6 11h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z',
    'M8 11V7a4 4 0 0 1 8 0v4',
  ],
  user: ['M8 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M4 21a8 8 0 0 1 16 0'],
  clock: ['M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0', 'M12 6v6l4 2'],
  tick: ['M20 6 9 17l-5-5'],
  help: [
    'M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0',
    'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3',
    'M12 17h.01',
  ],
};

/** Decorative outline icon; always paired with visible text, so hidden from assistive tech. */
@Component({
  selector: 'pw-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'inline-flex shrink-0' },
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    focusable="false"
  >
    @for (d of paths(); track $index) {
      <path [attr.d]="d" />
    }
  </svg>`,
})
export class PwIcon {
  readonly name = input.required<PwIconName>();
  readonly size = input(24);
  protected readonly paths = computed(() => PATHS[this.name()]);
}
