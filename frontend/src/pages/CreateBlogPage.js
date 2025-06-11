import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api'; 

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
            await api.post('/posts', { title, content }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccess('Blog post published successfully!');
            setTitle('');
            setContent('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to publish post.');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-neutral-100 min-h-screen pb-10"> 
            {/* Assuming Navbar is rendered globally in App.js and adapts based on auth state */}
            
            <main className="pt-10">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="font-secondary text-3xl font-semibold text-neutral-800 mb-8">
                        Create New Blog Post
                    </h1>
                    
                    {success && (
                        <div className="bg-accent-100 border border-accent-400 text-accent-700 px-4 py-3 rounded-md mb-6 text-center font-medium" role="alert">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="bg-error-100 border border-error-400 text-error-700 px-4 py-3 rounded-md mb-6 text-center font-medium" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="postTitle" className="block text-base font-semibold text-neutral-700 mb-2">
                                    Post Title
                                </label>
                                <input 
                                    type="text" 
                                    id="postTitle" 
                                    name="postTitle" 
                                    className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your post title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required 
                                />
                            </div>
                            
                            <div className="mb-8">
                                <label htmlFor="postContent" className="block text-base font-semibold text-neutral-700 mb-2">
                                    Post Content
                                </label>
                                <textarea 
                                    id="postContent" 
                                    name="postContent" 
                                    className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors min-h-[250px] resize-y"
                                    placeholder="Write your blog post here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required 
                                />
                            </div>
                            
                            <div className="text-right">
                                <button 
                                    type="submit" 
                                    className={`bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Publishing...' : 'Publish Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            {/* Footer can be added here or in App.js for global consistency */}
        </div>
    );
}

export default CreateBlogPage;
