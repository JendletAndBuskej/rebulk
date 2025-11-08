import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';

const SignInButton: React.FC = () => {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <div className="auth-card">
      <h2>Welcome back</h2>
      <p>Sign in with Google to access your personalised workouts.</p>
      <button type="button" onClick={handleSignIn} className="btn btn-primary">
        Continue with Google
      </button>
    </div>
  );
};

export default SignInButton;

