import { Component, signal } from '@angular/core';
import { ItemList } from './components/item-list/item-list';

@Component({
  selector: 'app-root',
  imports: [ItemList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('todo-frontend');
}
