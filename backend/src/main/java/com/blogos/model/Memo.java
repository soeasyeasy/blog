package com.blogos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "memos")
public class Memo {
    @Id
    private String id;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private String date;

    @ElementCollection
    @CollectionTable(name = "memo_images", joinColumns = @JoinColumn(name = "memo_id"))
    @Column(name = "image_url")
    private List<String> images;

    @ElementCollection
    @CollectionTable(name = "memo_tags", joinColumns = @JoinColumn(name = "memo_id"))
    @Column(name = "tag")
    private List<String> tags;
}