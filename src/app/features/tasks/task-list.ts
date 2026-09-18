import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewStore } from '../../preview/preview-store';
import { taskAction, taskPath } from '../../preview/preview-data';
import { PageHeading } from '../../shared/page-heading';
@Component({
  selector: 'app-task-list',
  imports: [RouterLink, PageHeading],
  template: ` <div class="stack">
    <app-page-heading
      [breadcrumb]="store.preferences().workspace + ' / My tasks'"
      title="Your tasks, taken care of."
      description="See what’s ready, what’s coming up, and where you left off."
    />
    <div class="toolbar">
      <div class="tabs" aria-label="Filter tasks">
        @for (tab of tabs; track tab.id) {
          <button [attr.aria-pressed]="filter() === tab.id" (click)="filter.set(tab.id)">
            {{ tab.label }} ({{ count(tab.id) }})
          </button>
        }
      </div>
      <a class="button" routerLink="/start">+ Start a task</a>
    </div>
    <section class="stack" aria-label="Your tasks" aria-live="polite">
      @for (task of visible(); track task.id) {
        <a class="task-row" [routerLink]="path(task)"
          ><span class="row-title">{{ task.name }}</span
          ><span class="row-detail">{{
            task.status === 'draft'
              ? 'Draft · Saved in this browser'
              : task.kind === 'approval'
                ? 'Due ' + task.dueDate
                : task.schedule
          }}</span
          ><span class="row-status">{{ action(task) }} →</span></a
        >
      } @empty {
        <div class="panel empty">
          <h2>{{ filter() === 'review' ? 'You’re all caught up.' : 'No saved drafts yet.' }}</h2>
          <p class="muted">Choose a task whenever you’re ready.</p>
          <a class="button secondary" routerLink="/start">Choose a task</a>
        </div>
      }
    </section>
    <p class="muted">You can change a schedule, a connection, or a result at any time.</p>
    <a class="text-button" routerLink="/workflows">Open workflows saved to your workspace →</a>
  </div>`,
})
export class TaskList {
  readonly store = inject(PreviewStore);
  readonly filter = signal('all');
  readonly tabs = [
    { id: 'all', label: 'My tasks' },
    { id: 'review', label: 'Waiting for me' },
    { id: 'draft', label: 'Saved drafts' },
  ];
  readonly visible = computed(() =>
    this.store.tasks().filter((t) => this.filter() === 'all' || t.status === this.filter()),
  );
  readonly path = taskPath;
  readonly action = taskAction;
  count(id: string) {
    return this.store.tasks().filter((t) => id === 'all' || t.status === id).length;
  }
}
