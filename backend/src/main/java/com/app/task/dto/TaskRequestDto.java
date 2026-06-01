package com.app.task.dto;

import com.app.task.model.TaskPriority;

public class TaskRequestDto {
    private String title;
    private String description;
    private boolean completed;
    private TaskPriority priority;

    public TaskRequestDto() {}

    public TaskRequestDto(String title, String description, boolean completed, TaskPriority priority) {
        this.title = title;
        this.description = description;
        this.completed = completed;
        this.priority = priority;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }
}
