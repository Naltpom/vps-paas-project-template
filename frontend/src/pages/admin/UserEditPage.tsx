/**
 * Admin - User Edit Page
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

interface User {
  id: string;
  slug: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export const UserEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [slug]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/users/${slug}`);
      const userData = response.data.user;

      setUser(userData);
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setEmail(userData.email);
      setRole(userData.role);
      setStatus(userData.status);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put(`/api/admin/users/${slug}`, {
        firstName,
        lastName,
        email,
        role,
        status
      });

      setSuccess('User updated successfully!');
      await fetchUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }

    if (!confirm('Are you sure you want to reset this user\'s password?')) {
      return;
    }

    try {
      await api.post(`/api/admin/users/${slug}/reset-password`, { newPassword });
      alert('Password reset successfully!');
      setNewPassword('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone!')) {
      return;
    }

    try {
      await api.delete(`/api/admin/users/${slug}`);
      alert('User deleted successfully');
      navigate('/admin/users');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading user...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">User not found</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <button
          onClick={() => navigate('/admin/users')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to users
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">User Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">User ID:</span>
            <p className="font-mono text-gray-800">{user.id}</p>
          </div>
          <div>
            <span className="text-gray-600">Slug:</span>
            <p className="font-mono text-gray-800">{user.slug}</p>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <p className="text-gray-800">{new Date(user.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-600">Updated:</span>
            <p className="text-gray-800">{new Date(user.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Details</h2>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md font-medium disabled:bg-purple-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Reset Password */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Reset Password</h2>
        <div className="flex space-x-2">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            onClick={handleResetPassword}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium"
          >
            Reset Password
          </button>
        </div>
      </div>

      {/* Delete User */}
      <div className="bg-white rounded-lg shadow-md border border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete a user, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium"
        >
          Delete User
        </button>
      </div>
    </div>
  );
};
