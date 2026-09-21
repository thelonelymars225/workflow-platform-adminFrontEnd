import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-heading',
  template: `<header class="heading flex flex-col gap-2.5 py-2">
    <p class="eyebrow muted">{{ breadcrumb() }}</p>
    <h1 tabindex="-1">{{ title() }}</h1>
    <p class="text-body text-muted">{{ description() }}</p>
  </header>`,
  styles: `
    .heading {
      min-height: 124px;
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
