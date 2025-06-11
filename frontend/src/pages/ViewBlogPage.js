import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Using the API client

const BackArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ViewBlogPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await api.get(`/posts/${postId}`); // Fetch actual post by ID
        setPost(response.data); // The backend returns the post object directly in response.data
      } catch (err) {
        console.error('Error fetching post:', err.response ? err.response.data : err.message);
        if (err.response && err.response.status === 404) {
          setError('Post not found.');
        } else {
          setError('Failed to fetch post. Please try again later.');
        }
        setPost(null); // Clear post data on error
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    } else {
      // Handle case where postId is not present (e.g., invalid route parameter)
      setError('Invalid post ID specified.');
      setLoading(false);
      setPost(null);
    }

  }, [postId]);

  useEffect(() => {
    if (post && post.title) {
      document.title = `${post.title} - SimpleBlog`;
    }
    return () => {
      document.title = 'SimpleBlog'; // Reset title on unmount
    };
  }, [post]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading post...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-status-error" role="alert">{error}</div>;
  }

  if (!post) {
    // This case might be hit if postId is invalid or fetch fails without specific error message shown above
    return <div className="container mx-auto px-4 py-8 text-center" role="alert">Post details are unavailable.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <article className="bg-white rounded-lg shadow-sm p-6 md:p-10">
        <h1 className="font-secondary text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-3 leading-tight">
          {post.title}
        </h1>
        <p className="text-base text-secondary mb-8">
          Published on {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} 
          {/* Updated to use post.author_username from API response */}
          {post.author_username && ` by ${post.author_username}`}
        </p>
        {/* 
          Backend is expected to sanitize this HTML content before sending it to prevent XSS. 
          The 'prose-*' classes below apply styles to child elements (h2, h3, a, blockquote, etc.).
          These work due to Tailwind's JIT child selector generation, even without the @tailwindcss/typography plugin.
          If @tailwindcss/typography plugin were used, it would provide base styling for the 'prose' class itself.
        */}
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-h2:font-secondary prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-neutral-dark prose-h3:font-secondary prose-h3:text-xl prose-h3:md:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-neutral-dark prose-a:text-primary prose-a:font-medium hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-secondary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="mt-10 pt-8 border-t border-neutral-border text-center">
          <Link 
            to="/"
            className="inline-flex items-center font-primary text-base font-medium text-primary border border-primary rounded-lg px-6 py-3 hover:bg-primary hover:text-white transition-colors duration-200"
          >
            <BackArrow />
            Back to All Posts
          </Link>
        </div>
      </article>
    </div>
  );
};

export default ViewBlogPage;
