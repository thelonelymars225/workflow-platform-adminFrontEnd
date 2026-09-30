import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

let nextId = 0;

/** Figma Field: a visible label above a 56px input, with an optional hint below. */
@Component({
  selector: 'pw-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-w-0 flex-col gap-2' },
  templateUrl: './pw-field.html',
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
