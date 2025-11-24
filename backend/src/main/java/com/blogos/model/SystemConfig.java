package com.blogos.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "system_config")
public class SystemConfig {
    @Id
    private String id = "default";

    // Stores the entire SiteConfig JSON object from frontend
    @Lob
    @Column(columnDefinition = "TEXT")
    private String configJson;
}