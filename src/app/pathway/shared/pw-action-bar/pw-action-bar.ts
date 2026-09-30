import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The footer on every step screen: primary action first, secondary second, then a note.
 * Keeping it in one component keeps Back/primary in the same place on every screen.
 */
@Component({
  selector: 'pw-action-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col items-stretch gap-4 min-[900px]:flex-row min-[900px]:flex-wrap min-[900px]:items-center',
  },
  templateUrl: './pw-action-bar.html',
})
export class PwActionBar {
  readonly note = input('');
}
