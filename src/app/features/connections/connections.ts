import { Component, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewStore } from '../../preview/preview-store';
import { CONNECTIONS } from '../../preview/preview-data';
import { PageHeading } from '../../shared/page-heading';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-connections',
  imports: [RouterLink, PageHeading, Modal],
  templateUrl: './connections.html',
})
export class Connections {
  readonly store = inject(PreviewStore);
  readonly apps = CONNECTIONS;
  readonly selected = signal(CONNECTIONS[0]);
  readonly access = viewChild.required<Modal>('access');
  readonly feedback = signal('');
  show(app: (typeof CONNECTIONS)[number]) {
    this.selected.set(app);
    this.feedback.set('');
    this.access().open();
  }
  connect() {
    this.store.connect(this.selected().id);
    this.feedback.set(
      'Connection preview updated. No account was connected and no files were accessed.',
    );
  }
  action(id: string, name: string) {
    const status = this.store.connections()[id];
    return status === 'Connected'
      ? 'View access'
      : status === 'Sign in again'
        ? `Reconnect ${name}`
        : id === 'custom'
          ? 'Custom connection'
          : `Connect ${name}`;
  }
}
