package com.blogos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "posts")
public class Post {
    @Id
    private String id;

    private String title;

    @Column(length = 1000)
    private String excerpt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private String coverImage;
    private String date;
    private String category;
    private String author;
    
    private boolean featured;
    private int likes;

    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "post_id")
    private List<Comment> comments = new ArrayList<>();
}