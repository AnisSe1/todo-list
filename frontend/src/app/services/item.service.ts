import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ListItem } from "../models/list-item";

@Injectable({
  providedIn: "root",
})

export class ListItemService {
    private apiUrl = "http://localhost:5299/api/listitems"; 

    constructor(private http: HttpClient) { }

    getItems(): Observable<ListItem[]> {
        return this.http.get<ListItem[]>(this.apiUrl);
    }

    addItem(item: ListItem): Observable<ListItem> {
        return this.http.post<ListItem>(this.apiUrl, item);
    }

    deleteItem(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    updateItem(item: ListItem): Observable<ListItem> {
        return this.http.put<ListItem>(`${this.apiUrl}/${item.id}`, item);
    }
}

