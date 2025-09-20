import { Component, OnInit } from '@angular/core';
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
  isLoading: boolean = false;
  isAddingItem: boolean = false;

  constructor(private itemService: ListItemService) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading = true;
    this.itemService.getItems().subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.isLoading = false;
        alert('Failed to load items. Please refresh the page.');
      }
    });
  }

  addItem(): void {
    // Prevent double-clicking and empty submissions
    if (!this.newItemTitle || this.newItemTitle.trim() === '' || this.isAddingItem) {
      return;
    }

    this.isAddingItem = true;
    const newItem: ListItem = { 
      id: 0, 
      title: this.newItemTitle.trim(), 
      isCompleted: false 
    };
    
    this.itemService.addItem(newItem).subscribe({
      next: (createdItem) => {
        this.newItemTitle = '';
        this.isAddingItem = false;
        // Add the new item directly to avoid full reload
        this.items.push(createdItem);
      },
      error: (error) => {
        console.error('Error adding item:', error);
        this.isAddingItem = false;
        alert('Failed to add item. Please try again.');
      }
    });
  }

  deleteItem(id: number): void {
    const itemToDelete = this.items.find(item => item.id === id);
    if (!itemToDelete) {
      alert('Item not found.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${itemToDelete.title}"?`)) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          // Remove the item directly from the array instead of reloading
          this.items = this.items.filter(item => item.id !== id);
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          alert(`Failed to delete "${itemToDelete.title}". Please try again.`);
        }
      });
    }
  }

  toggleComplete(item: ListItem): void {
    // Toggle the completion status
    const updatedItem = { ...item, isCompleted: !item.isCompleted };
    
    // Call the backend to update the item
    this.itemService.updateItem(updatedItem).subscribe({
      next: (updated) => {
        const index = this.items.findIndex(i => i.id === item.id);
        if (index >= 0) {
          this.items[index] = updated;
        }
      },
      error: (error) => {
        console.error('Error updating item:', error);
        alert('Failed to update item. Please try again.');
      }
    });
  }

  getCompletedCount(): number {
    return this.items.filter(item => item.isCompleted).length;
  }

  getActiveCount(): number {
    return this.items.filter(item => !item.isCompleted).length;
  }

  clearCompleted(): void {
    const completedItems = this.items.filter(item => item.isCompleted);
    if (completedItems.length === 0) return;

    if (confirm(`Delete ${completedItems.length} completed item(s)?`)) {
      completedItems.forEach(item => {
        this.itemService.deleteItem(item.id).subscribe({
          next: () => {
            this.items = this.items.filter(i => i.id !== item.id);
          },
          error: (error) => {
            console.error('Error deleting completed item:', error);
            alert('Failed to delete some completed items. Please try again.');
          }
        });
      });
    }
  }

  trackByFn(index: number, item: ListItem): number {
    return item.id;
  }
}
