import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicPricingEstimate } from '../components/DynamicPricingEstimate';

// Mock the Convex hooks
jest.mock('convex/react', () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

describe('DynamicPricingEstimate', () => {
  const mockAssessment = {
    id: '1',
    images: ['https://example.com/image.jpg'],
    vehicleType: 'sedan',
    interiorCondition: 80,
    exteriorCondition: 70,
    services: ['wash'],
    availableServices: [
      { name: 'wash', price: 20 },
      { name: 'wax', price: 30 },
    ],
    basePrice: 100,
  };

  it('renders without crashing', () => {
    render(
      <DynamicPricingEstimate
        assessment={mockAssessment}
        onApprove={() => {}}
        onModify={() => {}}
      />
    );
    expect(screen.getByText('Dynamic Pricing Estimate')).toBeInTheDocument();
  });

  it('displays the correct base price', () => {
    render(
      <DynamicPricingEstimate
        assessment={mockAssessment}
        onApprove={() => {}}
        onModify={() => {}}
      />
    );
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  // Add more tests for user interactions, price calculations, etc.
});
