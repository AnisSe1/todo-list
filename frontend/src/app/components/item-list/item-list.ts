import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListItemService } from '../../services/item.service';
import { ListItem } from '../../models/list-item';

@Component({
  selector: 'app-item-list',
  imports: [FormsModule, CommonModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css'
})
export class ItemList implements OnInit {
  items: ListItem[] = [];
  newItemTitle: string = '';
 
  constructor(private itemService: ListItemService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getItems().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  addItem(): void {
    if (!this.newItemTitle.trim()) return;

    const newItem: ListItem = { 
      id: 0,  
      title: this.newItemTitle.trim(), 
      isCompleted: false 
    };

    // Add item to UI immediately for better user experience
    this.items.push(newItem);
    const tempItemIndex = this.items.length - 1;
    this.newItemTitle = '';
    this.cdr.detectChanges();

    this.itemService.addItem(newItem).subscribe({
      next: (createdItem) => {
        this.items[tempItemIndex] = createdItem;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding item:', error);
        this.items.splice(tempItemIndex, 1);
        this.cdr.detectChanges();
      }
    });
  }

  deleteItem(id: number): void {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    this.items = this.items.filter(item => item.id !== id);
    this.cdr.detectChanges();
    
    if (id > 0) {
      this.itemService.deleteItem(id).subscribe();
    }
  }

  toggleComplete(item: ListItem): void {
    item.isCompleted = !item.isCompleted;
    this.cdr.detectChanges();
    
    if (item.id > 0) {
      this.itemService.updateItem(item).subscribe();
    }
  }

  getCompletedCount(): number {
    return this.items.filter(item => item.isCompleted).length;
  }

  getActiveCount(): number {
    return this.items.filter(item => !item.isCompleted).length;
  }

  clearCompleted(): void {
    const completedItems = this.items.filter(item => item.isCompleted);
    if (!completedItems.length) return;

    if (!confirm(`Delete ${completedItems.length} completed item(s)?`)) return;

    this.items = this.items.filter(item => !item.isCompleted);
    this.cdr.detectChanges();
    
    completedItems
      .filter(item => item.id > 0)
      .forEach(item => this.itemService.deleteItem(item.id).subscribe());
  }

  trackByFn(index: number, item: ListItem): number {
    return item.id;
  }
}
