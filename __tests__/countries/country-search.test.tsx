import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CountrySearch } from '@/components/countries/CountrySearch';
import { useCountriesSimple } from '@/hooks/useCountriesSearch';

// Mock the useCountriesSimple hook
jest.mock('@/hooks/useCountriesSearch');
const mockUseCountriesSimple = useCountriesSimple as jest.MockedFunction<typeof useCountriesSimple>;

describe('CountrySearch Component', () => {
  const mockProps = {
    value: '',
    onChange: jest.fn(),
    onSelectCountry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input with correct placeholder', () => {
    mockUseCountriesSimple.mockReturnValue({
      countries: [],
      loading: false,
      error: null,
      fetchCountries: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CountrySearch {...mockProps} placeholder="Search for a country..." />);
    
    expect(screen.getByPlaceholderText('Search for a country...')).toBeInTheDocument();
  });

  it('calls onChange when user types in the input', () => {
    mockUseCountriesSimple.mockReturnValue({
      countries: [],
      loading: false,
      error: null,
      fetchCountries: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CountrySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'United States' } });
    
    expect(mockProps.onChange).toHaveBeenCalledWith('United States');
  });

  it('shows loading state when searching', () => {
    mockUseCountriesSimple.mockReturnValue({
      countries: [],
      loading: true,
      error: null,
      fetchCountries: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CountrySearch {...mockProps} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Loading spinner should be present
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays country results when available', async () => {
    const mockCountries = [
      { 
        name: 'United States', 
        iso2: 'US',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
      { 
        name: 'Canada', 
        iso2: 'CA',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
    ];

    mockUseCountriesSimple.mockReturnValue({
      countries: mockCountries,
      loading: false,
      error: null,
      fetchCountries: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CountrySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  it('calls onSelectCountry when a country is clicked', async () => {
    const mockCountries = [
      { 
        name: 'United States', 
        iso2: 'US',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
    ];

    mockUseCountriesSimple.mockReturnValue({
      countries: mockCountries,
      loading: false,
      error: null,
      fetchCountries: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CountrySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    await waitFor(() => {
      const countryOption = screen.getByText('United States');
      fireEvent.click(countryOption);
    });
    
    expect(mockProps.onSelectCountry).toHaveBeenCalledWith(mockCountries[0]);
  });

  it('displays error message when there is an error', async () => {
    mockUseCountriesSimple.mockReturnValue({
      countries: [],
      loading: false,
      error: 'Failed to fetch countries',
      fetchCountries: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CountrySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'United States' } });
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch countries')).toBeInTheDocument();
    });
  });

  it('shows no results message when no countries are found', () => {
    mockUseCountriesSimple.mockReturnValue({
      countries: [],
      loading: false,
      error: null,
      fetchCountries: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CountrySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'NonExistentCountry' } });
    fireEvent.focus(input);
    
    expect(screen.getByText('No countries found')).toBeInTheDocument();
  });

  it('displays country details correctly', async () => {
    const mockCountries = [
      { 
        name: 'United States', 
        iso2: 'US',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
    ];

    mockUseCountriesSimple.mockReturnValue({
      countries: mockCountries,
      loading: false,
      error: null,
      fetchCountries: jest.fn(),
      clearResults: jest.fn(),
    });

    render(<CountrySearch {...mockProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('US')).toBeInTheDocument();
    });
  });
});
