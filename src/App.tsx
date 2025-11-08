import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import './App.css';
import AppLayout from './components/layout/AppLayout';
import SignInButton from './components/auth/SignInButton';
import Dashboard from './views/Dashboard';
import Spinner from './components/ui/Spinner';
import { auth } from './firebase';

const App: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);

  return (
    <AppLayout>
      {loading && <Spinner />}
      {!loading && error && <p className="error-state">Something went wrong: {error.message}</p>}
      {!loading && !error && !user && <SignInButton />}
      {!loading && !error && user && <Dashboard uid={user.uid} />}
    </AppLayout>
  );
};

export default App;

