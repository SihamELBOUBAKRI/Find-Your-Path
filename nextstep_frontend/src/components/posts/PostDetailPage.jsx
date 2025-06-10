import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageSquare, FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../../api';
import '../../assets/styles/PostDetailPage.css';

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/posts/${postId}`);
        const postData = response.data.data;
        
        setPost(postData);
        setIsLiked(postData.is_liked || false);
        setLikeCount(postData.likes || 0);
        setIsAuthor(postData.user.id === api.defaults.auth?.userId);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      setIsLiked(response.data.is_liked);
      setLikeCount(response.data.likes);
    } catch (err) {
      setError(err.response?.data?.message || 'Error liking post');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${postId}`);
        navigate('/posts');
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting post');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    try {
      setCommentLoading(true);
      setCommentError(null);
      
      const response = await api.post(`/posts/${postId}/comments`, {
        content: commentContent
      });
      
      setPost(prev => ({
        ...prev,
        comments: [response.data.data, ...prev.comments],
        comments_count: prev.comments_count + 1
      }));
      setCommentContent('');
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Error adding comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/posts/${postId}/comments/${commentId}`);
        setPost(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c.id !== commentId),
          comments_count: prev.comments_count - 1
        }));
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting comment');
      }
    }
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!post) return <div className="not-found">Post not found</div>;

  return (
    <div className="post-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>
      
      <div className="post-card">
        <div className="post-header">
          <div className="author-info">
            {post.user.avatar ? (
              <img 
                src={post.user.avatar} 
                alt={post.user.name} 
                className="author-avatar"
              />
            ) : (
              <div className="author-avatar-placeholder">
                {post.user.name.charAt(0)}
              </div>
            )}
            <span className="author-name">{post.user.name}</span>
          </div>
          <span className="post-date">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="post-content">
          {post.content}
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="post-footer">
          <button 
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <FiHeart className="like-icon" />
            {likeCount}
          </button>
          
          <button 
            className="comment-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <FiMessageSquare className="comment-icon" />
            {post.comments_count}
          </button>
          
          {isAuthor && (
            <div className="post-actions">
              <button 
                className="edit-btn"
                onClick={() => navigate(`/posts/${postId}/edit`)}
              >
                <FiEdit /> Edit
              </button>
              <button 
                className="delete-btn"
                onClick={handleDelete}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showComments && (
        <>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="form-group">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                rows="3"
                disabled={commentLoading}
              />
            </div>
            
            {commentError && <div className="error-message">{commentError}</div>}
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={commentLoading || !commentContent.trim()}
            >
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
          
          <div className="comments-container">
            <h3 className="comments-title">Comments ({post.comments?.length || 0})</h3>
            
            {post.comments?.length === 0 ? (
              <div className="no-comments">No comments yet</div>
            ) : (
              <div className="comments-list">
                {post.comments?.map(comment => (
                  <div key={comment.id} className="comment-card">
                    <div className="comment-header">
                      <div className="comment-author">
                        {comment.user.avatar ? (
                          <img 
                            src={comment.user.avatar} 
                            alt={comment.user.name} 
                            className="comment-avatar"
                          />
                        ) : (
                          <div className="comment-avatar-placeholder">
                            {comment.user.name.charAt(0)}
                          </div>
                        )}
                        <span className="comment-author-name">{comment.user.name}</span>
                      </div>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="comment-content">
                      {comment.content}
                    </div>
                    
                    <div className="comment-footer">
                      {(comment.user.id === api.defaults.auth?.userId || isAuthor) && (
                        <button 
                          className="comment-delete-btn"
                          onClick={() => handleCommentDelete(comment.id)}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PostDetailPage;