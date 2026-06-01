package com.app.task.mapper;

import com.app.task.dto.TaskRequestDto;
import com.app.task.dto.TaskResponseDto;
import com.app.task.model.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public Task toEntity(TaskRequestDto dto) {
        if (dto == null) {
            return null;
        }
        return new Task(
                dto.getTitle(),
                dto.getDescription(),
                dto.isCompleted(),
                dto.getPriority()
        );
    }

    public TaskResponseDto toResponseDto(Task entity) {
        if (entity == null) {
            return null;
        }
        return new TaskResponseDto(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.isCompleted(),
                entity.getPriority()
        );
    }
}
