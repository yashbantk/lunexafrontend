import { gql } from '@apollo/client'

export const GET_USER_ORG = gql`
  query GetUserOrg($id: ID!) {
    user(id: $id) {
      id
      org {
        id
        name
      }
    }
  }
`

