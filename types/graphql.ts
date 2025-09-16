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

