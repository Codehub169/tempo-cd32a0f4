import React from 'react';
import { Link } from 'react-router-dom';

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return dateString; 
    }
};

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-1.5 transition-transform group-hover:translate-x-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
    </svg>
);

function PostCard({ post }) {
    if (!post || !post.id) return null;

    let excerpt = post.content || '';
    // Basic excerpt: take the first 150 characters. 
    // A more robust solution might parse HTML or look for sentence/paragraph endings.
    const plainTextContent = excerpt.replace(/<[^>]+>/g, ''); // Strip HTML for excerpt
    if (plainTextContent.length > 150) {
        excerpt = plainTextContent.substring(0, 150) + '...';
    } else {
        excerpt = plainTextContent;
    }

    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className="p-5 sm:p-6 flex flex-col flex-grow">
                <Link to={`/post/${post.id}`} className="block mb-1 sm:mb-2">
                    <h2 className="font-secondary text-lg sm:text-xl font-semibold text-neutral-800 hover:text-primary-500 transition-colors leading-tight">
                        {post.title || 'Untitled Post'}
                    </h2>
                </Link>
                <p className="text-xs sm:text-sm text-neutral-500 mb-3 sm:mb-4">
                    Published on {formatDate(post.created_at)}
                    {post.author && post.author.username && <span className="italic"> by {post.author.username}</span>}
                </p>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 flex-grow">
                    {excerpt}
                </p>
                <Link 
                    to={`/post/${post.id}`} 
                    className="group self-start inline-flex items-center text-sm sm:text-base font-semibold text-primary-500 hover:text-accent-500 transition-colors"
                >
                    Read More 
                    <ArrowRightIcon />
                </Link>
            </div>
        </article>
    );
}

export default PostCard;
