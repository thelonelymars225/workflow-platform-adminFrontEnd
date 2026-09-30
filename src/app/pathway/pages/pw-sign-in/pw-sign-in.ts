import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PwButton } from '../../shared/pw-button/pw-button';
import { PwField } from '../../shared/pw-field/pw-field';
import { PwIcon } from '../../shared/pw-icon/pw-icon';
import { PwLogo } from '../../shared/pw-logo/pw-logo';
import { PwTile } from '../../shared/pw-tile/pw-tile';
import { StepType } from '../../data/pathway.models';

const EXPLAINER: readonly { type: StepType; title: string; detail: string }[] = [
  { type: 'get', title: 'Get the files', detail: 'From the apps you already use' },
  { type: 'make', title: 'Make the result', detail: 'A report, a message, a list' },
  { type: 'check', title: 'Check it first', detail: 'You, or someone you choose' },
  { type: 'send', title: 'Send it on', detail: 'Email, chat, or a folder' },
];

/**
 * 01 / Sign in. UI only: there is no authentication yet, so both buttons open the
 * sample workspace. The email is not stored or sent anywhere.
 */
@Component({
  selector: 'pw-sign-in',
  imports: [PwButton, PwField, PwIcon, PwLogo, PwTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-dvh flex-col bg-pw-bg font-pathway text-pw-ink min-[1100px]:flex-row',
  },
  templateUrl: './pw-sign-in.html',
})
export class PwSignIn {
  private readonly router = inject(Router);
  protected readonly explainer = EXPLAINER;
  protected readonly email = signal('');
  protected readonly error = signal('');

  protected continue(event: Event) {
    event.preventDefault();
    const email = this.email().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error.set(
        email ? 'Check the email. It should look like you@company.com' : 'Enter your work email',
      );
      (event.target as HTMLFormElement).querySelector<HTMLInputElement>('input')?.focus();
      return;
    }
    this.error.set('');
    this.openWorkspace();
  }

  protected openWorkspace() {
    void this.router.navigateByUrl('/pathway');
  }
}
