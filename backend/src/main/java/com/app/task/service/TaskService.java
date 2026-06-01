package com.app.task.service;

import com.app.task.dto.TaskRequestDto;
import com.app.task.dto.TaskResponseDto;
import com.app.task.exception.TaskNotFoundException;
import com.app.task.mapper.TaskMapper;
import com.app.task.model.Task;
import com.app.task.repository.ITaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final ITaskRepository taskRepository;
    private final TaskMapper taskMapper;

    // Inyección por constructor
    public TaskService(ITaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public List<TaskResponseDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public TaskResponseDto createTask(TaskRequestDto taskRequestDto) {
        Task task = taskMapper.toEntity(taskRequestDto);
        Task savedTask = taskRepository.save(task);
        return taskMapper.toResponseDto(savedTask);
    }

    public TaskResponseDto updateTask(Long id, TaskRequestDto taskDetails) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setCompleted(taskDetails.isCompleted());
            task.setPriority(taskDetails.getPriority());
            Task updatedTask = taskRepository.save(task);
            return taskMapper.toResponseDto(updatedTask);
        }).orElseThrow(() -> new TaskNotFoundException("Tarea no encontrada con id: " + id));
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException("Tarea no encontrada con id: " + id);
        }
        taskRepository.deleteById(id);
    }
}
