/**
 * 文章服务类
 * 提供文章相关的业务逻辑处理，包括保存、删除、评论和点赞功能
 */
package com.blogos.service;

import com.blogos.model.Comment;
import com.blogos.model.Post;
import com.blogos.repository.PostRepository;
import org.hibernate.type.descriptor.DateTimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// 服务注解，标记这是一个业务服务类
@Service
public class PostService {

    // 自动注入文章仓库
    @Autowired
    private PostRepository postRepository;

    /**
     * 保存文章
     *
     * @param post 文章对象
     * @return 保存后的文章
     */
    @Transactional
    public Post savePost(Post post) {
        // 如果文章 ID 为空，则生成新的 UUID
        if (post.getId() == null || post.getId().isEmpty()) {
            post.setId(UUID.randomUUID().toString());
        }

        // 业务逻辑：互斥的精选文章
        // 如果当前文章设为精选，则清除其他所有精选文章的精选状态
        if (post.isFeatured()) {
            postRepository.clearAllFeatured();
        }

        return postRepository.save(post);
    }

    /**
     * 获取所有文章
     *
     * @return 文章列表
     */
    public List<Post> getAllPosts() {
        // 按日期降序排序（简单逻辑）
        return postRepository.findAll();
    }

    /**
     * 删除文章
     *
     * @param id 文章 ID
     */
    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    /**
     * 添加评论
     *
     * @param postId   文章 ID
     * @param comment  评论对象
     * @param parentId 父评论 ID
     * @return 添加评论后的文章
     */
    @Transactional
    public Post addComment(String postId, Comment comment, String parentId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            // 如果评论 ID 为空，则生成新的 UUID
            if (comment.getId() == null) comment.setId(UUID.randomUUID().toString());
            comment.setDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern(DateTimeUtils.FORMAT_STRING_TIMESTAMP)));
            if (!StringUtils.hasText(parentId)) {
                // 如果没有父评论 ID，则直接添加到文章的评论列表
                post.getComments().add(comment);
            } else {
                // 如果有父评论 ID，则递归查找并添加回复
                addReplyRecursively(post.getComments(), comment, parentId);
            }
            return postRepository.save(post);
        }
        return null;
    }

    /**
     * 递归添加回复评论
     *
     * @param comments 评论列表
     * @param newReply 新回复评论
     * @param parentId 父评论 ID
     * @return 是否添加成功
     */
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

    /**
     * 文章点赞
     *
     * @param id 文章 ID
     * @return 点赞后的文章
     */
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