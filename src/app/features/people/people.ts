import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PreviewStore } from '../../preview/preview-store';
import { PageHeading } from '../../shared/page-heading';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-people',
  imports: [FormsModule, RouterLink, PageHeading, Modal],
  templateUrl: './people.html',
})
export class People {
  readonly store = inject(PreviewStore);
  readonly tab = signal('People');
  readonly tabs = ['People', 'Access rules', 'Recent changes'];
  readonly invitation = viewChild.required<Modal>('invitation');
  readonly error = signal('');
  readonly feedback = signal('');
  email = '';
  role = 'Viewer';
  readonly roles = [
    { name: 'Owner', description: 'Manages the workspace and its administrators.' },
    { name: 'Administrator', description: 'Manages people, app access, and workspace settings.' },
    { name: 'Member', description: 'Creates tasks and reviews their results.' },
    { name: 'Viewer', description: 'Views shared tasks and their results.' },
  ];
  initials(name: string) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
  open() {
    this.error.set('');
    this.invitation().open();
  }
  invite(form: NgForm) {
    if (form.invalid || !this.email.trim()) {
      this.error.set('Enter a valid work email so the invitation has somewhere to go.');
      return;
    }
    if (!this.store.invite(this.email.trim(), this.role)) {
      this.error.set('This person is already in the sample workspace.');
      return;
    }
    this.feedback.set('Invitation preview saved. No email was sent.');
    this.error.set('');
    this.email = '';
    this.role = 'Viewer';
    this.invitation().close();
    form.resetForm({ email: '', role: 'Viewer' });
  }
}
