import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        try {
            await login(email, password);
            navigate('/create-post'); 
        } catch (err) {
            // Check if err.message is already user-friendly from AuthContext
            // Or if err.response.data.message exists for API errors
            const errorMessage = err.response?.data?.message || err.message || 'Failed to login. Please check your credentials.';
            setError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md w-full max-w-md text-center">
                <Link to="/" className="font-secondary text-3xl font-bold text-primary-500 mb-2 inline-block">
                    SimpleBlog
                </Link>
                <h1 className="font-secondary text-xl font-medium text-neutral-500 mb-8">
                    Admin Login
                </h1>
                
                {error && (
                    <div className="bg-error-100 border border-error-400 text-error-700 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-6 text-left">
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            placeholder="you@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            aria-describedby={error && email.trim() === '' ? "emailError" : undefined}
                        />
                        {/* Basic inline validation message example - can be enhanced */}
                         {/* <p className="text-error-600 text-xs italic mt-1" id="emailError">Please enter a valid email.</p> */}
                    </div>
                    
                    <div className="mb-8 text-left">
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            aria-describedby={error && password.trim() === '' ? "passwordError" : undefined}
                        />
                         {/* <p className="text-error-600 text-xs italic mt-1" id="passwordError">Password is required.</p> */}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-6 text-sm">
                    <Link to="/" className="text-primary-500 hover:text-primary-600 hover:underline">
                        Back to Site
                    </Link>
                </div>
            </div>
            <p className="mt-8 text-sm text-neutral-500">
                &copy; {new Date().getFullYear()} SimpleBlog. All rights reserved.
            </p>
        </div>
    );
}

export default AdminLoginPage;
