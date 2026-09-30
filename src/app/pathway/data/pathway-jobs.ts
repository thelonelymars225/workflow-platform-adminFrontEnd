import { Injectable, computed, signal } from '@angular/core';
import { NEW_JOB_STEPS, SAMPLE_JOBS, SAMPLE_USER } from './pathway-mock-data';
import { PathwayJob, PathwayUser, StepField, StepType } from './pathway.models';

/*
 * MOCK — jobs are held in memory and seeded from `pathway-mock-data.ts`. Replace this
 * service's internals with HttpClient calls once the API exists; the pages only depend on
 * its public surface.
 */

/** Tile title/detail from the two editor fields. Get shows the file first, then the app. */
export function tileFromFields(type: StepType, [a, b]: readonly [StepField, StepField]) {
  return type === 'get' ? { title: b.value, detail: a.value } : { title: a.value, detail: b.value };
}

@Injectable({ providedIn: 'root' })
export class PathwayJobs {
  private readonly state = signal<readonly PathwayJob[]>(SAMPLE_JOBS);
  private created = 0;

  readonly user: PathwayUser = SAMPLE_USER;
  readonly jobs = this.state.asReadonly();
  readonly needsYou = computed(() => this.jobs().filter((j) => j.group === 'needs-you'));
  readonly running = computed(() => this.jobs().filter((j) => j.group === 'running'));

  job(id: string | null | undefined) {
    return this.jobs().find((j) => j.id === id);
  }

  /** Replaces all jobs. Used by tests and, later, by the API load. */
  load(jobs: readonly PathwayJob[]) {
    this.state.set(jobs);
  }

  create(): PathwayJob {
    const job: PathwayJob = {
      ...SAMPLE_JOBS[0],
      id: `new-job-${++this.created}`,
      name: 'New job',
      description: '',
      stage: 'setup',
      group: 'needs-you',
      status: { kind: 'waiting', label: 'Being set up' },
      steps: NEW_JOB_STEPS,
      preview: {
        eyebrow: 'Preview',
        heading: 'Your result will appear here.',
        body: 'I make it after you finish setting up. Nothing is sent until you check it.',
        meta: '',
      },
      copy: {
        sendNote: 'This sends it to the people in the Send step. You can always see what was sent.',
        doneHeading: 'It was sent.',
        doneSummary: 'Everything that happened is written down here.',
        findIt: 'You can find this job any time under My jobs.',
      },
      recipients: {
        label: 'Who gets it',
        title: 'Not chosen yet',
        detail: 'Set in the Send step.',
      },
      source: { label: 'What was read', title: 'Not chosen yet', detail: 'Set in the Get step.' },
      record: [],
      checkedAt: '',
      sentAt: '',
    };
    this.state.update((jobs) => [job, ...jobs]);
    return job;
  }

  setDescription(id: string, description: string) {
    this.patch(id, () => ({ description }));
  }

  saveStep(id: string, type: StepType, values: readonly [string, string]) {
    this.patch(id, (job) => ({
      steps: job.steps.map((step) => {
        if (step.type !== type) return step;
        const fields = [
          { ...step.fields[0], value: values[0].trim() },
          { ...step.fields[1], value: values[1].trim() },
        ] as const;
        const tile = tileFromFields(type, fields);
        return {
          ...step,
          fields,
          title: tile.title || step.title,
          detail: tile.detail || step.detail,
        };
      }),
    }));
  }

  /** Setup finished: the job waits for the person to check what was made. */
  readyForCheck(id: string) {
    this.patch(id, () => ({
      stage: 'check',
      group: 'needs-you',
      status: { kind: 'waiting', label: 'Ready for you to check' },
    }));
  }

  /** Mock only: nothing is delivered anywhere. */
  send(id: string) {
    this.patch(id, (job) => ({
      stage: 'done',
      group: 'running',
      status: { kind: 'done', label: `Sent today at ${job.sentAt || '09:32'}` },
    }));
  }

  private patch(id: string, change: (job: PathwayJob) => Partial<PathwayJob>) {
    this.state.update((jobs) => jobs.map((j) => (j.id === id ? { ...j, ...change(j) } : j)));
  }
}
