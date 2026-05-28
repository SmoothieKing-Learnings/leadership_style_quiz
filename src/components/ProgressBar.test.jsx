import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders the correct progressive text', () => {
    render(<ProgressBar current={2} total={5} />);
    
    const textElement = screen.getByText(/Question 2 of 5/i);
    expect(textElement).toBeInTheDocument();
  });

  it('calculates the visual width percentage correctly', () => {
    // 2/5 = 40%
    render(<ProgressBar current={2} total={5} />);
    
    const percentageText = screen.getByText('40%');
    expect(percentageText).toBeInTheDocument();
  });
});
