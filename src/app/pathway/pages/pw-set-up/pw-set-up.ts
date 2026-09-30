import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  Injector,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PathwayJobs } from '../../data/pathway-jobs';
import { StepType } from '../../data/pathway.models';
import { PwActionBar } from '../../shared/pw-action-bar/pw-action-bar';
import { PwButton } from '../../shared/pw-button/pw-button';
import { PwField } from '../../shared/pw-field/pw-field';
import { PwIcon } from '../../shared/pw-icon/pw-icon';
import { PwPathway } from '../../shared/pw-pathway/pw-pathway';

const NOT_CHOSEN = 'Not chosen yet';

/**
 * 03 / Set up (Step 1 of 3): job description, editable four-tile pathway and the inline
 * "You are changing the X step" editor. Saving the editor updates the tile.
 */
@Component({
  selector: 'pw-set-up',
  imports: [RouterLink, PwActionBar, PwButton, PwField, PwIcon, PwPathway],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-5' },
  templateUrl: './pw-set-up.html',
})
export class PwSetUp {
  protected readonly jobs = inject(PathwayJobs);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))),
  );
  protected readonly job = computed(() => this.jobs.job(this.id()));

  /** The Figma frame shows the Get step open, so start there. */
  protected readonly editing = signal<StepType | null>('get');
  protected readonly editingStep = computed(() => {
    const type = this.editing();
    return this.job()?.steps.find((s) => s.type === type);
  });
  /** Editor drafts reset whenever a different step is opened. */
  protected readonly draftA = linkedSignal(() => this.editingStep()?.fields[0].value ?? '');
  protected readonly draftB = linkedSignal(() => this.editingStep()?.fields[1].value ?? '');
  protected readonly announcement = signal('');
  protected readonly error = signal('');

  protected stepName(type: StepType) {
    return type[0].toUpperCase() + type.slice(1);
  }

  protected startEditing(type: StepType) {
    this.editing.set(type);
    this.error.set('');
    this.announcement.set(`Changing the ${this.stepName(type)} step.`);
    afterNextRender(
      () => document.querySelector<HTMLInputElement>('form pw-field input')?.focus(),
      {
        injector: this.injector,
      },
    );
  }

  protected closeEditor() {
    const type = this.editing();
    this.editing.set(null);
    this.announcement.set('Closed without saving.');
    if (type) this.focusTile(type);
  }

  protected save(event: Event) {
    event.preventDefault();
    const job = this.job();
    const type = this.editing();
    if (!job || !type) return;
    this.jobs.saveStep(job.id, type, [this.draftA(), this.draftB()]);
    this.editing.set(null);
    this.error.set('');
    this.announcement.set(`${this.stepName(type)} step saved.`);
    this.focusTile(type);
  }

  protected next(id: string) {
    const missing = this.job()
      ?.steps.filter((s) => s.title === NOT_CHOSEN)
      .map((s) => this.stepName(s.type));
    if (missing?.length) {
      this.error.set(`Choose the ${missing.join(', ')} step first. Tap a step to change it.`);
      return;
    }
    this.jobs.readyForCheck(id);
    void this.router.navigate(['/jobs', id, 'check']);
  }

  private focusTile(type: StepType) {
    afterNextRender(() => document.getElementById(`pw-tile-${type}`)?.focus(), {
      injector: this.injector,
    });
  }
}
