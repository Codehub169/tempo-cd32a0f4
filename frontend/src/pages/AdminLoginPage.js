import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Local error for form validation or login failures
    const { login, error: authContextError, clearError: authClearError, isLoading } = useAuth();
    // useNavigate is not directly used here for navigation after login, as AuthContext handles it.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear local error
        if (authContextError) {
            authClearError(); // Clear error from previous AuthContext attempts
        }

        if (!email.trim() || !password.trim()) {
            setError('Email and password are required.');
            return;
        }

        try {
            const success = await login(email, password); // login from AuthContext
            if (!success) {
                // Login failed. AuthContext should have set its 'error' state.
                // Display that error. If authContextError is null for some reason, provide a fallback.
                setError(authContextError || 'Failed to login. Please check your credentials.');
            }
            // If successful, AuthContext's login function handles navigation.
        } catch (err) {
            // This catch is for unexpected errors not handled by AuthContext's login (e.g., network issues before API call)
            console.error("Unexpected error during login attempt:", err);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md w-full max-w-md text-center">
                <Link to="/" className="font-secondary text-3xl font-bold text-primary mb-2 inline-block">
                    SimpleBlog
                </Link>
                <h1 className="font-secondary text-xl font-medium text-secondary mb-8">
                    Admin Login
                </h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-6 text-left">
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
                            aria-describedby={error && email.trim() === '' ? "emailErrorText" : undefined}
                        />
                        {/* Example inline error, not used if global error alert is preferred
                        {error && email.trim() === '' && <p className="text-red-600 text-xs italic mt-1" id=\"emailErrorText\">Please enter a valid email.</p>} 
                        */}
                    </div>
                    
                    <div className="mb-8 text-left">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            className="w-full px-4 py-3 text-base border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            autoComplete="current-password"
                            aria-describedby={error && password.trim() === '' ? "passwordErrorText" : undefined}
                        />
                         {/* Example inline error
                         {error && password.trim() === '' && <p className="text-red-600 text-xs italic mt-1" id=\"passwordErrorText\">Password is required.</p>} 
                         */}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-6 text-sm">
                    <Link to="/" className="text-primary hover:text-blue-600 hover:underline">
                        Back to Site
                    </Link>
                </div>
            </div>
            <p className="mt-8 text-sm text-secondary">
                &copy; {new Date().getFullYear()} SimpleBlog. All rights reserved.
            </p>
        </div>
    );
}

export default AdminLoginPage;
