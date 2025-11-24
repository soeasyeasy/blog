package com.blogos.repository;

import com.blogos.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {
    
    @Modifying
    @Query("UPDATE Post p SET p.featured = false WHERE p.featured = true")
    void clearAllFeatured();
}