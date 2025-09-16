// GraphQL mutations for user operations

export const SIGNUP_MUTATION = `
  mutation MyMutation($firstName: String = "", $email: String = "", $lastName: String = "", $password: String = "") {
    register(
      input: {email: $email, password: $password, lastName: $lastName, firstName: $firstName}
    ) {
      email
      firstName
      groups
      id
      isActive
      isStaff
      isSuperuser
      lastName
      profileImageUrl
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation MyMutation($email: String = "", $password: String = "") {
    login(input: {email: $email, password: $password}) {
      tokens {
        access
        refresh
      }
      user {
        email
        firstName
        groups
        id
        isActive
        isStaff
        isSuperuser
        lastName
        profileImageUrl
      }
    }
  }
`;

