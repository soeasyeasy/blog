package com.blogos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "comments")
public class Comment {
    @Id
    private String id;
    private String author;
    
    @Column(length = 2000)
    private String content;
    
    private String date;
    private String avatar;

    // Self-referencing relationship for nested replies
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "parent_id")
    private List<Comment> replies = new ArrayList<>();
}