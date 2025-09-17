// Mock for graphql-request
export const gql = jest.fn((query) => query);

export const GraphQLClient = jest.fn().mockImplementation(() => ({
  request: jest.fn(),
  setHeader: jest.fn(),
  setHeaders: jest.fn(),
}));

export const ClientError = class ClientError extends Error {
  constructor(message, response) {
    super(message);
    this.name = 'ClientError';
    this.response = response;
  }
};

export default {
  gql,
  GraphQLClient,
  ClientError,
};
