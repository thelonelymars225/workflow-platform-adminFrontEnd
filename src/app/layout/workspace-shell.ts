import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PreviewStore } from '../preview/preview-store';
import { Modal } from '../shared/modal';

@Component({
  selector: 'app-workspace-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Modal],
  templateUrl: './workspace-shell.html',
  styleUrl: './workspace-shell.css',
})
export class WorkspaceShell {
  readonly store = inject(PreviewStore);
  readonly router = inject(Router);
  readonly menuOpen = signal(false);
  readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  readonly nav = [
    { path: '/start', label: 'Start here' },
    { path: '/tasks', label: 'My tasks' },
    { path: '/connections', label: 'Connected apps' },
    { path: '/people', label: 'People' },
    { path: '/settings', label: 'Settings' },
  ];
  private hydrated = false;
  constructor() {
    afterNextRender(() => {
      this.hydrated = true;
    });
  }
  activated() {
    this.menuOpen.set(false);
    if (this.hydrated) this.main().nativeElement.focus({ preventScroll: true });
  }
}
