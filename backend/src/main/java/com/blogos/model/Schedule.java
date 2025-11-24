package com.blogos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "schedules")
public class Schedule {
    @Id
    private String id;
    private String title;
    private String time;
    private String date;
    private String description;
}