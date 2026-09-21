import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `<section class="panel empty">
    <h1>Let’s get you back on track.</h1>
    <p class="muted">This page isn’t available. Your saved tasks are still here.</p>
    <a class="button" routerLink="/start">Back to Start here</a>
  </section>`,
})
export class NotFound {}
