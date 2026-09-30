import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PathwayJobs } from '../../data/pathway-jobs';
import { PathwayJob } from '../../data/pathway.models';
import { PwActionBar } from '../../shared/pw-action-bar/pw-action-bar';
import { PwButton } from '../../shared/pw-button/pw-button';
import { PathStep, PwPathway } from '../../shared/pw-pathway/pw-pathway';

/** 04 / Check (Step 2 of 3): pathway with statuses, the preview, and the send confirmation. */
@Component({
  selector: 'pw-check',
  imports: [RouterLink, PwActionBar, PwButton, PwPathway],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './pw-check.html',
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
