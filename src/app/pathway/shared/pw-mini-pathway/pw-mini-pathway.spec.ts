import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SAMPLE_STEPS } from '../../testing/pathway-testing';
import { PwMiniPathway } from './pw-mini-pathway';

@Component({
  imports: [PwMiniPathway],
  template: '<pw-mini-pathway [steps]="steps" />',
})
class Host {
  readonly steps = SAMPLE_STEPS.map((s) => ({ type: s.type, label: s.title }));
}

describe('PwMiniPathway', () => {
  it('shows pills in get → make → check → send order', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const pills = (fixture.nativeElement as HTMLElement).querySelectorAll('li:not([aria-hidden])');
    expect(Array.from(pills).map((p) => p.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'get: Sales spreadsheet',
      'make: Short report',
      'check: You',
      'send: Team leads',
    ]);
  });
});
