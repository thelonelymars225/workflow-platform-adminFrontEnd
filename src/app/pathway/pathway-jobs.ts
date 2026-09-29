import { Injectable, computed, signal } from '@angular/core';
import { PwStatusKind } from './shared/pw-status';
import { StepType } from './shared/pw-tile';

/*
 * MOCK DATA — the backend task model (steps, runs, delivery) does not exist yet.
 * `/api/workflows` only stores a name and description, so every job, step, preview and
 * record below is sample data held in memory. Replace this service's internals with
 * HttpClient calls once the API exists; the screens only depend on its public surface.
 */

export interface StepField {
  label: string;
  value: string;
  hint: string;
}

export interface JobStep {
  type: StepType;
  title: string;
  detail: string;
  /** The two editor fields shown by "You are changing the X step". */
  fields: readonly [StepField, StepField];
}

export type JobStage = 'setup' | 'check' | 'done';

export interface JobCard {
  label: string;
  title: string;
  detail: string;
}

export interface PathwayJob {
  id: string;
  name: string;
  description: string;
  stage: JobStage;
  /** Where Home lists the job. */
  group: 'needs-you' | 'running';
  status: { kind: PwStatusKind; label: string };
  steps: readonly JobStep[];
  preview: { eyebrow: string; heading: string; body: string; meta: string };
  /** Screen copy that names what this job makes. */
  copy: { sendNote: string; doneHeading: string; doneSummary: string; findIt: string };
  recipients: JobCard;
  source: JobCard;
  checkedAt: string;
  sentAt: string;
  record: readonly { text: string; time: string }[];
}

export interface PathwayUser {
  name: string;
  greeting: string;
  admin: string;
}

function field(label: string, value: string, hint = ''): StepField {
  return { label, value, hint };
}

/** Tile title/detail from the two editor fields. Get shows the file first, then the app. */
export function tileFromFields(type: StepType, [a, b]: readonly [StepField, StepField]) {
  return type === 'get' ? { title: b.value, detail: a.value } : { title: a.value, detail: b.value };
}

const SAMPLE_JOBS: readonly PathwayJob[] = [
  {
    id: 'monthly-sales',
    name: 'Monthly sales report',
    description:
      'Turn the monthly sales spreadsheet into a short report and send it to the team leads.',
    stage: 'check',
    group: 'needs-you',
    status: { kind: 'waiting', label: 'Ready for you to check' },
    steps: [
      {
        type: 'get',
        title: 'Sales spreadsheet',
        detail: 'Google Drive · Finance folder',
        fields: [
          field('Which app', 'Google Drive', 'Connected to Mars workspace'),
          field('Which file', 'September sales.xlsx', 'In Finance / Monthly reports'),
        ],
      },
      {
        type: 'make',
        title: 'Short report',
        detail: 'PDF, about one page',
        fields: [
          field('What to make', 'Short report'),
          field('What it looks like', 'PDF, about one page'),
        ],
      },
      {
        type: 'check',
        title: 'You',
        detail: 'Before anything is sent',
        fields: [field('Who checks it', 'You'), field('When', 'Before anything is sent')],
      },
      {
        type: 'send',
        title: 'Team leads',
        detail: 'By email · 3 people',
        fields: [field('Who gets it', 'Team leads'), field('How', 'By email · 3 people')],
      },
    ],
    preview: {
      eyebrow: 'Report preview · September 2026',
      heading: 'Sales held steady in September.',
      body: 'Total sales were 1.2 million, up 4% on August. The north region led again. Two accounts are still waiting on invoices, so next month starts with following those up.',
      meta: '1 page · PDF · Made from 128 rows',
    },
    copy: {
      sendNote: 'This sends the report to 3 people. You can always see what was sent.',
      doneHeading: 'Your report was sent.',
      doneSummary:
        'Sent today at 09:32 to 3 team leads. Everything that happened is written down here.',
      findIt: 'You can find this report any time under My jobs.',
    },
    recipients: {
      label: 'Who gets it',
      title: 'Team leads · 3 people',
      detail: 'By email. Only these people will receive it.',
    },
    source: {
      label: 'What was read',
      title: 'September sales.xlsx',
      detail: '128 rows · Google Drive',
    },
    checkedAt: '09:31',
    sentAt: '09:32',
    record: [
      { text: 'Read September sales.xlsx from Google Drive (128 rows)', time: '09:30' },
      { text: 'Wrote a one-page report, September report.pdf', time: '09:30' },
      { text: 'You checked it, then it went by email to 3 team leads', time: '09:32' },
    ],
  },
  {
    id: 'thursday-reminder',
    name: 'Thursday task reminder',
    description: 'Every Thursday, look at the task board and remind the team in chat.',
    stage: 'done',
    group: 'running',
    status: { kind: 'done', label: 'Runs every Thursday' },
    steps: [
      {
        type: 'get',
        title: 'Task board',
        detail: 'Team tasks',
        fields: [field('Which app', 'Team tasks'), field('Which file', 'Task board')],
      },
      {
        type: 'make',
        title: 'Reminder message',
        detail: 'A short list of open tasks',
        fields: [
          field('What to make', 'Reminder message'),
          field('What it looks like', 'A short list of open tasks'),
        ],
      },
      {
        type: 'check',
        title: 'You',
        detail: 'Before anything is sent',
        fields: [field('Who checks it', 'You'), field('When', 'Before anything is sent')],
      },
      {
        type: 'send',
        title: 'Team chat',
        detail: 'Posted in #team',
        fields: [field('Who gets it', 'Team chat'), field('How', 'Posted in #team')],
      },
    ],
    preview: {
      eyebrow: 'Message preview · Thursday',
      heading: 'Four tasks are still open this week.',
      body: 'A reminder listing each open task and who has it.',
      meta: 'Chat message · Made from 12 tasks',
    },
    copy: {
      sendNote: 'This posts the reminder in team chat. You can always see what was sent.',
      doneHeading: 'Your reminder was posted.',
      doneSummary:
        'Posted today at 09:00 in team chat. Everything that happened is written down here.',
      findIt: 'You can find this reminder any time under My jobs.',
    },
    recipients: { label: 'Who gets it', title: 'Team chat', detail: 'Posted in #team.' },
    source: { label: 'What was read', title: 'Task board', detail: '12 tasks · Team tasks' },
    checkedAt: '08:59',
    sentAt: '09:00',
    record: [
      { text: 'Read the task board (12 tasks)', time: '08:58' },
      { text: 'Wrote the Thursday reminder', time: '08:58' },
      { text: 'You checked it, then it was posted in team chat', time: '09:00' },
    ],
  },
  {
    id: 'budget-approval',
    name: 'Budget approval',
    description: 'Send the budget request to Sara Ahmed for approval and tell me what she decides.',
    stage: 'check',
    group: 'running',
    status: { kind: 'waiting', label: 'Waiting for Sara' },
    steps: [
      {
        type: 'get',
        title: 'Budget request.pdf',
        detail: 'Google Drive · Finance folder',
        fields: [field('Which app', 'Google Drive'), field('Which file', 'Budget request.pdf')],
      },
      {
        type: 'make',
        title: 'Approval request',
        detail: 'A short summary to approve',
        fields: [
          field('What to make', 'Approval request'),
          field('What it looks like', 'A short summary to approve'),
        ],
      },
      {
        type: 'check',
        title: 'Sara Ahmed',
        detail: 'Approves or declines',
        fields: [field('Who checks it', 'Sara Ahmed'), field('When', 'Approves or declines')],
      },
      {
        type: 'send',
        title: 'Back to you',
        detail: 'By email',
        fields: [field('Who gets it', 'Back to you'), field('How', 'By email')],
      },
    ],
    preview: {
      eyebrow: 'Request preview',
      heading: 'Budget request for the new quarter.',
      body: 'A one-page summary of the request, ready for Sara to approve or decline.',
      meta: '1 page · PDF · Made from Budget request.pdf',
    },
    copy: {
      sendNote: 'This sends the request to Sara Ahmed. You can always see what was sent.',
      doneHeading: 'Your request was sent.',
      doneSummary: 'Sent to Sara Ahmed. Everything that happened is written down here.',
      findIt: 'You can find this request any time under My jobs.',
    },
    recipients: {
      label: 'Who gets it',
      title: 'Sara Ahmed',
      detail: 'By email, then back to you.',
    },
    source: {
      label: 'What was read',
      title: 'Budget request.pdf',
      detail: '3 pages · Google Drive',
    },
    checkedAt: '',
    sentAt: '',
    record: [],
  },
];

const NEW_JOB_STEPS: readonly JobStep[] = [
  {
    type: 'get',
    title: 'Not chosen yet',
    detail: 'Where the information comes from',
    fields: [field('Which app', '', 'Pick one of your connected apps'), field('Which file', '')],
  },
  {
    type: 'make',
    title: 'Not chosen yet',
    detail: 'A report, a message, a list',
    fields: [field('What to make', ''), field('What it looks like', '')],
  },
  {
    type: 'check',
    title: 'You',
    detail: 'Before anything is sent',
    fields: [field('Who checks it', 'You'), field('When', 'Before anything is sent')],
  },
  {
    type: 'send',
    title: 'Not chosen yet',
    detail: 'Email, chat, or a folder',
    fields: [field('Who gets it', ''), field('How', '')],
  },
];

@Injectable({ providedIn: 'root' })
export class PathwayJobs {
  private readonly state = signal<readonly PathwayJob[]>(SAMPLE_JOBS);
  private created = 0;

  readonly user: PathwayUser = {
    name: 'Lonely Mars',
    greeting: 'Good morning',
    admin: 'Sara Ahmed',
  };
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
