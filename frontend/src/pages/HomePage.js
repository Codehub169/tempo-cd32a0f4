import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Removed as Link is not used directly in HomePage anymore
import api from '../services/api'; // Uncommented and will be used
import PostCard from '../components/PostCard'; // Assuming PostCard is the component for displaying posts

// ReadMoreArrow component (previously in HomePage) is now part of PostCard's concerns if needed,
// or PostCard uses its own arrow icon, which it does (ArrowRightIcon).

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/posts'); // Fetch actual posts
        // Assuming API returns { posts: [...], total_pages: ..., ... }
        // For now, we are only using the posts array.
        setPosts(response.data.posts || []); // Ensure posts is an array even if API returns null/undefined
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err.response ? err.response.data : err.message);
        setError('Failed to fetch posts. Please try again later.');
        setPosts([]); // Clear posts on error
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading posts...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-status-error">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="font-secondary text-3xl sm:text-4xl font-semibold text-neutral-dark mb-8 md:mb-12 text-center">
        Latest Posts
      </h1>
      {posts.length === 0 && !loading && (
        <p className="text-center text-secondary">No posts available yet. Check back soon!</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          // Use PostCard component to render each post.
          // This approach is more modular than rendering article content directly in HomePage.
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
