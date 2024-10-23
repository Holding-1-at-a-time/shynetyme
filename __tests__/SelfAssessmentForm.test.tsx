import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelfAssessmentForm } from '../components/SelfAssessmentForm';

describe('SelfAssessmentForm', () => {
  const mockOnStepChange = jest.fn();
  const mockOnAssessmentChange = jest.fn();
  const mockOnAssessmentComplete = jest.fn();

  const defaultProps = {
    step: 1,
    assessment: {
      id: '1',
      images: [],
      vehicleType: '',
      interiorCondition: 50,
      exteriorCondition: 50,
      services: [],
    },
    onStepChange: mockOnStepChange,
    onAssessmentChange: mockOnAssessmentChange,
    onAssessmentComplete: mockOnAssessmentComplete,
  };

  it('renders the first step correctly', () => {
    render(<SelfAssessmentForm {...defaultProps} />);
    expect(screen.getByText('Upload Vehicle Images')).toBeInTheDocument();
  });

  it('allows image upload', () => {
    render(<SelfAssessmentForm {...defaultProps} />);
    const fileInput = screen.getByLabelText('Upload Images');
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(mockOnAssessmentChange).toHaveBeenCalledWith(expect.objectContaining({
      images: expect.arrayContaining([expect.any(String)]),
    }));
  });

  it('moves to the next step when "Next" is clicked', () => {
    render(<SelfAssessmentForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Next'));
    expect(mockOnStepChange).toHaveBeenCalledWith(2);
  });

  // Add more tests for other steps and interactions
});
