package com.app.task.service;

import com.app.task.dto.TaskRequestDto;
import com.app.task.exception.TaskNotFoundException;
import com.app.task.mapper.TaskMapper;
import com.app.task.repository.ITaskRepository;
import com.app.task.model.TaskPriority;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {

    @Mock
    private ITaskRepository taskRepository;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskService taskService;

    @Test
    public void updateTask_shouldThrowException_whenTaskNotFound() {
        // Arrange
        Long taskId = 1L;
        TaskRequestDto taskDetails = new TaskRequestDto("Title", "Description", false, TaskPriority.MEDIUM);
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(TaskNotFoundException.class, () -> {
            taskService.updateTask(taskId, taskDetails);
        });
    }
}
