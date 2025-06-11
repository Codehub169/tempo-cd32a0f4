import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import api from '../services/api'; // Will be used once api.js is implemented

const ReadMoreArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-1 inline-block">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
  </svg>
);

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // const response = await api.getAllPosts();
        // setPosts(response.data);
        // Placeholder data:
        setPosts([
          {
            id: 1,
            title: 'The Future of Web Development',
            created_at: '2023-10-26T10:00:00Z',
            excerpt: 'Web development is constantly evolving. Join us as we explore the upcoming trends, tools, and technologies that are shaping the future of the web...'
          },
          {
            id: 2,
            title: 'Mastering Python for Data Science',
            created_at: '2023-10-20T14:30:00Z',
            excerpt: 'Python has become the go-to language for data science. This post dives into the essential libraries and techniques to master Python for your data projects...'
          },
          {
            id: 3,
            title: 'A Guide to Minimalist Design',
            created_at: '2023-10-15T09:15:00Z',
            excerpt: 'Less is more. Discover the principles of minimalist design and how to apply them to create clean, impactful, and user-friendly interfaces...'
          },
        ]);
        setError(null);
      } catch (err) {
        setError('Failed to fetch posts. Please try again later.');
        console.error(err);
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
    return <div className="container mx-auto px-4 py-8 text-center text-error">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="font-secondary text-3xl sm:text-4xl font-semibold text-text-dark mb-8 md:mb-12 text-center">
        Latest Posts
      </h1>
      {posts.length === 0 && !loading && (
        <p className="text-center text-secondary">No posts available yet. Check back soon!</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"
          >
            <div className="p-6 flex-grow flex flex-col">
              <Link to={`/post/${post.id}`} className="block">
                <h2 className="font-secondary text-xl sm:text-2xl font-semibold text-text-dark mb-2 hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-sm text-gray-500 mb-3">
                Published on {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-gray-600 mb-4 flex-grow leading-relaxed">
                {post.excerpt}
              </p>
              <Link 
                to={`/post/${post.id}`} 
                className="self-start mt-auto font-primary text-base font-semibold text-primary hover:text-accent transition-colors group"
              >
                Read More <ReadMoreArrow />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
