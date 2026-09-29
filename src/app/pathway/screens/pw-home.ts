import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PathwayJob, PathwayJobs } from '../pathway-jobs';
import { PwButton } from '../shared/pw-button';
import { PwMiniPathway } from '../shared/pw-mini-pathway';
import { PwStatus } from '../shared/pw-status';

/** 02 / Home: greeting, then jobs grouped into "Needs you" and "Running on their own". */
@Component({
  selector: 'pw-home',
  imports: [NgTemplateOutlet, RouterLink, PwButton, PwMiniPathway, PwStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <header
      class="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between"
    >
      <div class="flex flex-col gap-2">
        <h1 class="m-0 text-pw-display font-semibold">
          {{ jobs.user.greeting }}, {{ jobs.user.name }}.
        </h1>
        <p class="m-0 text-pw-body text-pw-muted">
          Here are your jobs. Open one, or start a new one.
        </p>
      </div>
      <button pw-button type="button" (click)="start()">+ Start a new job</button>
    </header>

    @if (!jobs.jobs().length) {
      <section
        class="flex flex-col items-start gap-4 rounded-pw-tile border-2 border-pw-border bg-pw-surface p-6"
      >
        <h2 class="m-0 text-pw-section font-semibold">You have no jobs yet.</h2>
        <p class="m-0 text-pw-body text-pw-muted">
          Start a new job and say what you need done. I will show you the four steps before anything
          happens.
        </p>
      </section>
    } @else {
      <div id="jobs" class="flex scroll-mt-6 flex-col gap-6">
        <ng-container
          *ngTemplateOutlet="
            group;
            context: {
              title: 'Needs you',
              list: jobs.needsYou(),
              empty: 'Nothing needs you right now.',
            }
          "
        />
        <ng-container
          *ngTemplateOutlet="
            group;
            context: {
              title: 'Running on their own',
              list: jobs.running(),
              empty: 'No jobs are running on their own yet.',
            }
          "
        />
      </div>
    }
    <p class="m-0 text-pw-label font-medium text-pw-muted">
      You can pause any job, or change any step, at any time. Nothing is sent without a check.
    </p>

    <ng-template #group let-title="title" let-list="list" let-empty="empty">
      <section class="flex flex-col gap-6" [attr.aria-label]="title">
        <h2 class="m-0 text-pw-section font-semibold">{{ title }}</h2>
        @for (job of asJobs(list); track job.id) {
          <article
            class="flex flex-col gap-4 rounded-pw-tile border-2 border-pw-border bg-pw-surface p-6 min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between"
            [attr.aria-labelledby]="'job-' + job.id"
          >
            <div class="flex min-w-0 flex-col gap-3">
              <h3 class="m-0 text-pw-section font-semibold" [id]="'job-' + job.id">
                {{ job.name }}
              </h3>
              <pw-mini-pathway [steps]="mini(job)" />
            </div>
            <div class="flex flex-wrap items-center gap-4">
              <pw-status [kind]="job.status.kind" [label]="job.status.label" />
              <a
                pw-button
                [variant]="job.group === 'needs-you' ? 'primary' : 'secondary'"
                [routerLink]="link(job)"
                [attr.aria-label]="action(job) + ': ' + job.name"
                >{{ action(job) }}</a
              >
            </div>
          </article>
        } @empty {
          <p class="m-0 text-pw-body text-pw-muted">{{ empty }}</p>
        }
      </section>
    </ng-template>
  `,
})
export class PwHome {
  protected readonly jobs = inject(PathwayJobs);
  private readonly router = inject(Router);

  protected asJobs(list: unknown) {
    return list as readonly PathwayJob[];
  }

  protected mini(job: PathwayJob) {
    return job.steps.map((s) => ({ type: s.type, label: s.title }));
  }

  protected link(job: PathwayJob) {
    const page = job.stage === 'setup' ? 'set-up' : job.stage;
    return ['/pathway/jobs', job.id, page];
  }

  protected action(job: PathwayJob) {
    if (job.group === 'running') return 'Open';
    return job.stage === 'setup' ? 'Finish setting up' : 'Check it';
  }

  protected start() {
    const job = this.jobs.create();
    void this.router.navigate(['/pathway/jobs', job.id, 'set-up']);
  }
}
