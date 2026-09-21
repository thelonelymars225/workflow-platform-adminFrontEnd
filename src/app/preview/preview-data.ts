export type TaskKind = 'report' | 'update' | 'approval';
export type TaskStatus = 'draft' | 'review' | 'scheduled' | 'complete' | 'waiting';
export interface PreviewTask {
  id: string;
  kind: TaskKind;
  name: string;
  source: string;
  document: string;
  output: string;
  period: string;
  recipient: string;
  schedule: string;
  dueDate: string;
  status: TaskStatus;
}
export interface Preferences {
  workspace: string;
  displayName: string;
  timezone: string;
  reminders: boolean;
}
export interface Member {
  name: string;
  email: string;
  role: string;
  status: string;
}
export const DEFAULT_PREFERENCES: Preferences = {
  workspace: 'Mars workspace',
  displayName: 'Lonely Mars',
  timezone: 'Asia/Riyadh',
  reminders: true,
};
export const TASK_KINDS: TaskKind[] = ['report', 'update', 'approval'];
export const TASK_COPY = {
  report: {
    category: 'From your files',
    title: 'Prepare a report',
    description: 'Turn your spreadsheet into a clear report, ready to review and share.',
    action: 'Start a report',
    heading: 'Your report, in three clear steps.',
    guidance: 'Choose your files, what you’d like to create, and a time that suits you.',
    steps: ['Choose your files', 'Choose the result', 'Choose a time'],
    preview: 'Create my preview',
    reviewTitle: 'Take a look before you share.',
    reviewGuidance: 'Check the report and who will receive it. You can still make changes.',
    confirm: 'Approve & send',
  },
  update: {
    category: 'For your team',
    title: 'Send a team update',
    description: 'Bring progress together in one short update, without starting from scratch.',
    action: 'Start an update',
    heading: 'Keep your team in the loop.',
    guidance: 'Choose the project, where to share, and a regular time. You’ll preview it first.',
    steps: ['Choose a project', 'Choose the update', 'Choose a time'],
    preview: 'Preview team update',
    reviewTitle: 'A clear update, ready for your team.',
    reviewGuidance: 'Check the message and channel before turning on your weekly update.',
    confirm: 'Turn on weekly update',
  },
  approval: {
    category: 'For a decision',
    title: 'Get an approval',
    description: 'Share a document with the right person and keep their decision in one place.',
    action: 'Start a request',
    heading: 'Ask for a clear decision.',
    guidance:
      'Choose the document, the reviewer, and a due date. We’ll keep the decision with your task.',
    steps: ['Choose a document', 'Choose a reviewer', 'Choose a due date'],
    preview: 'Review request',
    reviewTitle: 'Ready to ask for a decision.',
    reviewGuidance: 'Check the document, reviewer, and due date before sending.',
    confirm: 'Send approval request',
  },
} satisfies Record<
  TaskKind,
  {
    category: string;
    title: string;
    description: string;
    action: string;
    heading: string;
    guidance: string;
    steps: string[];
    preview: string;
    reviewTitle: string;
    reviewGuidance: string;
    confirm: string;
  }
>;

export function newTask(kind: TaskKind, id: string): PreviewTask {
  return {
    id,
    kind,
    name:
      kind === 'report'
        ? 'Monthly team report'
        : kind === 'update'
          ? 'Weekly project update'
          : 'Budget request',
    source: kind === 'update' ? 'Notion' : 'Google Drive',
    document:
      kind === 'report'
        ? 'September actuals.xlsx'
        : kind === 'update'
          ? 'Platform delivery'
          : 'Budget request.pdf',
    output:
      kind === 'report'
        ? 'Report + presentation'
        : kind === 'update'
          ? 'Weekly team summary'
          : 'Approve a document',
    period: 'September 2026',
    recipient:
      kind === 'report' ? 'Team leads' : kind === 'update' ? '#project-updates' : 'Sara Ahmed',
    schedule:
      kind === 'report'
        ? 'Monthly · 1st at 09:00'
        : kind === 'update'
          ? 'Every Thursday · 16:00'
          : 'When I confirm',
    dueDate: '2026-09-24',
    status: 'draft',
  };
}
export function sampleTasks(): PreviewTask[] {
  return [
    { ...newTask('report', 'report'), status: 'review' },
    { ...newTask('update', 'update'), status: 'scheduled' },
    { ...newTask('approval', 'approval'), status: 'waiting' },
    { ...newTask('report', 'finance'), name: 'Quarterly finance summary', period: 'Q3 2026' },
  ];
}
export const SAMPLE_MEMBERS: Member[] = [
  { name: 'Lonely Mars', email: 'mars@example.com', role: 'Owner', status: 'Active' },
  { name: 'Sara Ahmed', email: 'sara@example.com', role: 'Administrator', status: 'Active' },
  { name: 'Omar Khalid', email: 'omar@example.com', role: 'Member', status: 'Active' },
  { name: 'Noor Ali', email: 'noor@example.com', role: 'Viewer', status: 'Invitation pending' },
];
export const CONNECTIONS = [
  {
    id: 'drive',
    name: 'Google Drive',
    category: 'Files',
    description: 'Use selected folders and save the reports you create.',
    status: 'Connected',
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    category: 'Spreadsheets',
    description: 'Prepare reports from the spreadsheets your team already uses.',
    status: 'Connected',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Messages',
    description: 'Your saved updates are safe. Sign in again when you’re ready.',
    status: 'Sign in again',
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    category: 'Email & files',
    description: 'Use Outlook and OneDrive for your reports and sharing.',
    status: 'Optional',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Project notes',
    description: 'Bring project progress and notes into a team update.',
    status: 'Optional',
  },
  {
    id: 'custom',
    name: 'Another app',
    category: 'More options',
    description: 'Connect a custom app with help from your workspace administrator.',
    status: 'Optional',
  },
];
export function taskPath(task: PreviewTask): string[] {
  return [
    '/tasks',
    task.id,
    task.status === 'draft'
      ? 'setup'
      : task.status === 'complete'
        ? 'complete'
        : task.status === 'scheduled'
          ? 'setup'
          : 'review',
  ];
}
export function taskAction(task: PreviewTask): string {
  switch (task.status) {
    case 'draft':
      return 'Continue setup';
    case 'review':
      return task.kind === 'report' ? 'Review report' : 'Review preview';
    case 'scheduled':
      return 'View schedule';
    case 'complete':
      return 'See latest report';
    case 'waiting':
      return `Waiting for ${task.recipient.split(' ')[0]}`;
  }
}
