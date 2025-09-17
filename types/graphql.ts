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

