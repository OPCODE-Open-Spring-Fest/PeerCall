import React from "react";

const apiBase = import.meta.env.VITE_API_URL || "";

const SocialLogin: React.FC = () => {
  const startGoogleSignIn = () => {
    window.location.href = `${apiBase}/api/auth/google`;
  };

  const startGithubSignIn = () => {
    window.location.href = `${apiBase}/api/auth/github`;
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <button
        onClick={startGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:shadow-sm transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.8 0 6.9 1.6 9.1 3.2l6.8-6.7C35.6 2.3 30.1 0 24 0 14.9 0 6.9 4.9 2.6 12.1l7.9 6.2C12.8 13.1 17.9 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.7 24.3c0-1.6-.1-2.8-.4-4.1H24v8h12.8c-.6 3-2.9 6.6-7.8 9.2l7.9 6.1C43.5 38.8 46.7 32.3 46.7 24.3z"/>
          <path fill="#FBBC05" d="M10.5 29.3c-1.1-3-1.1-6.2 0-9.2L2.6 13.9C-.2 19.1-.2 28.9 2.6 34.1l7.9-4.8z"/>
          <path fill="#34A853" d="M24 48c6.1 0 11.6-2 15.5-5.3l-7.9-6.1c-2.3 1.5-5.6 2.6-7.6 2.6-6.1 0-11.2-4-13.1-9.4l-7.9 4.8C6.9 43.1 14.9 48 24 48z"/>
        </svg>
        <span className="text-sm font-medium">Sign in with Google</span>
      </button>
      <button
        onClick={startGithubSignIn}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:shadow-sm transition"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.483 2 12.017c0 4.427 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.004.071 1.532 1.034 1.532 1.034.892 1.528 2.341 1.087 2.91.832.091-.647.35-1.087.637-1.337-2.22-.253-4.555-1.112-4.555-4.946 0-1.092.39-1.987 1.029-2.686-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.297 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.699 1.028 1.594 1.028 2.686 0 3.844-2.339 4.69-4.566 4.938.36.31.682.923.682 1.861 0 1.343-.012 2.425-.012 2.754 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.483 17.523 2 12 2z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium">Sign in with GitHub</span>
      </button>
    </div>
  );
};

export default SocialLogin;
