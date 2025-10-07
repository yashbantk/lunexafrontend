import { render, screen } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { useParams } from 'next/navigation'
import ProposalDetailPage from '@/app/proposal/[id]/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}))

// Mock the useProposal hook
jest.mock('@/hooks/useProposal', () => ({
  useProposal: jest.fn(),
}))

// Mock the useToast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}))

const mockProposal = {
  id: 'proposal-1',
  version: 1,
  name: 'Test Proposal',
  status: 'draft',
  totalPriceCents: 100000,
  estimatedDateOfBooking: '2024-01-01',
  areFlightsBooked: false,
  flightsMarkup: 5,
  landMarkup: 10,
  landMarkupType: 'percentage',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  currency: {
    code: 'INR',
    name: 'Indian Rupee',
  },
  trip: {
    id: 'trip-1',
    status: 'draft',
    tripType: 'leisure',
    totalTravelers: 2,
    starRating: 4,
    transferOnly: false,
    landOnly: false,
    travelerDetails: {
      adults: 2,
      children: 0,
    },
    markupFlightPercent: 5,
    markupLandPercent: 10,
    bookingReference: 'REF123',
    startDate: '2024-01-01',
    endDate: '2024-01-05',
    durationDays: 4,
    org: {
      id: 'org-1',
      name: 'Test Organization',
      billingEmail: 'billing@test.com',
      logoUrl: null,
      address: '123 Test St',
      phone: '+1234567890',
      email: 'contact@test.com',
      website: 'https://test.com',
      taxNumber: 'TAX123',
      taxRate: 0.1,
    },
    createdBy: {
      id: 'user-1',
      email: 'user@test.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      countryCode: 'US',
      phone: '+1234567890',
      profileImageUrl: null,
    },
    customer: {
      id: 'customer-1',
      name: 'Jane Smith',
      email: 'jane@test.com',
      phone: '+1234567890',
      nationality: 'US',
    },
    fromCity: {
      id: 'city-1',
      name: 'New York',
      country: {
        iso2: 'US',
        name: 'United States',
      },
    },
    nationality: {
      iso2: 'US',
      name: 'United States',
    },
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        date: '2024-01-01',
        city: {
          id: 'city-2',
          name: 'Paris',
        },
        stay: {
          id: 'stay-1',
          room: {
            id: 'room-1',
            hotel: {
              id: 'hotel-1',
              name: 'Test Hotel',
              star: 4,
            },
            name: 'Deluxe Room',
          },
          nights: 1,
          mealPlan: 'BB',
        },
        activityBookings: [
          {
            id: 'activity-1',
            slot: 'morning',
            option: {
              id: 'option-1',
              activity: {
                id: 'activity-1',
                title: 'City Tour',
              },
              name: 'Morning City Tour',
              startTime: '09:00',
              durationMinutes: 120,
            },
          },
        ],
      },
    ],
  },
}

describe('ProposalDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
    mockUseParams.mockReturnValue({ id: 'proposal-1' })

    const { useProposal } = require('@/hooks/useProposal')
    useProposal.mockReturnValue({
      proposal: null,
      loading: true,
      error: null,
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProposalDetailPage />
      </MockedProvider>
    )

    expect(screen.getByText('Loading proposal...')).toBeInTheDocument()
  })

  it('renders error state', () => {
    const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
    mockUseParams.mockReturnValue({ id: 'proposal-1' })

    const { useProposal } = require('@/hooks/useProposal')
    useProposal.mockReturnValue({
      proposal: null,
      loading: false,
      error: 'Failed to load proposal',
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProposalDetailPage />
      </MockedProvider>
    )

    expect(screen.getByText('Error Loading Proposal')).toBeInTheDocument()
    expect(screen.getByText('Failed to load proposal')).toBeInTheDocument()
  })

  it('renders proposal not found state', () => {
    const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
    mockUseParams.mockReturnValue({ id: 'proposal-1' })

    const { useProposal } = require('@/hooks/useProposal')
    useProposal.mockReturnValue({
      proposal: null,
      loading: false,
      error: null,
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProposalDetailPage />
      </MockedProvider>
    )

    expect(screen.getByText('Proposal Not Found')).toBeInTheDocument()
  })

  it('renders proposal details when data is available', () => {
    const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
    mockUseParams.mockReturnValue({ id: 'proposal-1' })

    const { useProposal } = require('@/hooks/useProposal')
    useProposal.mockReturnValue({
      proposal: mockProposal,
      loading: false,
      error: null,
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProposalDetailPage />
      </MockedProvider>
    )

    expect(screen.getByText('Test Proposal')).toBeInTheDocument()
    expect(screen.getByText('DRAFT')).toBeInTheDocument()
    expect(screen.getByText('v1')).toBeInTheDocument()
    expect(screen.getByText('₹1,000.00')).toBeInTheDocument()
    expect(screen.getByText('New York • January 1, 2024 - January 5, 2024')).toBeInTheDocument()
    expect(screen.getByText('4 days • 2 travelers')).toBeInTheDocument()
  })

  it('renders itinerary details', () => {
    const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
    mockUseParams.mockReturnValue({ id: 'proposal-1' })

    const { useProposal } = require('@/hooks/useProposal')
    useProposal.mockReturnValue({
      proposal: mockProposal,
      loading: false,
      error: null,
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProposalDetailPage />
      </MockedProvider>
    )

    expect(screen.getByText('Day-by-Day Itinerary')).toBeInTheDocument()
    expect(screen.getByText('Day 1 - Paris')).toBeInTheDocument()
    expect(screen.getByText('Test Hotel')).toBeInTheDocument()
    expect(screen.getByText('City Tour')).toBeInTheDocument()
  })

  it('renders company information', () => {
    const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
    mockUseParams.mockReturnValue({ id: 'proposal-1' })

    const { useProposal } = require('@/hooks/useProposal')
    useProposal.mockReturnValue({
      proposal: mockProposal,
      loading: false,
      error: null,
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProposalDetailPage />
      </MockedProvider>
    )

    expect(screen.getByText('Company Information')).toBeInTheDocument()
    expect(screen.getByText('Test Organization')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders customer information', () => {
    const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
    mockUseParams.mockReturnValue({ id: 'proposal-1' })

    const { useProposal } = require('@/hooks/useProposal')
    useProposal.mockReturnValue({
      proposal: mockProposal,
      loading: false,
      error: null,
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProposalDetailPage />
      </MockedProvider>
    )

    expect(screen.getByText('Customer Details')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@test.com')).toBeInTheDocument()
  })

  it('renders price breakdown', () => {
    const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
    mockUseParams.mockReturnValue({ id: 'proposal-1' })

    const { useProposal } = require('@/hooks/useProposal')
    useProposal.mockReturnValue({
      proposal: mockProposal,
      loading: false,
      error: null,
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProposalDetailPage />
      </MockedProvider>
    )

    expect(screen.getByText('Price Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText('Taxes (10%)')).toBeInTheDocument()
    expect(screen.getByText('Markup (10%)')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })
})
