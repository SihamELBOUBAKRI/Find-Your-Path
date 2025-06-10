import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageSquare, FiEdit, FiTrash2, FiSend } from 'react-icons/fi';
import api from '../../api';
import '../../assets/styles/PostsPage.css';
import PostCard from './PostCard';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/posts', {
          params: { page: currentPage }
        });
        
        // Updated to match your API response structure
        setPosts(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.response?.data?.message || 'Error fetching posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const createPost = async () => {
    try {
      const response = await api.post('/posts', {
        content: newPostContent
      });
      setPosts([response.data.data, ...posts]);
      setNewPostContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    }
  };

  const updatePost = async (postId) => {
    try {
      const response = await api.put(`/posts/${postId}`, {
        content: editPostContent
      });
      setPosts(posts.map(post => 
        post.id === postId ? response.data.data : post
      ));
      setEditingPostId(null);
      setEditPostContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating post');
    }
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting post');
    }
  };

  const toggleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post.id === postId ? { 
          ...post, 
          likes: response.data.likes,
          is_liked: response.data.is_liked 
        } : post
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Error liking post');
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post.id);
    setEditPostContent(post.content);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditPostContent('');
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h1>Community Posts</h1>
        <p>Share your thoughts and engage with others</p>
      </div>

      <div className="create-post">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
        />
        <button 
          className="post-button"
          onClick={createPost}
          disabled={!newPostContent.trim()}
        >
          <FiSend /> Post
        </button>
      </div>

      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
            key={post.id} 
            post={post} 
            showFullContent={false}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsPage;