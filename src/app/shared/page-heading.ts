import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-heading',
  template: `<header class="heading">
    <p class="eyebrow muted">{{ breadcrumb() }}</p>
    <h1 tabindex="-1">{{ title() }}</h1>
    <p class="description">{{ description() }}</p>
  </header>`,
  styles: `
    .heading {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 124px;
      padding: 8px 0;
    }
    .description {
      font-size: 18px;
      color: var(--atlas-muted);
    }
    @media (max-width: 600px) {
      .heading {
        min-height: 0;
      }
    }
  `,
})
export class PageHeading {
  readonly breadcrumb = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
