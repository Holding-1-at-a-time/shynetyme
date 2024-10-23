import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingDashboard } from '../components/PricingDashboard';
import { ConvexProvider } from 'convex/react';
import { mockConvexClient } from './__mocks__/mockConvexClient';

jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useMutation: jest.fn(),
  useAction: jest.fn(),
  useQuery: jest.fn(),
}));

describe('PricingDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ConvexProvider client={mockConvexClient}>
        <PricingDashboard />
      </ConvexProvider>
    );
    expect(screen.getByText('Pricing Dashboard')).toBeInTheDocument();
  });

  it('displays pricing model inputs', () => {
    render(
      <ConvexProvider client={mockConvexClient}>
        <PricingDashboard />
      </ConvexProvider>
    );
    expect(screen.getByLabelText('Sedan Base Price')).toBeInTheDocument();
    expect(screen.getByLabelText('SUV Base Price')).toBeInTheDocument();
    // Add more assertions for other pricing inputs
  });

  it('updates pricing model when inputs change', async () => {
    const mockUpdatePricingModel = jest.fn();
    require('convex/react').useMutation.mockReturnValue(mockUpdatePricingModel);

    render(
      <ConvexProvider client={mockConvexClient}>
        <PricingDashboard />
      </ConvexProvider>
    );

    const sedanInput = screen.getByLabelText('Sedan Base Price');
    fireEvent.change(sedanInput, { target: { value: '60' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdatePricingModel).toHaveBeenCalled();
    });
  });

  // Add more tests for other functionalities
});
