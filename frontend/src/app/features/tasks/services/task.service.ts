import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry } from 'rxjs';
import { Task } from '../../../core/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // private apiUrl = 'https://app-tasks-backend.onrender.com/api/tasks';
  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      retry({ count: 6, delay: 1000 })
    );
  }

  // Métodos extra preparados para futuras funcionalidades
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
