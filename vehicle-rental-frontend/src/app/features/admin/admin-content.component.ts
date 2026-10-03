import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Content } from '../../core/models';
import { ContentService } from '../../core/services/content.service';
import { ToastService } from '../../core/services/toast.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { AsyncState } from '../../shared/utils/async-state';
import { StarsComponent } from '../content/stars.component';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [SpinnerComponent, ErrorStateComponent, EmptyStateComponent, ConfirmDialogComponent, StarsComponent],
  template: `
    <div class="page-head"><div><h1>Feedback &amp; content</h1><p>Messages submitted through the website.</p></div></div>

    @if (state.loading()) {
      <app-spinner />
    } @else if (state.error()) {
      <app-error-state [message]="state.error()!" (retry)="load()" />
    } @else if (!state.data()?.length) {
      <app-empty-state icon="💬" title="Nothing submitted yet" />
    } @else {
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Type</th><th>From</th><th>Rating</th><th>Message</th><th></th></tr></thead>
          <tbody>
            @for (c of state.data()!; track c.id) {
              <tr>
                <td>{{ c.id }}</td>
                <td><span class="chip">{{ c.type }}</span></td>
                <td>{{ c.name }}<br /><span class="muted small">{{ c.email }}</span></td>
                <td><app-stars [rating]="c.rating" /></td>
                <td style="min-width: 240px">{{ c.message }}</td>
                <td class="actions"><button class="btn btn-outline btn-sm" type="button" (click)="toDelete.set(c)">Delete</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <app-confirm-dialog
      [open]="!!toDelete()"
      title="Delete this entry?"
      message="This entry will be permanently removed."
      confirmText="Delete"
      [danger]="true"
      [busy]="deleting()"
      (confirmed)="remove()"
      (cancelled)="toDelete.set(null)"
    />
  `,
})
export class AdminContentComponent {
  private readonly api = inject(ContentService);
  private readonly toast = inject(ToastService);

  protected readonly state = new AsyncState<Content[]>();
  protected readonly toDelete = signal<Content | null>(null);
  protected readonly deleting = signal(false);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.load(this.api.getAll(), 'We could not load content.');
  }

  protected remove(): void {
    const c = this.toDelete();
    if (!c) return;
    this.deleting.set(true);
    this.api
      .delete(c.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.state.data.update((list) => (list ?? []).filter((x) => x.id !== c.id));
          this.toDelete.set(null);
          this.toast.success('Entry deleted.');
        },
        error: (err) => {
          this.toDelete.set(null);
          this.toast.error(extractErrorMessage(err, 'We could not delete the entry.'));
        },
      });
  }
}
