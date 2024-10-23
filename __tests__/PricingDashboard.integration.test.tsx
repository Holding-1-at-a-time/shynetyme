import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingDashboard } from '../components/PricingDashboard';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

// Mock Convex client
const mockConvexClient = new ConvexReactClient('https://example.convex.cloud');

jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useMutation: jest.fn(),
  useAction: jest.fn(),
  useQuery: jest.fn(),
}));

describe('PricingDashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays pricing model data', async () => {
    const mockPricingModel = {
      basePrice: { sedan: 50, suv: 70 },
      surcharges: { luxurySurcharge: 20, filthinessFactor: 10 },
      services: { interiorCleaning: { name: 'Interior Cleaning', price: 30, enabled: true } },
      laborCost: 25,
      materialCost: 10,
    };

    require('convex/react').useQuery.mockReturnValue(mockPricingModel);

    render(
      <ConvexProvider client={mockConvexClient}>
        <PricingDashboard />
      </ConvexProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Sedan Base Price')).toHaveValue(50);
      expect(screen.getByLabelText('SUV Base Price')).toHaveValue(70);
    });
  });

  it('updates pricing model when form is submitted', async () => {
    const mockUpdatePricingModel = jest.fn();
    require('convex/react').useMutation.mockReturnValue(mockUpdatePricingModel);

    render(
      <ConvexProvider client={mockConvexClient}>
        <PricingDashboard />
      </ConvexProvider>
    );

    fireEvent.change(screen.getByLabelText('Sedan Base Price'), { target: { value: '60' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUpdatePricingModel).toHaveBeenCalledWith(expect.objectContaining({
        basePrice: expect.objectContaining({ sedan: 60 }),
      }));
    });
  });

  // Add more integration tests as needed
});
