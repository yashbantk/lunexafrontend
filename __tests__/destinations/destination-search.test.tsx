import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DestinationSearch } from '@/components/destinations/DestinationSearch';
import { useDestinationsSearch } from '@/hooks/useDestinationsSearch';

// Mock the useDestinationsSearch hook
jest.mock('@/hooks/useDestinationsSearch');
const mockUseDestinationsSearch = useDestinationsSearch as jest.MockedFunction<typeof useDestinationsSearch>;

describe('DestinationSearch Component', () => {
  const mockProps = {
    value: '',
    onChange: jest.fn(),
    onSelectDestination: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input with correct placeholder', () => {
    mockUseDestinationsSearch.mockReturnValue({
      destinations: [],
      loading: false,
      error: null,
      searchDestinations: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<DestinationSearch {...mockProps} placeholder="Search for a destination..." />);
    
    expect(screen.getByPlaceholderText('Search for a destination...')).toBeInTheDocument();
  });

  it('calls onChange when user types in the input', () => {
    mockUseDestinationsSearch.mockReturnValue({
      destinations: [],
      loading: false,
      error: null,
      searchDestinations: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<DestinationSearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Paris' } });
    
    expect(mockProps.onChange).toHaveBeenCalledWith('Paris');
  });

  it('shows loading state when searching', () => {
    mockUseDestinationsSearch.mockReturnValue({
      destinations: [],
      loading: true,
      error: null,
      searchDestinations: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<DestinationSearch {...mockProps} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Loading spinner should be present
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays destination results when available', async () => {
    const mockDestinations = [
      { 
        id: '1',
        title: 'Paris', 
        description: 'The City of Light',
        heroImageUrl: 'https://example.com/paris.jpg',
        highlights: ['Eiffel Tower', 'Louvre Museum'],
        isFeatured: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
      { 
        id: '2',
        title: 'Miami', 
        description: 'Beautiful beaches and nightlife',
        heroImageUrl: 'https://example.com/miami.jpg',
        highlights: ['South Beach', 'Art Deco'],
        isFeatured: false,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
    ];

    mockUseDestinationsSearch.mockReturnValue({
      destinations: mockDestinations,
      loading: false,
      error: null,
      searchDestinations: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<DestinationSearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('Miami')).toBeInTheDocument();
    });
  });

  it('calls onSelectDestination when a destination is clicked', async () => {
    const mockDestinations = [
      { 
        id: '1',
        title: 'Paris', 
        description: 'The City of Light',
        heroImageUrl: 'https://example.com/paris.jpg',
        highlights: ['Eiffel Tower', 'Louvre Museum'],
        isFeatured: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
    ];

    mockUseDestinationsSearch.mockReturnValue({
      destinations: mockDestinations,
      loading: false,
      error: null,
      searchDestinations: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<DestinationSearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    await waitFor(() => {
      const parisOption = screen.getByText('Paris');
      fireEvent.click(parisOption);
    });
    
    expect(mockProps.onSelectDestination).toHaveBeenCalledWith(mockDestinations[0]);
  });

  it('displays error message when there is an error', async () => {
    mockUseDestinationsSearch.mockReturnValue({
      destinations: [],
      loading: false,
      error: 'Failed to fetch destinations',
      searchDestinations: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<DestinationSearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Paris' } });
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch destinations')).toBeInTheDocument();
    });
  });

  it('shows no results message when no destinations are found', () => {
    mockUseDestinationsSearch.mockReturnValue({
      destinations: [],
      loading: false,
      error: null,
      searchDestinations: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<DestinationSearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'NonExistentDestination' } });
    fireEvent.focus(input);
    
    expect(screen.getByText('No destinations found')).toBeInTheDocument();
  });

  it('displays destination details correctly', async () => {
    const mockDestinations = [
      { 
        id: '1',
        title: 'Paris', 
        description: 'The City of Light',
        heroImageUrl: 'https://example.com/paris.jpg',
        highlights: ['Eiffel Tower', 'Louvre Museum'],
        isFeatured: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
    ];

    mockUseDestinationsSearch.mockReturnValue({
      destinations: mockDestinations,
      loading: false,
      error: null,
      searchDestinations: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<DestinationSearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('The City of Light')).toBeInTheDocument();
      expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
      expect(screen.getByText('Louvre Museum')).toBeInTheDocument();
    });
  });
});
