import { render, screen } from '@testing-library/react';
import App from './App';

test('renders application welcome header', () => {
  render(<App />);
  const heading = screen.getByText(/Welcome to Hospital Prescription System/i);
  expect(heading).toBeInTheDocument();
});
