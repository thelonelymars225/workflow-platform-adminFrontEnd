import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PreviewStore } from '../../preview/preview-store';
import { TASK_COPY, TASK_KINDS, taskAction, TaskKind, taskPath } from '../../preview/preview-data';
import { PageHeading } from '../../shared/page-heading';
@Component({ selector: 'app-home', imports: [RouterLink, PageHeading], templateUrl: './home.html' })
export class Home {
  readonly store = inject(PreviewStore);
  private readonly router = inject(Router);
  readonly kinds = TASK_KINDS;
  readonly copy = TASK_COPY;
  readonly path = taskPath;
  readonly action = taskAction;
  start(kind: TaskKind) {
    const task = this.store.create(kind);
    void this.router.navigate(['/tasks', task.id, 'setup']);
  }
}
