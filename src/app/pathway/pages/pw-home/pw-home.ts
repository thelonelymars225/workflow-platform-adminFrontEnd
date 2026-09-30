import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PathwayJobs } from '../../data/pathway-jobs';
import { PathwayJob } from '../../data/pathway.models';
import { PwButton } from '../../shared/pw-button/pw-button';
import { PwMiniPathway } from '../../shared/pw-mini-pathway/pw-mini-pathway';
import { PwStatus } from '../../shared/pw-status/pw-status';

/** 02 / Home: greeting, then jobs grouped into "Needs you" and "Running on their own". */
@Component({
  selector: 'pw-home',
  imports: [NgTemplateOutlet, RouterLink, PwButton, PwMiniPathway, PwStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './pw-home.html',
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
