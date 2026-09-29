import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

let nextId = 0;

/** Figma Field: a visible label above a 56px input, with an optional hint below. */
@Component({
  selector: 'pw-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-w-0 flex-col gap-2' },
  template: `
    <label class="font-pathway text-pw-label font-medium text-pw-ink" [attr.for]="id">{{
      label()
    }}</label>
    <input
      class="h-14 w-full min-w-0 rounded-pw-field border-2 border-pw-muted bg-pw-surface p-4 font-pathway text-pw-body text-pw-ink"
      [id]="id"
      [type]="type()"
      [attr.autocomplete]="autocomplete() || null"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-invalid]="error() ? 'true' : null"
      [class.border-pw-error]="!!error()"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
    />
    @if (error()) {
      <p class="m-0 font-pathway text-pw-label font-semibold text-pw-error" [id]="id + '-error'">
        {{ error() }}
      </p>
    }
    @if (hint()) {
      <p class="m-0 font-pathway text-pw-label font-medium text-pw-muted" [id]="id + '-hint'">
        {{ hint() }}
      </p>
    }
  `,
})
export class PwField {
  protected readonly id = `pw-field-${nextId++}`;
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly type = input('text');
  readonly autocomplete = input('');
  readonly error = input('');
  readonly value = model('');
  protected readonly describedBy = computed(
    () =>
      [this.error() && `${this.id}-error`, this.hint() && `${this.id}-hint`]
        .filter(Boolean)
        .join(' ') || null,
  );
  /** The underlying input id, for moving focus to the field. */
  get inputId() {
    return this.id;
  }
}
