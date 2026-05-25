import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  currentTask: Task = { title: '', description: '', completed: false };
  isEditing: boolean = false;

  // Paginado
  currentPage: number = 1;
  pageSize: number = 5; // Cantidad de tareas por página

  isLoading: boolean = true;
  connectionError: boolean = false;

  // Modal de eliminación
  showDeleteModal: boolean = false;
  taskToDeleteId: number | undefined = undefined;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.connectionError = false;

    this.taskService.getTasks().subscribe({
      next: (data: Task[]) => {
        this.tasks = data;
        this.isLoading = false;
        // Si eliminamos la última tarea de la página actual, retrocedemos una
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
      },
      error: (err: any) => {
        console.error('Error al cargar las tareas', err);
        this.isLoading = false;
        this.connectionError = true;
      }
    });
  }

  get paginatedTasks(): Task[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.tasks.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.tasks.length / this.pageSize);
  }

  saveTask(): void {
    if (this.isEditing && this.currentTask.id) {
      this.taskService.updateTask(this.currentTask.id, this.currentTask).subscribe({
        next: () => { this.loadTasks(); this.resetForm(); },
        error: (err: any) => console.error('Error al actualizar', err)
      });
    } else {
      this.taskService.createTask(this.currentTask).subscribe({
        next: () => { this.loadTasks(); this.resetForm(); },
        error: (err: any) => console.error('Error al crear', err)
      });
    }
  }

  editTask(task: Task): void {
    this.currentTask = { ...task };
    this.isEditing = true;
  }

  deleteTask(): void {
    if (this.taskToDeleteId) {
      this.taskService.deleteTask(this.taskToDeleteId).subscribe({
        next: () => {
          this.loadTasks();
          this.closeDeleteModal();
        },
        error: (err: any) => console.error('Error al eliminar', err)
      });
    }
  }

  toggleComplete(task: Task): void {
    if (task.id) {
      const updatedTask = { ...task, completed: !task.completed };
      this.taskService.updateTask(task.id, updatedTask).subscribe({
        next: () => this.loadTasks(),
        error: (err: any) => console.error('Error al actualizar estado', err)
      });
    }
  }

  resetForm(): void {
    this.currentTask = { title: '', description: '', completed: false };
    this.isEditing = false;
  }

  // Controles de Paginado
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // Controles del Modal
  confirmDelete(id: number | undefined): void {
    this.taskToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.taskToDeleteId = undefined;
  }
}
