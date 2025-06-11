import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState(''); // Renamed from 'error' for clarity, stores local and auth errors for this form
    const { login, error: authContextError, clearError: authClearError, isLoading } = useAuth();

    // Clear auth context error when component mounts, if one was set from another page/action.
    useEffect(() => {
        if (authContextError) {
            authClearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on mount to clear pre-existing auth errors

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(''); // Clear previous local form error
        if (authContextError) { // Clear error from AuthContext if any lingered from other actions before this submission attempt
            authClearError();
        }

        if (!email.trim() || !password.trim()) {
            setFormError('Email and password are required.');
            return;
        }

        try {
            // Pass credentials as an object, which is expected by AuthContext's login function
            const result = await login({ email, password }); 
            if (!result.success) {
                // result.message comes from AuthContext's login error handling (API errors, etc.)
                setFormError(result.message || 'Failed to login. Please check your credentials.');
            }
            // If successful, AuthContext's login function handles navigation.
        } catch (err) {
            // This catch is for unexpected errors not directly handled by AuthContext's login promise
            // (e.g., if login itself throws an error before making the API call, though unlikely with current setup)
            console.error("Unexpected error during login submission:", err);
            setFormError('An unexpected error occurred. Please try again.');
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
                
                {formError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
                        <p id="form-feedback-alert">{formError}</p>
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
                            aria-describedby={formError ? "form-feedback-alert" : undefined}
                            aria-invalid={!!formError}
                        />
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
                            aria-describedby={formError ? "form-feedback-alert" : undefined}
                            aria-invalid={!!formError}
                        />
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
