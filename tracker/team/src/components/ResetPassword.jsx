import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../apis/auth";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [countdown, setCountdown] = useState(3); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await resetPassword(token, password, passwordConfirmation);
      if (response.error) {
        setError(response.error);
      } else {
        setMessage(response.message || "Password reset successful!");
        setShowDialog(true);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Password reset error:", error);
    }
  };

  useEffect(() => {
    if (showDialog && countdown >= 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      
      if (countdown === 0) {
        navigate("/login");
        clearInterval(timer);
        
      }

      return () => clearInterval(timer);
    }
  }, [showDialog, countdown, navigate]);

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-black-600 font-roboto">Team Tracker</h1>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl text-gray-700 font-roboto">Reset Password</h3>
        </div>

        {error && <p className="text-center text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-center text-green-500 text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 border p-4 rounded">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="password"
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              placeholder="Confirm new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Set New Password
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
      {showDialog && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h2 className="text-xl font-semibold text-green-600">Password Reset Successful!</h2>
            <p className="text-gray-700 mt-4">You will be redirected to the home page in {countdown} seconds...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
