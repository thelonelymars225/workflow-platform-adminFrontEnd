import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PwButton } from './pw-button';

@Component({
  imports: [PwButton],
  template: `
    <button pw-button id="primary">Go</button>
    <button pw-button id="secondary" variant="secondary">Later</button>
    <button pw-button id="quiet" variant="quiet">Close</button>
  `,
})
class Host {}

describe('PwButton', () => {
  it('has three variants, all at least 56px tall', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    for (const id of ['primary', 'secondary', 'quiet']) {
      expect(el.querySelector(`#${id}`)!.className).toContain('min-h-14');
    }
    for (const id of ['primary', 'secondary', 'quiet']) {
      expect(el.querySelector(`#${id}`)!.getAttribute('data-variant')).toBe(id);
    }
    expect(el.querySelector('#primary')!.className).toContain(
      'data-[variant=primary]:bg-pw-accent',
    );
  });
});
