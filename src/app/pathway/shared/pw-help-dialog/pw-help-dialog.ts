import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { PwButton } from '../pw-button/pw-button';
import { PwIcon } from '../pw-icon/pw-icon';
import { StepType } from '../../data/pathway.models';

const ITEMS: readonly { type: StepType; name: string; text: string }[] = [
  { type: 'get', name: 'Get', text: 'Where the information comes from' },
  {
    type: 'make',
    name: 'Make',
    text: 'What gets produced: a report, a message, a decision',
  },
  {
    type: 'check',
    name: 'Check',
    text: 'You, or someone you choose, looks first',
  },
  {
    type: 'send',
    name: 'Send',
    text: 'Where it goes. Nothing goes without a check',
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
  templateUrl: './pw-help-dialog.html',
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
