import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api'; // This imports apiClient as default

function CreateBlogPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            setIsLoading(false);
            return;
        }

        try {
            // api is the axios instance from ../services/api.js
            await api.post('/posts', { title, content }, {
                headers: {
                    'Authorization': `Bearer ${token}` // Token is already added by interceptor in api.js, but explicit here is also fine.
                }
            });
            setSuccess('Blog post published successfully!');
            setTitle('');
            setContent('');
            // Clear success message after a few seconds
            const timer = setTimeout(() => setSuccess(''), 3000);
            // It's good practice to clear timers on component unmount if the component could unmount before the timer fires.
            // However, in this specific case (form submission success), it's less critical.
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to publish post.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-neutral-light min-h-screen pb-10"> 
            {/* Assuming Navbar is rendered globally in App.js */}
            
            <main className="pt-10">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="font-secondary text-3xl font-semibold text-neutral-dark mb-8">
                        Create New Blog Post
                    </h1>
                    
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6 text-center font-medium" role="alert">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-center font-medium" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="postTitle" className="block text-base font-semibold text-gray-700 mb-2">
                                    Post Title
                                </label>
                                <input 
                                    type="text" 
                                    id="postTitle" 
                                    name="postTitle" 
                                    className="w-full px-4 py-3 text-base border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="Enter your post title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required 
                                />
                            </div>
                            
                            <div className="mb-8">
                                <label htmlFor="postContent" className="block text-base font-semibold text-gray-700 mb-2">
                                    Post Content
                                </label>
                                <textarea 
                                    id="postContent" 
                                    name="postContent" 
                                    className="w-full px-4 py-3 text-base border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors min-h-[250px] resize-y"
                                    placeholder="Write your blog post here... (HTML is allowed, will be sanitized by backend)"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required 
                                />
                            </div>
                            
                            <div className="text-right">
                                <button 
                                    type="submit" 
                                    className={`bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Publishing...' : 'Publish Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CreateBlogPage;
