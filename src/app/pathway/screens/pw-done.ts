import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PathwayJobs } from '../pathway-jobs';
import { PwActionBar } from '../shared/pw-action-bar';
import { PwButton } from '../shared/pw-button';
import { PwIcon } from '../shared/pw-icon';
import { PathStep, PwPathway } from '../shared/pw-pathway';

/** 05 / Done (Step 3 of 3): success header, pathway all done, and the "What happened" record. */
@Component({
  selector: 'pw-done',
  imports: [RouterLink, PwActionBar, PwButton, PwIcon, PwPathway],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    @if (job(); as job) {
      @if (job.stage === 'done') {
        <header class="flex flex-col gap-2">
          <p class="m-0 text-pw-label font-medium text-pw-accent">Step 3 of 3 · Done</p>
          <h1 class="m-0 flex items-center gap-3 text-pw-heading font-semibold">
            <span
              class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-pw-success-tint text-pw-success-strong"
              ><pw-icon name="tick" [size]="26"
            /></span>
            {{ job.copy.doneHeading }}
          </h1>
          <p class="m-0 text-pw-body text-pw-muted">{{ job.copy.doneSummary }}</p>
        </header>
        <pw-pathway [steps]="steps()" />

        <h2 class="m-0 text-pw-section font-semibold">What happened</h2>
        @if (job.record.length) {
          <ol class="m-0 flex list-none flex-col gap-3 p-0">
            @for (row of job.record; track $index; let i = $index) {
              <li
                class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-pw-tile border-2 border-pw-border bg-pw-surface py-[18px] pl-5 pr-6"
              >
                <span class="flex min-w-0 items-center gap-4">
                  <span
                    aria-hidden="true"
                    class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-pw-accent-tint text-pw-button font-semibold text-pw-accent-strong"
                    >{{ i + 1 }}</span
                  >
                  <span class="text-pw-body [overflow-wrap:anywhere]">{{ row.text }}</span>
                </span>
                <time class="text-pw-body text-pw-muted">{{ row.time }}</time>
              </li>
            }
          </ol>
        } @else {
          <p class="m-0 text-pw-body text-pw-muted">
            Nothing has been written down for this job yet.
          </p>
        }

        <p class="sr-only" role="status">{{ repeatMessage() }}</p>
        @if (repeatMessage()) {
          <p class="m-0 text-pw-body font-semibold text-pw-success-strong">{{ repeatMessage() }}</p>
        }
        <pw-action-bar [note]="job.copy.findIt">
          <a pw-button routerLink="/pathway">Back to home</a>
          <button
            pw-button
            variant="secondary"
            type="button"
            [attr.aria-pressed]="!!repeatMessage()"
            (click)="repeat()"
          >
            Do this every month
          </button>
        </pw-action-bar>
      } @else {
        <header class="flex flex-col gap-2">
          <p class="m-0 text-pw-label font-medium text-pw-accent">Step 3 of 3 · Done</p>
          <h1 class="m-0 text-pw-heading font-semibold">This has not been sent yet.</h1>
          <p class="m-0 text-pw-body text-pw-muted">
            It is waiting for a check. Nothing goes without one.
          </p>
        </header>
        <pw-action-bar note="Nothing is sent yet.">
          <a
            pw-button
            [routerLink]="['/pathway/jobs', job.id, job.stage === 'setup' ? 'set-up' : 'check']"
          >
            {{ job.stage === 'setup' ? 'Finish setting up' : 'Check it now' }}
          </a>
          <a pw-button variant="secondary" routerLink="/pathway">Back to home</a>
        </pw-action-bar>
      }
    } @else {
      <h1 class="m-0 text-pw-heading font-semibold">We could not find that job.</h1>
      <p class="m-0 text-pw-body text-pw-muted">
        It may have been removed. Your other jobs are on Home.
      </p>
      <pw-action-bar><a pw-button routerLink="/pathway">Back to home</a></pw-action-bar>
    }
  `,
})
export class PwDone {
  private readonly jobs = inject(PathwayJobs);
  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))),
  );
  protected readonly job = computed(() => this.jobs.job(this.id()));
  /** Mock only: scheduling is not built, so this just confirms the choice on screen. */
  protected readonly repeatMessage = signal('');

  protected readonly steps = computed<PathStep[]>(() => {
    const job = this.job();
    if (!job) return [];
    return job.steps.map((step) => ({
      ...step,
      detail: step.type === 'check' && job.checkedAt ? `Checked at ${job.checkedAt}` : step.detail,
      status: { kind: 'done', label: step.type === 'send' ? 'Sent' : 'Done' },
    }));
  });

  protected repeat() {
    this.repeatMessage.set('Saved. This job will run again next month and wait for your check.');
  }
}
