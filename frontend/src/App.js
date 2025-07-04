import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ViewBlogPage from './pages/ViewBlogPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CreateBlogPage from './pages/CreateBlogPage';
import SignupPage from './pages/SignupPage'; // Import SignupPage
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
// import NotFoundPage from './pages/NotFoundPage'; // Example for a 404 page

const Footer = () => {
  return (
    <footer className="bg-neutral-dark text-neutral-light py-8 text-center mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} SimpleBlog. All rights reserved.</p>
      </div>
    </footer>
  );
};

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:postId" element={<ViewBlogPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/signup" element={<SignupPage />} /> {/* Add route for SignupPage */}
          <Route 
            path="/create-post" 
            element={
              <ProtectedRoute>
                <CreateBlogPage />
              </ProtectedRoute>
            } 
          />
           {/* Add a catch-all route for 404 if desired */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
