import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { PwButton } from './pw-button';
import { PwIcon } from './pw-icon';
import { StepType } from './pw-tile';

const ITEMS: readonly { type: StepType; name: string; text: string; bg: string }[] = [
  { type: 'get', name: 'Get', text: 'Where the information comes from', bg: 'bg-pw-tile-get' },
  {
    type: 'make',
    name: 'Make',
    text: 'What gets produced: a report, a message, a decision',
    bg: 'bg-pw-tile-make',
  },
  {
    type: 'check',
    name: 'Check',
    text: 'You, or someone you choose, looks first',
    bg: 'bg-pw-tile-check',
  },
  {
    type: 'send',
    name: 'Send',
    text: 'Where it goes. Nothing goes without a check',
    bg: 'bg-pw-tile-send',
  },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Figma Dialog / Help. A native modal dialog (the page behind is inert), plus an explicit
 * Tab/Shift+Tab trap and Esc handling so behaviour is the same in every browser.
 * Focus returns to whatever opened it.
 */
@Component({
  selector: 'pw-help-dialog',
  imports: [PwButton, PwIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      aria-labelledby="pw-help-title"
      aria-describedby="pw-help-intro"
      class="m-auto max-h-[calc(100dvh-32px)] w-[min(600px,calc(100vw-32px))] rounded-[24px] border-2 border-pw-border bg-pw-surface p-6 text-pw-ink backdrop:bg-pw-ink/60 min-[600px]:p-10"
      (keydown)="onKeydown($event)"
      (cancel)="$event.preventDefault(); close()"
      (close)="restoreFocus()"
    >
      <div class="flex flex-col gap-6 font-pathway">
        <h2 id="pw-help-title" class="m-0 flex items-center gap-3 text-pw-heading font-semibold">
          <span class="text-pw-accent"><pw-icon name="help" [size]="32" /></span>Help
        </h2>
        <p id="pw-help-intro" class="m-0 text-pw-body text-pw-muted">
          Every job follows the same four steps. You can change any step by tapping it.
        </p>
        <ul class="m-0 flex list-none flex-col gap-6 p-0">
          @for (item of items; track item.type) {
            <li class="flex items-center gap-3.5">
              <span
                class="inline-flex size-12 shrink-0 items-center justify-center rounded-pw-field"
                [class]="item.bg"
              >
                <pw-icon [name]="item.type" />
              </span>
              <span class="flex flex-col gap-0.5">
                <span class="text-pw-section font-semibold">{{ item.name }}</span>
                <span class="text-pw-body text-pw-muted">{{ item.text }}</span>
              </span>
            </li>
          }
        </ul>
        <p class="m-0 text-pw-body">
          Want to talk to a person? Your workspace administrator is {{ admin() }}.
        </p>
        <button pw-button type="button" class="w-full" (click)="close()">
          Back to what I was doing
        </button>
      </div>
    </dialog>
  `,
})
export class PwHelpDialog {
  readonly admin = input('Sara Ahmed');
  protected readonly items = ITEMS;
  readonly isOpen = signal(false);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private opener: HTMLElement | null = null;

  open() {
    const dialog = this.dialog().nativeElement;
    this.opener = document.activeElement as HTMLElement | null;
    dialog.showModal();
    this.isOpen.set(true);
    this.focusables()[0]?.focus();
  }

  close() {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) dialog.close();
    this.isOpen.set(false);
    this.restoreFocus();
  }

  protected restoreFocus() {
    this.isOpen.set(false);
    this.opener?.focus?.();
    this.opener = null;
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = this.focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !this.dialog().nativeElement.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusables() {
    return Array.from(this.dialog().nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE));
  }
}
