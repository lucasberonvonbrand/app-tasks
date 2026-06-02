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
  currentTask: Task = { title: '', description: '', completed: false, priority: 'MEDIUM' };
  isEditing: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;

  // Filtro
  currentFilter: 'ALL' | 'PENDING' | 'COMPLETED' = 'ALL';
  currentPriorityFilter: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' = 'ALL';

  // Paginado
  currentPage: number = 1;
  pageSize: number = 4;

  isLoading: boolean = true;
  connectionError: boolean = false;

  // Modal de eliminación
  showDeleteModal: boolean = false;
  taskToDeleteId: number | undefined = undefined;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }
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

  get filteredTasks(): Task[] {
    let filtered = this.tasks;

    if (this.currentFilter === 'PENDING') filtered = filtered.filter(t => !t.completed);
    if (this.currentFilter === 'COMPLETED') filtered = filtered.filter(t => t.completed);

    if (this.currentPriorityFilter !== 'ALL') {
      filtered = filtered.filter(t => (t.priority || 'MEDIUM') === this.currentPriorityFilter);
    }

    return filtered;
  }

  get paginatedTasks(): Task[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredTasks.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTasks.length / this.pageSize);
  }

  setFilter(filter: 'ALL' | 'PENDING' | 'COMPLETED'): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Volver a la página 1 al filtrar
  }

  setPriorityFilter(filter: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'): void {
    this.currentPriorityFilter = filter;
    this.currentPage = 1;
  }

  saveTask(): void {
    this.isSaving = true;
    if (this.isEditing && this.currentTask.id) {
      this.taskService.updateTask(this.currentTask.id, this.currentTask).subscribe({
        next: () => {
          this.loadTasks(false);
          this.resetForm();
          this.isSaving = false;
        },
        error: (err: any) => { console.error('Error al actualizar', err); this.isSaving = false; }
      });
    } else {
      this.taskService.createTask(this.currentTask).subscribe({
        next: () => {
          this.loadTasks(false);
          this.resetForm();
          this.isSaving = false;
        },
        error: (err: any) => { console.error('Error al crear', err); this.isSaving = false; }
      });
    }
  }

  editTask(task: Task): void {
    this.currentTask = { ...task };
    this.isEditing = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteTask(): void {
    if (this.taskToDeleteId) {
      this.isDeleting = true;
      this.taskService.deleteTask(this.taskToDeleteId).subscribe({
        next: () => {
          this.loadTasks(false);
          this.closeDeleteModal();
          this.isDeleting = false;
        },
        error: (err: any) => { console.error('Error al eliminar', err); this.isDeleting = false; }
      });
    }
  }

  toggleComplete(task: Task): void {
    if (task.id) {
      const updatedTask = { ...task, completed: !task.completed };
      this.taskService.updateTask(task.id, updatedTask).subscribe({
        next: () => this.loadTasks(false),
        error: (err: any) => console.error('Error al actualizar estado', err)
      });
    }
  }

  resetForm(): void {
    this.currentTask = { title: '', description: '', completed: false, priority: 'MEDIUM' };
    this.isEditing = false;
  }

  // Controles de Paginado
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Controles del Modal
  confirmDelete(id: number | undefined): void {
    this.taskToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.taskToDeleteId = undefined;
    this.isDeleting = false;
  }

  // Optimización de renderizado para evitar saltos en la vista
  trackByTaskId(index: number, task: Task): number | undefined {
    return task.id;
  }
}
