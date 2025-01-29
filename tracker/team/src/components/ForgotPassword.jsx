import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../apis/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
   
    e.preventDefault();
    
    try {
        const response = await requestPasswordReset(email); 
        if (response.error) {
            setMessage(response.error); 
        } else {
            setMessage(response.message || "Reset link sent successfully!");
        }
    } catch (error) {
        setMessage("Something went wrong. Please try again.");
        console.error("Password reset error:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-black-600 font-roboto">Team Tracker</h1>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl text-gray-700 font-roboto">Forgot Password</h3>
        </div>

        {error && <p className="text-center text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-center text-green-500 text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 border p-4 rounded">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Enter your user account's email address and we will send you a password reset link.
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-center mt-6 border rounded p-4">
          <p className="text-sm text-gray-700">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
