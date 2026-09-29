import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PathwayJob, PathwayJobs } from '../pathway-jobs';
import { PwActionBar } from '../shared/pw-action-bar';
import { PwButton } from '../shared/pw-button';
import { PathStep, PwPathway } from '../shared/pw-pathway';

/** 04 / Check (Step 2 of 3): pathway with statuses, the preview, and the send confirmation. */
@Component({
  selector: 'pw-check',
  imports: [RouterLink, PwActionBar, PwButton, PwPathway],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    @if (job(); as job) {
      <header class="flex flex-col gap-2">
        <p class="m-0 text-pw-label font-medium text-pw-accent">Step 2 of 3 · Check</p>
        @switch (job.stage) {
          @case ('setup') {
            <h1 class="m-0 text-pw-heading font-semibold">There is nothing to check yet.</h1>
            <p class="m-0 text-pw-body text-pw-muted">
              Finish setting up the steps first. I make the result after that.
            </p>
          }
          @case ('done') {
            <h1 class="m-0 text-pw-heading font-semibold">This was already checked and sent.</h1>
            <p class="m-0 text-pw-body text-pw-muted">You can see everything that happened.</p>
          }
          @default {
            <h1 class="m-0 text-pw-heading font-semibold">Take a look before it goes.</h1>
            <p class="m-0 text-pw-body text-pw-muted">
              Here is what I made. Nothing is sent until you press the button.
            </p>
          }
        }
      </header>
      <pw-pathway [steps]="steps()" />

      @if (job.stage === 'check') {
        <div class="grid grid-cols-1 gap-6 min-[1100px]:grid-cols-[minmax(0,1fr)_400px]">
          <section
            aria-label="Preview"
            class="flex min-w-0 flex-col gap-3 self-start rounded-pw-tile border-2 border-pw-border bg-pw-surface p-6 min-[900px]:p-8"
          >
            <p class="m-0 text-pw-label font-medium text-pw-accent">{{ job.preview.eyebrow }}</p>
            <h2 class="m-0 text-pw-section font-semibold">{{ job.preview.heading }}</h2>
            <p class="m-0 max-w-[816px] text-pw-body">{{ job.preview.body }}</p>
            @if (job.preview.meta) {
              <p class="m-0 text-pw-label font-medium text-pw-muted">{{ job.preview.meta }}</p>
            }
          </section>
          <div class="flex flex-col gap-4">
            @for (card of [job.recipients, job.source]; track card.label) {
              <section
                class="flex flex-col gap-1.5 rounded-pw-tile border-2 border-pw-border bg-pw-surface p-6"
                [attr.aria-label]="card.label"
              >
                <h2 class="m-0 text-pw-label font-medium text-pw-muted">{{ card.label }}</h2>
                <p class="m-0 text-pw-section font-semibold [overflow-wrap:anywhere]">
                  {{ card.title }}
                </p>
                <p class="m-0 text-pw-body text-pw-muted">{{ card.detail }}</p>
              </section>
            }
          </div>
        </div>
      }

      <pw-action-bar [note]="note(job)">
        @switch (job.stage) {
          @case ('setup') {
            <a pw-button [routerLink]="['/pathway/jobs', job.id, 'set-up']">Finish setting up</a>
            <a pw-button variant="secondary" routerLink="/pathway">Back to home</a>
          }
          @case ('done') {
            <a pw-button [routerLink]="['/pathway/jobs', job.id, 'done']">See what happened</a>
            <a pw-button variant="secondary" routerLink="/pathway">Back to home</a>
          }
          @default {
            <button pw-button type="button" (click)="send(job)">Looks good, send it</button>
            <a pw-button variant="secondary" [routerLink]="['/pathway/jobs', job.id, 'set-up']">
              Change something
            </a>
          }
        }
      </pw-action-bar>
    } @else {
      <h1 class="m-0 text-pw-heading font-semibold">We could not find that job.</h1>
      <p class="m-0 text-pw-body text-pw-muted">
        It may have been removed. Your other jobs are on Home.
      </p>
      <pw-action-bar><a pw-button routerLink="/pathway">Back to home</a></pw-action-bar>
    }
  `,
})
export class PwCheck {
  private readonly jobs = inject(PathwayJobs);
  private readonly router = inject(Router);
  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))),
  );
  protected readonly job = computed(() => this.jobs.job(this.id()));

  protected readonly steps = computed<PathStep[]>(() => {
    const job = this.job();
    if (!job) return [];
    return job.steps.map((step): PathStep => {
      if (job.stage === 'setup') return step;
      if (job.stage === 'done')
        return { ...step, status: { kind: 'done', label: step.type === 'send' ? 'Sent' : 'Done' } };
      if (step.type === 'get' || step.type === 'make')
        return { ...step, status: { kind: 'done', label: 'Done' } };
      if (step.type === 'check')
        return {
          ...step,
          status: {
            kind: 'waiting',
            label: step.title === 'You' ? 'Your turn' : `Waiting for ${step.title}`,
          },
        };
      return step;
    });
  });

  protected note(job: PathwayJob) {
    if (job.stage === 'setup') return 'Nothing is sent yet.';
    return job.stage === 'done' ? job.copy.findIt : job.copy.sendNote;
  }

  protected send(job: PathwayJob) {
    this.jobs.send(job.id);
    void this.router.navigate(['/pathway/jobs', job.id, 'done']);
  }
}
