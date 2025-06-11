import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { isAuthenticated, user, logout, isLoading } = useAuth();

    const handleLogout = async () => {
        // isLoading from useAuth can be used to disable the logout button during logout process
        // However, logout itself sets its own loading state. For simplicity, we don't disable here,
        // as quick multiple clicks are unlikely to be an issue and logout is robust.
        try {
            await logout();
        } catch (error) {
            // This catch is mostly for unexpected errors if logout itself throws something
            // AuthContext's logout already logs API errors.
            console.error('Error during logout process:', error);
        }
    };

    // Determine user display name, fallback to email part if username is not available
    const userDisplayName = user ? (user.username || user.email?.split('@')[0] || 'User') : 'User';

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
                    {isLoading ? (
                        <span className="text-sm text-secondary px-2">Loading...</span>
                    ) : isAuthenticated ? (
                        <>
                            <Link 
                                to="/create-post" 
                                className="text-gray-600 hover:text-primary px-2 sm:px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                            >
                                Create Post
                            </Link>
                            {user && (
                                <span className='text-xs sm:text-sm text-secondary hidden md:inline px-2' aria-label={`Logged in as ${userDisplayName}`}>
                                    Hi, {userDisplayName}
                                </span>
                            )}
                            <button 
                                onClick={handleLogout} 
                                className="bg-secondary hover:bg-gray-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                                disabled={isLoading} // Disable button if auth context is loading (e.g. during logout operation)
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/signup" 
                                className="text-gray-600 hover:text-primary px-2 sm:px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                            >
                                Sign Up
                            </Link>
                            <Link 
                                to="/admin-login" 
                                className="bg-primary hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                            >
                                Login
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
