import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StepType } from '../../data/pathway.models';
import { PwTile } from './pw-tile';

@Component({
  imports: [PwTile],
  template: `<pw-tile
    type="make"
    title="Short report"
    detail="PDF"
    [editable]="true"
    (edit)="edited = $event"
  />`,
})
class Host {
  edited: StepType | null = null;
}

describe('PwTile', () => {
  it('is a button that emits its type when editable', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.textContent).toContain('make');
    expect(button.textContent).toContain('Short report');
    expect(button.className).toContain('bg-pw-step');
    expect(button.getAttribute('data-step')).toBe('make');
    button.click();
    expect(fixture.componentInstance.edited).toBe('make');
  });
});
