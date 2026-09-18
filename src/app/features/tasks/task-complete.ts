import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PreviewStore } from '../../preview/preview-store';
import { PageHeading } from '../../shared/page-heading';
import { NotFound } from '../../shared/not-found';
@Component({
  selector: 'app-task-complete',
  imports: [RouterLink, PageHeading, NotFound],
  template: ` @if (task(); as task) {
      @if (task.status === 'complete') {
        <div class="stack">
          <app-page-heading
            [breadcrumb]="task.name + ' / Complete'"
            title="Your report preview is complete."
            description="Everything is recorded here, so you can see what happened and what comes next."
          />
          <section class="notice stack-small">
            <p class="eyebrow accent">Sharing preview complete</p>
            <h2>Ready for your {{ task.recipient.toLowerCase() }}.</h2>
            <p>
              {{ task.period }} report.pdf
              {{ task.output === 'Report + presentation' ? 'and Team update.pptx' : '' }} would be
              sent after your approval.
            </p>
            <p class="eyebrow accent">
              Next report: {{ task.schedule }} · {{ store.preferences().timezone }}
            </p>
          </section>
          <h2 class="section-title">What happened</h2>
          <div class="task-row">
            <span class="row-title">1 &nbsp; Your spreadsheet was selected</span
            ><span class="row-detail">{{ task.source }}</span
            ><span class="row-status">{{ task.document }}</span>
          </div>
          <div class="task-row">
            <span class="row-title">2 &nbsp; You reviewed a sample preview</span
            ><span class="row-detail">{{ task.period }}</span
            ><span class="row-status">{{ task.output }}</span>
          </div>
          <div class="task-row">
            <span class="row-title">3 &nbsp; You tried the approval step</span
            ><span class="row-detail">Preview workspace</span
            ><span class="row-status">Nothing was sent</span>
          </div>
          <div class="actions">
            <a class="button" routerLink="/tasks">View my tasks</a
            ><a class="button secondary" [routerLink]="['/tasks', task.id, 'setup']"
              >Edit this task</a
            >
          </div>
        </div>
      } @else {
        <section class="panel empty">
          <h1>Review this task first.</h1>
          <p class="muted">You’re in control of the next step.</p>
          <a
            class="button"
            [routerLink]="['/tasks', task.id, task.status === 'draft' ? 'setup' : 'review']"
            >Continue this task</a
          >
        </section>
      }
    } @else if (store.ready()) {
      <app-not-found />
    } @else {
      <p role="status">Opening your task…</p>
    }`,
})
export class TaskComplete {
  readonly store = inject(PreviewStore);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly task = computed(() => this.store.tasks().find((t) => t.id === this.params().get('id')));
}
