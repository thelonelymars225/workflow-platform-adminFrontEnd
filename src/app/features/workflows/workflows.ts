import { afterNextRender, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Workflow, WorkflowApi } from '../../workflow-api';

@Component({
  selector: 'app-workflows',
  imports: [FormsModule, DatePipe],
  templateUrl: './workflows.html',
  styles: ':host { display: block; }',
})
export class Workflows {
  private readonly api = inject(WorkflowApi);
  readonly workflows = signal<Workflow[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly formError = signal('');
  readonly success = signal('');
  readonly health = signal('Checking API…');
  name = '';
  description = '';

  constructor() {
    // SSR/prerender renders a stable shell; only the hydrated browser calls the dev proxy.
    afterNextRender(() => this.reload());
  }

  reload() {
    this.loading.set(true);
    this.loadError.set('');
    this.api.health().subscribe({
      next: () => this.health.set('API connected'),
      error: () => this.health.set('API unavailable'),
    });
    this.api
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (rows) => this.workflows.set(rows),
        error: () =>
          this.loadError.set(
            'Could not load workflows. Check that the API and PostgreSQL are running, then retry.',
          ),
      });
  }

  create() {
    if (this.saving()) return;
    this.formError.set('');
    this.success.set('');
    const name = this.name.trim();
    if (!name || name.length > 200 || this.description.length > 2000) {
      this.formError.set(
        'Enter a name of 1–200 characters and a description of at most 2,000 characters.',
      );
      return;
    }
    this.saving.set(true);
    this.api
      .create({ name, description: this.description.trim() || null })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.name = '';
          this.description = '';
          this.success.set('Workflow created.');
          this.reload();
        },
        error: (error: HttpErrorResponse) =>
          this.formError.set(
            error.status === 400
              ? 'The API rejected this workflow. Check the name and description and try again.'
              : 'Could not create workflow. Check the API and PostgreSQL, then retry. Your entries are kept.',
          ),
      });
  }
}
