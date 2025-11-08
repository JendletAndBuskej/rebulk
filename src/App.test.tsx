import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('./firebase', () => ({
  auth: {},
}));

jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [null, false, undefined],
}));

test('renders sign in button when user not authenticated', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
});

