package com.blogos.service;

import com.blogos.model.Comment;
import com.blogos.model.Post;
import com.blogos.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Transactional
    public Post savePost(Post post) {
        if (post.getId() == null || post.getId().isEmpty()) {
            post.setId(UUID.randomUUID().toString());
        }

        // Logic: Mutually Exclusive Featured Post
        if (post.isFeatured()) {
            postRepository.clearAllFeatured();
        }

        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        // Sort by date desc (simple logic)
        return postRepository.findAll();
    }
    
    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    @Transactional
    public Post addComment(String postId, Comment comment, String parentId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            if (comment.getId() == null) comment.setId(UUID.randomUUID().toString());
            
            if (parentId == null) {
                post.getComments().add(comment);
            } else {
                // Find parent recursively
                addReplyRecursively(post.getComments(), comment, parentId);
            }
            return postRepository.save(post);
        }
        return null;
    }

    private boolean addReplyRecursively(List<Comment> comments, Comment newReply, String parentId) {
        for (Comment c : comments) {
            if (c.getId().equals(parentId)) {
                c.getReplies().add(newReply);
                return true;
            }
            if (addReplyRecursively(c.getReplies(), newReply, parentId)) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public Post likePost(String id) {
        Optional<Post> p = postRepository.findById(id);
        if (p.isPresent()) {
            Post post = p.get();
            post.setLikes(post.getLikes() + 1);
            return postRepository.save(post);
        }
        return null;
    }
}