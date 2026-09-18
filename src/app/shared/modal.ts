import { Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `<dialog #dialog [attr.aria-label]="title()" (click)="dismissBackdrop($event)">
    <div class="modal-content stack">
      <h2>{{ title() }}</h2>
      <ng-content />
    </div>
  </dialog>`,
  styles: `
    dialog {
      width: min(600px, calc(100vw - 32px));
      max-height: calc(100dvh - 48px);
      margin: auto;
      border: 1px solid var(--atlas-border);
      border-radius: 16px;
      padding: 32px;
      color: var(--atlas-ink);
      background: white;
      box-shadow: 0 24px 80px #15254126;
    }
    dialog::backdrop {
      background: #15254155;
    }
    .modal-content {
      min-width: 0;
    }
    @media (max-width: 600px) {
      dialog {
        padding: 24px;
      }
    }
  `,
})
export class Modal {
  readonly title = input.required<string>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  open() {
    this.dialog().nativeElement.showModal();
  }
  close() {
    this.dialog().nativeElement.close();
  }
  dismissBackdrop(event: MouseEvent) {
    if (event.target !== this.dialog().nativeElement) return;
    const rect = this.dialog().nativeElement.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      this.close();
  }
}
