/** The four steps every job is made of, in order. */
export type StepType = 'get' | 'make' | 'check' | 'send';

export const STEP_TYPES: readonly StepType[] = ['get', 'make', 'check', 'send'];

export type PwStatusKind = 'done' | 'waiting';

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
