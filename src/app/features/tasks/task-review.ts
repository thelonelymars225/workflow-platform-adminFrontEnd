import { Component, computed, inject, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PreviewStore } from '../../preview/preview-store';
import { localDateAfter, TASK_COPY } from '../../preview/preview-data';
import { PageHeading } from '../../shared/page-heading';
import { Modal } from '../../shared/modal';
import { NotFound } from '../../shared/not-found';
@Component({
  selector: 'app-task-review',
  imports: [RouterLink, DatePipe, PageHeading, Modal, NotFound],
  templateUrl: './task-review.html',
  styleUrl: './task-review.css',
})
export class TaskReview {
  readonly store = inject(PreviewStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly task = computed(() => this.store.tasks().find((t) => t.id === this.params().get('id')));
  readonly copy = TASK_COPY;
  get dueDateExpired() {
    const task = this.task();
    return task?.kind === 'approval' && task.dueDate < localDateAfter(0);
  }
  readonly confirmation = viewChild.required<Modal>('confirmation');
  readonly files = computed(() => {
    const t = this.task();
    return t?.kind === 'report'
      ? `${t.period} report.pdf${t.output === 'Report + presentation' ? ' + Team update.pptx' : ''}`
      : (t?.document ?? '');
  });
  confirm() {
    const task = this.task();
    if (!task || task.status !== 'review' || this.dueDateExpired) return;
    this.store.save({
      ...task,
      status:
        task.kind === 'report' ? 'complete' : task.kind === 'update' ? 'scheduled' : 'waiting',
    });
    if (task.kind === 'report') void this.router.navigate(['/tasks', task.id, 'complete']);
    else this.confirmation().open();
  }
}
