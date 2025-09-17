// GraphQL types for the signup mutation and related operations

export interface User {
  email: string;
  firstName: string;
  groups: string[];
  id: string;
  isActive: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  lastName: string;
  profileImageUrl?: string;
}

export interface SignupResponse {
  register: User;
}

export interface SignupInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface SignupVariables {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

// Login types
export interface Tokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  login: {
    tokens: Tokens;
    user: User;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginVariables {
  email: string;
  password: string;
}

// Error types for form validation
export interface FieldError {
  field: string;
  message: string;
}

export interface SignupError {
  field?: string;
  message: string;
  code?: string;
}

// City types for the Cities GraphQL query
export interface Country {
  iso2: string;
  name: string;
  createdAt: string;
}

export interface City {
  id: string;
  name: string;
  country: Country;
  timezone: string;
  lat: number;
  lon: number;
  createdAt: string;
}

export interface CityFilter {
  searchCities?: string;
  country?: string;
  region?: string;
}

export interface CitiesResponse {
  cities: City[];
}

export interface CitiesVariables {
  filters?: CityFilter;
}

// Country types for the Countries GraphQL query
export interface Country {
  iso2: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CountryFilter {
  name?: {
    iContains?: string;    // Case-insensitive partial match on country name
    exact?: string;        // Exact match on country name
  };
  iso2?: {
    exact?: string;        // Exact match on ISO2 code
  };
}

export interface PaginationInput {
  limit?: number;          // Number of items per page (default: 20, max: 100)
  offset?: number;         // Number of items to skip (default: 0)
}

export interface SortInput {
  field: 'name' | 'iso2' | 'createdAt';
  direction: 'ASC' | 'DESC';
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
  currentPage: number;
}

export interface CountriesResponse {
  data: Country[];
  pagination: PaginationInfo;
}

export interface CountriesSimpleResponse {
  countries: Country[];
}

export interface CountriesVariables {
  filters?: CountryFilter;
  pagination?: PaginationInput;
  sort?: SortInput;
}

// Destination types for the Destinations GraphQL query
export interface Destination {
  id: string;
  title: string;
  description: string;
  heroImageUrl: string;
  highlights: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationFilter {
  searchDestinations?: string | null;
}

export interface DestinationsResponse {
  destinations: Destination[];
}

export interface DestinationsVariables {
  filters?: DestinationFilter;
}

