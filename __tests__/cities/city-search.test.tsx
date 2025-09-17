import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CitySearch } from '@/components/cities/CitySearch';
import { useCitySearch } from '@/hooks/useCitySearch';

// Mock the useCitySearch hook
jest.mock('@/hooks/useCitySearch');
const mockUseCitySearch = useCitySearch as jest.MockedFunction<typeof useCitySearch>;

describe('CitySearch Component', () => {
  const mockProps = {
    value: '',
    onChange: jest.fn(),
    onSelectCity: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input with correct placeholder', () => {
    mockUseCitySearch.mockReturnValue({
      cities: [],
      loading: false,
      error: null,
      searchCities: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CitySearch {...mockProps} placeholder="Search for a city..." />);
    
    expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
  });

  it('calls onChange when user types in the input', () => {
    mockUseCitySearch.mockReturnValue({
      cities: [],
      loading: false,
      error: null,
      searchCities: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CitySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Paris' } });
    
    expect(mockProps.onChange).toHaveBeenCalledWith('Paris');
  });

  it('shows loading state when searching', () => {
    mockUseCitySearch.mockReturnValue({
      cities: [],
      loading: true,
      error: null,
      searchCities: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CitySearch {...mockProps} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Loading spinner should be present
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays city results when available', async () => {
    const mockCities = [
      { 
        id: '1', 
        name: 'Paris', 
        country: { iso2: 'FR', name: 'France', createdAt: '2023-01-01' },
        timezone: 'Europe/Paris',
        lat: 48.8566,
        lon: 2.3522,
        createdAt: '2023-01-01'
      },
      { 
        id: '2', 
        name: 'London', 
        country: { iso2: 'GB', name: 'United Kingdom', createdAt: '2023-01-01' },
        timezone: 'Europe/London',
        lat: 51.5074,
        lon: -0.1278,
        createdAt: '2023-01-01'
      },
    ];

    mockUseCitySearch.mockReturnValue({
      cities: mockCities,
      loading: false,
      error: null,
      searchCities: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CitySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
    });
  });

  it('calls onSelectCity when a city is clicked', async () => {
    const mockCities = [
      { 
        id: '1', 
        name: 'Paris', 
        country: { iso2: 'FR', name: 'France', createdAt: '2023-01-01' },
        timezone: 'Europe/Paris',
        lat: 48.8566,
        lon: 2.3522,
        createdAt: '2023-01-01'
      },
    ];

    mockUseCitySearch.mockReturnValue({
      cities: mockCities,
      loading: false,
      error: null,
      searchCities: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CitySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    await waitFor(() => {
      const parisOption = screen.getByText('Paris');
      fireEvent.click(parisOption);
    });
    
    expect(mockProps.onSelectCity).toHaveBeenCalledWith(mockCities[0]);
  });

  it('displays error message when there is an error', async () => {
    mockUseCitySearch.mockReturnValue({
      cities: [],
      loading: false,
      error: 'Failed to fetch cities',
      searchCities: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CitySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Paris' } });
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch cities')).toBeInTheDocument();
    });
  });

  it('shows no results message when no cities are found', () => {
    mockUseCitySearch.mockReturnValue({
      cities: [],
      loading: false,
      error: null,
      searchCities: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CitySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'NonExistentCity' } });
    fireEvent.focus(input);
    
    expect(screen.getByText('No cities found')).toBeInTheDocument();
  });
});
