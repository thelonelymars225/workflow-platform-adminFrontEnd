import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PreviewStore } from '../../preview/preview-store';
import { localDateAfter, PreviewTask, TASK_COPY } from '../../preview/preview-data';
import { PageHeading } from '../../shared/page-heading';
import { Modal } from '../../shared/modal';
import { NotFound } from '../../shared/not-found';

@Component({
  selector: 'app-task-setup',
  imports: [FormsModule, RouterLink, PageHeading, Modal, NotFound],
  templateUrl: './task-setup.html',
  styles: '.step { min-height:414px; } @media(max-width:900px) { .step { min-height:0; } }',
})
export class TaskSetup {
  readonly store = inject(PreviewStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly task = computed(() => this.store.tasks().find((t) => t.id === this.params().get('id')));
  readonly copy = TASK_COPY;
  get earliestDueDate() {
    return localDateAfter(0);
  }
  readonly saved = viewChild.required<Modal>('saved');
  readonly error = signal('');
  form?: PreviewTask;
  constructor() {
    effect(() => {
      const task = this.task();
      this.form = task ? { ...task } : undefined;
    });
  }
  save(preview: boolean, form: NgForm) {
    const task = this.form;
    if (!task || !this.store.ready()) return;
    if (task.kind === 'approval' && task.dueDate < this.earliestDueDate) {
      this.error.set('Choose a due date today or later before reviewing the request.');
      form.form.markAllAsTouched();
      return;
    }
    if (
      form.invalid ||
      !task.document.trim() ||
      !task.recipient.trim() ||
      (task.kind === 'report' && !task.period.trim())
    ) {
      this.error.set('Please complete the highlighted fields so we can prepare your preview.');
      form.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.store.save({
      ...task,
      document: task.document.trim(),
      recipient: task.recipient.trim(),
      period: task.period.trim(),
      status: preview ? 'review' : 'draft',
    });
    if (preview) void this.router.navigate(['/tasks', task.id, 'review']);
    else this.saved().open();
  }
}
