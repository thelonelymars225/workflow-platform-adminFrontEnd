import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PwButton } from '../shared/pw-button';
import { PwField } from '../shared/pw-field';
import { PwIcon } from '../shared/pw-icon';
import { PwLogo } from '../shared/pw-logo';
import { PwTile, StepType } from '../shared/pw-tile';

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
  template: `
    <section
      aria-labelledby="pw-intro-title"
      class="flex flex-1 flex-col justify-center gap-8 px-4 py-10 min-[900px]:p-20"
    >
      <pw-logo />
      <h2 id="pw-intro-title" class="m-0 max-w-[560px] text-pw-display font-semibold">
        Every job is four steps.
      </h2>
      <p class="m-0 max-w-[560px] text-pw-body text-pw-muted">
        Tell me what you need done. I show you the steps as a picture, you check them, and nothing
        is sent until you say so.
      </p>
      <ul class="m-0 grid max-w-[544px] list-none grid-cols-1 gap-6 p-0 min-[600px]:grid-cols-2">
        @for (tile of explainer; track tile.type) {
          <li><pw-tile [type]="tile.type" [title]="tile.title" [detail]="tile.detail" /></li>
        }
      </ul>
    </section>
    <main
      class="flex flex-col items-center justify-center border-t-2 border-pw-border bg-pw-surface px-4 py-10 min-[900px]:p-20 min-[1100px]:w-[640px] min-[1100px]:border-t-0 min-[1100px]:border-l-2"
    >
      <form class="flex w-full max-w-[480px] flex-col gap-6" novalidate (submit)="continue($event)">
        <h1 class="m-0 text-pw-heading font-semibold">Welcome back.</h1>
        <p class="m-0 text-pw-body text-pw-muted">
          Sign in with the account your workplace gave you.
        </p>
        <pw-field
          label="Work email"
          type="email"
          autocomplete="email"
          hint="Use the same email you use at work"
          [error]="error()"
          [(value)]="email"
        />
        <button pw-button type="submit" class="w-full">Continue</button>
        <button
          pw-button
          variant="secondary"
          type="button"
          class="w-full"
          (click)="openWorkspace()"
        >
          Continue with Google
        </button>
        <p class="m-0 flex items-start gap-2.5 text-pw-label font-medium text-pw-muted">
          <pw-icon name="lock" />
          <span>Need help signing in? Ask your workspace administrator, Sara Ahmed.</span>
        </p>
      </form>
    </main>
  `,
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
