import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PwStatus } from './pw-status';

@Component({
  imports: [PwStatus],
  template: `
    <pw-status id="done" kind="done" label="Done" />
    <pw-status id="waiting" kind="waiting" label="Your turn" />
  `,
})
class Host {}

describe('PwStatus', () => {
  it('is always an icon plus a word', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    for (const [id, word] of [
      ['done', 'Done'],
      ['waiting', 'Your turn'],
    ]) {
      const status = el.querySelector(`#${id}`)!;
      expect(status.querySelector('pw-icon svg')).not.toBeNull();
      expect(status.textContent?.trim()).toBe(word);
    }
    expect(el.querySelector('#done')!.getAttribute('data-kind')).toBe('done');
    expect(el.querySelector('#waiting')!.getAttribute('data-kind')).toBe('waiting');
  });
});
