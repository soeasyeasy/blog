package com.blogos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "todos")
public class Todo {
    @Id
    private String id;
    private String text;
    private boolean completed;
    private String priority; // low, medium, high
    private String date;
}