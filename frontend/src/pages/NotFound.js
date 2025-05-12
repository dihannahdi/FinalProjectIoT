import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaGamepad } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
          <Link to="/" className="btn btn-primary flex items-center justify-center">
            <FaHome className="mr-2" />
            Back to Home
          </Link>
          <Link to="/game" className="btn btn-success flex items-center justify-center">
            <FaGamepad className="mr-2" />
            Play Game
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 