import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SelfAssessmentForm } from '@/components/SelfAssessmentForm'
import { vi } from 'vitest'
import { ConvexProvider } from 'convex/react'
import { mockConvexClient } from '../mocks/convex'

describe('SelfAssessmentForm', () => {
  const mockAssessment = {
    userId: 'user123',
    clientName: 'Test User',
    images: [],
    vehicleType: 'sedan' as const,
    description: '',
    interiorCondition: 50,
    exteriorCondition: 50,
  }

  const mockProps = {
    step: 1,
    assessment: mockAssessment,
    onStepChange: vi.fn(),
    onAssessmentChange: vi.fn(),
    onAssessmentComplete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all steps correctly', () => {
    render(
      <ConvexProvider client={mockConvexClient}>
        <SelfAssessmentForm {...mockProps} />
      </ConvexProvider>
    )

    // Step 1: Image Upload
    expect(screen.getByText(/Upload Vehicle Images/i)).toBeInTheDocument()

    // Move to Step 2
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText(/Vehicle Details/i)).toBeInTheDocument()

    // Move to Step 3
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText(/Vehicle Condition/i)).toBeInTheDocument()
  })

  it('validates each step before proceeding', async () => {
    render(
      <ConvexProvider client={mockConvexClient}>
        <SelfAssessmentForm {...mockProps} />
      </ConvexProvider>
    )

    // Step 1: Should not proceed without images
    fireEvent.click(screen.getByText('Next'))
    expect(await screen.findByText(/Please complete all required fields/i)).toBeInTheDocument()

    // Add image and proceed
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByTestId('image-upload')
    fireEvent.change(input, { target: { files: [mockFile] } })
    
    fireEvent.click(screen.getByText('Next'))
    expect(mockProps.onStepChange).toHaveBeenCalledWith(2)
  })

  // ... more test cases ...
})
