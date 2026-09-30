import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PwField } from './pw-field';

@Component({
  imports: [PwField],
  template: `<pw-field
    label="Work email"
    hint="Use your work email"
    [error]="error()"
    [(value)]="email"
  />`,
})
class Host {
  readonly email = signal('');
  readonly error = signal('');
}

describe('PwField', () => {
  it('ties a visible label to the input and describes the hint and error', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
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
});
