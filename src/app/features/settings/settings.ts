import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PreviewStore } from '../../preview/preview-store';
import { DEFAULT_PREFERENCES } from '../../preview/preview-data';
import { PageHeading } from '../../shared/page-heading';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-settings',
  imports: [FormsModule, RouterLink, PageHeading, Modal],
  templateUrl: './settings.html',
})
export class Settings {
  readonly store = inject(PreviewStore);
  private readonly route = inject(ActivatedRoute);
  readonly tab = signal(
    this.route.snapshot.queryParamMap.get('section') === 'security' ? 'security' : 'workspace',
  );
  readonly tabs = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Sign-in & security' },
    { id: 'notifications', label: 'Notifications' },
  ];
  readonly saved = viewChild.required<Modal>('saved');
  readonly error = signal('');
  form = { ...DEFAULT_PREFERENCES };
  constructor() {
    effect(() => {
      this.form = { ...this.store.preferences() };
    });
  }
  save() {
    if (
      !this.form.workspace.trim() ||
      !this.form.displayName.trim() ||
      this.form.workspace.length > 80 ||
      this.form.displayName.length > 80
    ) {
      this.error.set('Please enter a workspace name and display name, each up to 80 characters.');
      return;
    }
    this.error.set('');
    this.store.setPreferences({
      ...this.form,
      workspace: this.form.workspace.trim(),
      displayName: this.form.displayName.trim(),
    });
    this.saved().open();
  }
}
