import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PwButton } from './pw-button';
import { PwField } from './pw-field';
import { PwHelpDialog } from './pw-help-dialog';
import { PwMiniPathway } from './pw-mini-pathway';
import { PathStep, PwPathway } from './pw-pathway';
import { PwStatus } from './pw-status';
import { PwTile, StepType } from './pw-tile';

const STEPS: PathStep[] = [
  {
    type: 'get',
    title: 'Sales spreadsheet',
    detail: 'Google Drive',
    status: { kind: 'done', label: 'Done' },
  },
  { type: 'make', title: 'Short report', detail: 'PDF' },
  {
    type: 'check',
    title: 'You',
    detail: 'Before sending',
    status: { kind: 'waiting', label: 'Your turn' },
  },
  { type: 'send', title: 'Team leads', detail: 'By email' },
];

@Component({
  imports: [PwButton, PwField, PwStatus, PwTile, PwPathway, PwMiniPathway],
  template: `
    <button pw-button id="primary">Go</button>
    <button pw-button id="secondary" variant="secondary">Later</button>
    <button pw-button id="quiet" variant="quiet">Close</button>
    <pw-field label="Work email" hint="Use your work email" [error]="error()" [(value)]="email" />
    <pw-status id="done" kind="done" label="Done" />
    <pw-status id="waiting" kind="waiting" label="Your turn" />
    <pw-tile
      id="tile"
      type="make"
      title="Short report"
      detail="PDF"
      [editable]="true"
      (edit)="edited = $event"
    />
    <pw-pathway id="path" [steps]="steps" [editable]="true" (edit)="edited = $event" />
    <pw-mini-pathway id="mini" [steps]="mini" />
  `,
})
class Host {
  readonly email = signal('');
  readonly error = signal('');
  readonly steps = STEPS;
  readonly mini = STEPS.map((s) => ({ type: s.type, label: s.title }));
  edited: StepType | null = null;
}

function render() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Pathway shared components', () => {
  it('Button: three variants, all at least 56px tall', () => {
    const { el } = render();
    for (const id of ['primary', 'secondary', 'quiet']) {
      expect(el.querySelector(`#${id}`)!.className).toContain('min-h-14');
    }
    expect(el.querySelector('#primary')!.className).toContain('bg-pw-accent');
    expect(el.querySelector('#secondary')!.className).toContain('border-pw-muted');
    expect(el.querySelector('#quiet')!.className).toContain('bg-transparent');
  });

  it('Field: visible label tied to the input, hint and error described', () => {
    const { fixture, el } = render();
    const input = el.querySelector<HTMLInputElement>('pw-field input')!;
    const label = el.querySelector<HTMLLabelElement>('pw-field label')!;
    expect(label.textContent?.trim()).toBe('Work email');
    expect(label.htmlFor).toBe(input.id);
    expect(input.placeholder).toBe('');
    input.value = 'me@work.com';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.email()).toBe('me@work.com');
    fixture.componentInstance.error.set('Enter your work email');
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const described = input.getAttribute('aria-describedby')!.split(' ');
    expect(described.map((id) => el.querySelector(`#${id}`)?.textContent?.trim())).toEqual([
      'Enter your work email',
      'Use your work email',
    ]);
  });

  it('Status: always an icon plus a word', () => {
    const { el } = render();
    for (const [id, word] of [
      ['done', 'Done'],
      ['waiting', 'Your turn'],
    ]) {
      const status = el.querySelector(`#${id}`)!;
      expect(status.querySelector('pw-icon svg')).not.toBeNull();
      expect(status.textContent?.trim()).toBe(word);
    }
    expect(el.querySelector('#done')!.className).toContain('text-pw-success-strong');
    expect(el.querySelector('#waiting')!.className).toContain('text-pw-accent-strong');
  });

  it('Tile: editable tile is a button that emits its type', () => {
    const { fixture, el } = render();
    const button = el.querySelector<HTMLButtonElement>('#tile button')!;
    expect(button.textContent).toContain('make');
    expect(button.textContent).toContain('Short report');
    expect(button.className).toContain('bg-pw-tile-make');
    button.click();
    expect(fixture.componentInstance.edited).toBe('make');
  });

  it('Pathway: four tiles joined by three arrows, with statuses where given', () => {
    const { fixture, el } = render();
    const path = el.querySelector('#path')!;
    expect(path.querySelectorAll('pw-tile').length).toBe(4);
    expect(path.querySelectorAll('pw-arrow').length).toBe(3);
    expect(
      Array.from(path.querySelectorAll('pw-status')).map((s) => s.textContent?.trim()),
    ).toEqual(['Done', 'Your turn']);
    path.querySelector<HTMLButtonElement>('#pw-tile-send')!.click();
    expect(fixture.componentInstance.edited).toBe('send');
  });

  it('Mini pathway: pills in get → make → check → send order', () => {
    const { el } = render();
    const pills = Array.from(el.querySelectorAll('#mini li:not([aria-hidden])'));
    expect(pills.map((p) => p.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'get: Sales spreadsheet',
      'make: Short report',
      'check: You',
      'send: Team leads',
    ]);
  });
});

describe('Help dialog', () => {
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
