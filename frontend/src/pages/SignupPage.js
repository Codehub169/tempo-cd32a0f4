import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register, isLoading, error: authError, clearError: authClearError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Clear auth context error when component mounts or authError changes and a local error is not already set
        // This prevents showing a stale auth error from another page if the user navigates here.
        if (authError) {
            authClearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (authError) { // Clear any authError that might have been set by a previous attempt in this session
            authClearError();
        }

        if (!username.trim() || !email.trim() || !password.trim()) {
            setError('Username, email, and password are required.');
            return;
        }
        // Basic email validation (more comprehensive validation can be added)
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const result = await register({ username, email, password });
        if (result.success) {
            setSuccess('Registration successful! Redirecting to login...');
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                navigate('/admin-login'); // Or a dedicated login page if different
            }, 2000);
        } else {
            // Error is handled by authError from context, or set local error if needed
            setError(result.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md w-full max-w-md text-center">
                <Link to="/" className="font-secondary text-3xl font-bold text-primary mb-2 inline-block">
                    SimpleBlog
                </Link>
                <h1 className="font-secondary text-xl font-medium text-secondary mb-8">
                    Create Account
                </h1>
                
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
                        <p>{success}</p>
                    </div>
                )}
                {/* Display local form error first */} 
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                 {/* Display authError from context only if no local error is set from the registration attempt itself */}
                 {authError && !error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
                        <p>{authError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4 text-left">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Username
                        </label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            className="w-full px-4 py-3 text-base border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                            autoComplete="username"
                        />
                    </div>
                    <div className="mb-4 text-left">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className="w-full px-4 py-3 text-base border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="you@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            autoComplete="email"
                        />
                    </div>
                    <div className="mb-4 text-left">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password (min. 6 characters)
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            className="w-full px-4 py-3 text-base border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="Create a password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            autoComplete="new-password"
                        />
                    </div>
                     <div className="mb-6 text-left">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Confirm Password
                        </label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            className="w-full px-4 py-3 text-base border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="Confirm your password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                            autoComplete="new-password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-6 text-sm">
                    <Link to="/admin-login" className="text-primary hover:text-blue-600 hover:underline">
                        Already have an account? Login
                    </Link>
                </div>
            </div>
            {/* Redundant footer removed as App.js provides a global footer 
            <p className="mt-8 text-sm text-secondary">
                &copy; {new Date().getFullYear()} SimpleBlog. All rights reserved.
            </p>
            */}
        </div>
    );
}

export default SignupPage;
