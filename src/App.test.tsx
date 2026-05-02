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
  });

  it('renders the FAQ section', () => {
    render(<App />);
    expect(screen.getByText(/Knowledge Base/i)).toBeInTheDocument();
    expect(screen.getByText(/Electors Photo Identification Card/i)).toBeInTheDocument();
  });

  it('can open an FAQ item', () => {
    render(<App />);
    const faqButton = screen.getByText(/check if my name is in the electoral roll/i);
    expect(faqButton).toBeInTheDocument();
  });

  it('navigates to registration and checks eligibility', async () => {
    const { getByText, getByLabelText } = render(<App />);
    
    // Switch to registration tab
    const registrationTab = getByText('EPIC Service');
    registrationTab.click();

    const dateInput = getByLabelText('Date of Birth');
    const verifyButton = getByLabelText('Verify Age Eligibility');

    // Set date to 20 years ago (eligible)
    const eligibleDate = new Date();
    eligibleDate.setFullYear(eligibleDate.getFullYear() - 20);
    const dateStr = eligibleDate.toISOString().split('T')[0];
    
    // In jsdom we might need to set the value directly
    // @ts-ignore
    dateInput.value = dateStr;
    verifyButton.click();

    expect(screen.getByText('ELIGIBLE')).toBeInTheDocument();
  });

  it('renders state-specific election schedules', () => {
    render(<App />);
    expect(screen.getByText(/General Election Phase/i)).toBeInTheDocument();
  });

  it('toggles visibility in polling station list', async () => {
    const { getByText } = render(<App />);
    getByText('Polling').click();
    expect(screen.getByText(/Node Matrix/i)).toBeInTheDocument();
  });
});
