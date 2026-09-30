import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PathwayJobs } from '../../data/pathway-jobs';
import { PwActionBar } from '../../shared/pw-action-bar/pw-action-bar';
import { PwButton } from '../../shared/pw-button/pw-button';
import { PwIcon } from '../../shared/pw-icon/pw-icon';
import { PathStep, PwPathway } from '../../shared/pw-pathway/pw-pathway';

/** 05 / Done (Step 3 of 3): success header, pathway all done, and the "What happened" record. */
@Component({
  selector: 'pw-done',
  imports: [RouterLink, PwActionBar, PwButton, PwIcon, PwPathway],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './pw-done.html',
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
