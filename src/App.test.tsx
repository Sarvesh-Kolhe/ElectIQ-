import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock child components or modules that might cause issues in jsdom
vi.mock('./components/Map', () => ({
  default: () => <div data-testid="mock-map">Map</div>,
}));

describe('App Dashboard', () => {
  it('renders the brand logo and name', () => {
    render(<App />);
    expect(screen.getByText('ElectIQ')).toBeInTheDocument();
  });

  it('renders the main navigation tabs', () => {
    render(<App />);
    // Target tabs in the main navigation specifically
    const header = screen.getByRole('banner');
    expect(header).toHaveTextContent('Dashboard');
    expect(header).toHaveTextContent('EPIC Service');
    expect(header).toHaveTextContent('Candidates');
    expect(header).toHaveTextContent('Polling');
  });

  it('renders the mobile footer navigation', () => {
    render(<App />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Dashboard');
  });

  it('renders the get started button', () => {
    render(<App />);
    expect(screen.getByLabelText('Get Started')).toBeInTheDocument();
  });

  it('renders the dashboard heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 2, name: /Personalized/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Election Journey/i);
  });
});
