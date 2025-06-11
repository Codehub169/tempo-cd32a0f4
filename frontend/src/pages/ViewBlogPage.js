import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// import api from '../services/api'; // Will be used once api.js is implemented

const BackArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
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
      try {
        // const response = await api.getPostById(postId);
        // setPost(response.data);
        // Placeholder data:
        const dummyPosts = {
          '1': {
            id: 1,
            title: 'The Future of Web Development',
            created_at: '2023-10-26T10:00:00Z',
            user: { username: 'Admin' },
            content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><h2>Key Trends to Watch</h2><p>Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue.</p><h3>Trend 1: Artificial Intelligence Integration</h3><p>Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.</p><blockquote>"The best way to predict the future is to invent it." - Alan Kay</blockquote>'
          },
          '2': {
            id: 2,
            title: 'Mastering Python for Data Science',
            created_at: '2023-10-20T14:30:00Z',
            user: { username: 'Admin' },
            content: '<p>Python\'s simplicity and power have made it a cornerstone in the field of data science.</p><h2>Core Libraries</h2><p>NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn.</p>'
          },
           '3': {
            id: 3,
            title: 'A Guide to Minimalist Design',
            created_at: '2023-10-15T09:15:00Z',
            user: { username: 'Admin' },
            content: '<p>Minimalism in design is not just about less; it\'s about making \'less\' more impactful.</p><h2>Principles of Minimalism</h2><ul><li>Whitespace</li><li>Flat design</li><li>Strong typography</li></ul>'
          }
        };
        if (dummyPosts[postId]) {
          setPost(dummyPosts[postId]);
          setError(null);
        } else {
          setError('Post not found.');
          setPost(null);
        }
      } catch (err) {
        setError('Failed to fetch post. Please try again later.');
        console.error(err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
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
    return <div className="container mx-auto px-4 py-8 text-center text-error">{error}</div>;
  }

  if (!post) {
    return <div className="container mx-auto px-4 py-8 text-center">Post not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <article className="bg-white rounded-lg shadow-sm p-6 md:p-10">
        <h1 className="font-secondary text-3xl sm:text-4xl lg:text-5xl font-bold text-text-dark mb-3 leading-tight">
          {post.title}
        </h1>
        <p className="text-base text-gray-500 mb-8">
          Published on {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} 
          {post.user && `by ${post.user.username}`}
        </p>
        {/* Backend should sanitize this HTML content before sending it */}
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-h2:font-secondary prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-text-dark prose-h3:font-secondary prose-h3:text-xl prose-h3:md:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-text-dark prose-a:text-primary prose-a:font-medium hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-secondary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="mt-10 pt-8 border-t border-gray-200 text-center">
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
