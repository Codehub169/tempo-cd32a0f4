import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    // useNavigate is not used here, so it can be removed if desired, but not strictly an error.

    const handleLogout = async () => {
        try {
            await logout(); // AuthContext.logout handles navigation
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally show an error message to the user, e.g., via a toast notification system
            // For now, AuthContext's logout navigates to /admin-login regardless of API call success.
        }
    };

    return (
        <header className="bg-white py-4 border-b border-neutral-border shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link to="/" className="font-secondary text-2xl sm:text-3xl font-bold text-primary">
                    SimpleBlog
                </Link>
                <nav className="flex items-center space-x-2 sm:space-x-4">
                    <Link 
                        to="/"
                        className="text-gray-600 hover:text-primary px-2 sm:px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                        aria-label="Home page"
                    >
                        Home
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link 
                                to="/create-post" 
                                className="text-gray-600 hover:text-primary px-2 sm:px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                            >
                                Create Post
                            </Link>
                            {user && (
                                <span className='text-xs sm:text-sm text-secondary hidden md:inline px-2' aria-label={`Logged in as ${user.username || user.email?.split('@')[0]}`}>
                                    Hi, {user.username || user.email?.split('@')[0]}
                                </span>
                            )}
                            <button 
                                onClick={handleLogout} 
                                className="bg-secondary hover:bg-gray-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link 
                            to="/admin-login" 
                            className="bg-primary hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                        >
                            Admin Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
