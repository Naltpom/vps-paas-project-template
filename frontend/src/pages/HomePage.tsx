/**
 * Home Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PROJECT_CONFIG, isBuilding } from '../config/project';
import { TerminalViewer } from '../components/TerminalViewer';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {PROJECT_CONFIG.name}
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        {PROJECT_CONFIG.description}
      </p>
      {PROJECT_CONFIG.prompt && (
        <div className="bg-gray-100 rounded-lg p-4 mb-8 text-left max-w-2xl mx-auto">
          <p className="text-sm text-gray-500 mb-2 font-semibold">Project Prompt:</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{PROJECT_CONFIG.prompt}</p>
        </div>
      )}

      {/* Show terminal viewer if project is being built */}
      {isBuilding() && (
        <div className="mb-8">
          <div className="mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">Building your project with Claude CLI...</span>
            </div>
          </div>
          <TerminalViewer />
        </div>
      )}

      {isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-gray-700">
            Hello, <span className="font-semibold">{user?.firstName || user?.email}</span>!
          </p>
          <Link
            to="/profile"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to Profile
          </Link>
        </div>
      ) : (
        <div className="space-x-4">
          <Link
            to="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium"
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
};
