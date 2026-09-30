import { TestBed } from '@angular/core/testing';
import { PwHelpDialog } from './pw-help-dialog';

describe('PwHelpDialog', () => {
  beforeEach(() => {
    // jsdom has no modal dialog support; emulate the open attribute.
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  function openDialog() {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const fixture = TestBed.createComponent(PwHelpDialog);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    fixture.componentInstance.open();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    return { fixture, dialog, opener };
  }

  it('explains Get, Make, Check and Send and names the contact', () => {
    const { dialog } = openDialog();
    expect(dialog.open).toBe(true);
    const text = dialog.textContent!;
    for (const word of ['Get', 'Make', 'Check', 'Send', 'Sara Ahmed']) expect(text).toContain(word);
  });

  it('traps Tab focus and closes on Esc, returning focus', () => {
    const { dialog, opener } = openDialog();
    const close = dialog.querySelector<HTMLButtonElement>('button')!;
    expect(document.activeElement).toBe(close);
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    close.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(close);
    const shiftTab = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    close.dispatchEvent(shiftTab);
    expect(shiftTab.defaultPrevented).toBe(true);
    close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('closes from the primary button', () => {
    const { dialog } = openDialog();
    dialog.querySelector<HTMLButtonElement>('button')!.click();
    expect(dialog.open).toBe(false);
  });
});
