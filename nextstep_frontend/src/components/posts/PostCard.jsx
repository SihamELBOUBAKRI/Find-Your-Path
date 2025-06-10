import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiHeart } from 'react-icons/fi';
import api from '../../api';
import '../../assets/styles/PostCard.css'

const PostCard = ({ post, showFullContent = false }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post.id}/like`);
      setIsLiked(response.data.is_liked);
      setLikeCount(response.data.likes);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.user.id}`} className="post-author">
          {post.user.avatar ? (
            <img src={post.user.avatar} alt={post.user.name} className="author-avatar" />
          ) : (
            <div className="author-avatar-placeholder">
              {post.user.name.charAt(0)}
            </div>
          )}
          <span className="author-name">{post.user.name}</span>
        </Link>
        <span className="post-date">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>
      
      <div className="post-content">
        {showFullContent ? (
          post.content
        ) : (
          <>
            {post.content.length > 200
              ? `${post.content.substring(0, 200)}...`
              : post.content}
          </>
        )}
      </div>
      
      {!showFullContent && (
        <Link to={`/student-dashboard/posts/${post.id}`} className="read-more">
          Read more
        </Link>
      )}
      
      <div className="post-footer">
        <button 
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <FiHeart className="like-icon" />
          {likeCount}
        </button>
        
        <Link to={`posts/${post.id}`} className="comment-btn">
          <FiMessageSquare className="comment-icon" />
          {post.comments_count || 0}
        </Link>
      </div>
    </div>
  );
};

export default PostCard;