import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StepType } from '../../data/pathway.models';
import { SAMPLE_STEPS } from '../../testing/pathway-testing';
import { PwPathway } from './pw-pathway';

@Component({
  imports: [PwPathway],
  template: `<pw-pathway [steps]="steps" [editable]="true" (edit)="edited = $event" />`,
})
class Host {
  readonly steps = SAMPLE_STEPS;
  edited: StepType | null = null;
}

describe('PwPathway', () => {
  it('joins four tiles with three arrows, with statuses where given', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('pw-tile').length).toBe(4);
    expect(el.querySelectorAll('pw-arrow').length).toBe(3);
    expect(Array.from(el.querySelectorAll('pw-status')).map((s) => s.textContent?.trim())).toEqual([
      'Done',
      'Your turn',
    ]);
    el.querySelector<HTMLButtonElement>('#pw-tile-send')!.click();
    expect(fixture.componentInstance.edited).toBe('send');
  });
});
