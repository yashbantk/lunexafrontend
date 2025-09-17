# Countries GraphQL Query Examples

This document provides comprehensive examples for querying countries using the GraphQL API with flexible filtering, pagination, and sorting capabilities.

## 📋 Query Structure

### Full Query with Pagination
```graphql
query Countries(
  $filters: CountryFilter
  $pagination: PaginationInput
  $sort: SortInput
) {
  countries(
    filters: $filters
    pagination: $pagination
    sort: $sort
  ) {
    data {
      id
      iso2
      iso3
      name
      continentCode
      currencyCode
      createdAt
      updatedAt
    }
    pagination {
      total
      limit
      offset
      hasNextPage
      hasPreviousPage
      totalPages
      currentPage
    }
  }
}
```

### Simple Query (No Pagination)
```graphql
query CountriesSimple($filters: CountryFilter) {
  countries(filters: $filters) {
    id
    iso2
    iso3
    name
    continentCode
    currencyCode
    createdAt
    updatedAt
  }
}
```

## 🔍 Filtering Examples

### 1. Filter by Name (Partial Match)
**Use Case**: Search for countries containing "united" in their name

```json
{
  "filters": {
    "name": "united"
  }
}
```

**Expected Results**: United States, United Kingdom, United Arab Emirates, etc.

### 2. Filter by ISO2 Code (Exact Match)
**Use Case**: Get specific country by ISO2 code

```json
{
  "filters": {
    "iso2": "US"
  }
}
```

**Expected Results**: United States only

### 3. Filter by ISO3 Code (Exact Match)
**Use Case**: Get specific country by ISO3 code

```json
{
  "filters": {
    "iso3": "USA"
  }
}
```

**Expected Results**: United States only

### 4. Filter by Continent Code (Multiple Values)
**Use Case**: Get all countries in Europe and Asia

```json
{
  "filters": {
    "continentCode": ["EU", "AS"]
  }
}
```

**Expected Results**: All countries in Europe and Asia

### 5. Filter by Currency Code (Single Value)
**Use Case**: Get all countries using the Euro

```json
{
  "filters": {
    "currencyCode": "EUR"
  }
}
```

**Expected Results**: All Eurozone countries

### 6. Combined Filters
**Use Case**: Get European countries with "land" in their name

```json
{
  "filters": {
    "name": "land",
    "continentCode": ["EU"]
  }
}
```

**Expected Results**: Finland, Iceland, Ireland, Netherlands, Poland, Switzerland, etc.

## 📄 Pagination Examples

### 1. Basic Pagination
**Use Case**: Get first 10 countries

```json
{
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

### 2. Second Page
**Use Case**: Get next 10 countries (page 2)

```json
{
  "pagination": {
    "limit": 10,
    "offset": 10
  }
}
```

### 3. Large Page Size
**Use Case**: Get 50 countries at once

```json
{
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

### 4. Pagination with Filters
**Use Case**: Get first 5 European countries

```json
{
  "filters": {
    "continentCode": ["EU"]
  },
  "pagination": {
    "limit": 5,
    "offset": 0
  }
}
```

## 🔄 Sorting Examples

### 1. Sort by Name (Ascending)
**Use Case**: Get countries sorted alphabetically by name

```json
{
  "sort": {
    "field": "name",
    "direction": "ASC"
  }
}
```

### 2. Sort by Name (Descending)
**Use Case**: Get countries sorted reverse alphabetically

```json
{
  "sort": {
    "field": "name",
    "direction": "DESC"
  }
}
```

### 3. Sort by ISO2 Code
**Use Case**: Get countries sorted by ISO2 code

```json
{
  "sort": {
    "field": "iso2",
    "direction": "ASC"
  }
}
```

### 4. Sort by Continent Code
**Use Case**: Group countries by continent

```json
{
  "sort": {
    "field": "continentCode",
    "direction": "ASC"
  }
}
```

### 5. Sort by Creation Date (Newest First)
**Use Case**: Get recently added countries first

```json
{
  "sort": {
    "field": "createdAt",
    "direction": "DESC"
  }
}
```

## 🎯 Complete Examples

### Example 1: Search for European Countries with Euro Currency
```json
{
  "filters": {
    "continentCode": ["EU"],
    "currencyCode": "EUR"
  },
  "pagination": {
    "limit": 20,
    "offset": 0
  },
  "sort": {
    "field": "name",
    "direction": "ASC"
  }
}
```

### Example 2: Get Asian Countries Starting with "C"
```json
{
  "filters": {
    "name": "c",
    "continentCode": ["AS"]
  },
  "pagination": {
    "limit": 10,
    "offset": 0
  },
  "sort": {
    "field": "name",
    "direction": "ASC"
  }
}
```

### Example 3: Get Countries Using USD Currency (Paginated)
```json
{
  "filters": {
    "currencyCode": "USD"
  },
  "pagination": {
    "limit": 15,
    "offset": 30
  },
  "sort": {
    "field": "iso2",
    "direction": "ASC"
  }
}
```

### Example 4: Get All Countries in North America and South America
```json
{
  "filters": {
    "continentCode": ["NA", "SA"]
  },
  "pagination": {
    "limit": 50,
    "offset": 0
  },
  "sort": {
    "field": "continentCode",
    "direction": "ASC"
  }
}
```

### Example 5: Search for Countries with "Island" in Name
```json
{
  "filters": {
    "name": "island"
  },
  "pagination": {
    "limit": 25,
    "offset": 0
  },
  "sort": {
    "field": "name",
    "direction": "ASC"
  }
}
```

## 📊 Response Structure

### Paginated Response
```json
{
  "data": {
    "countries": {
      "data": [
        {
          "id": "1",
          "iso2": "US",
          "iso3": "USA",
          "name": "United States",
          "continentCode": "NA",
          "currencyCode": "USD",
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2023-01-01T00:00:00Z"
        }
      ],
      "pagination": {
        "total": 195,
        "limit": 20,
        "offset": 0,
        "hasNextPage": true,
        "hasPreviousPage": false,
        "totalPages": 10,
        "currentPage": 1
      }
    }
  }
}
```

### Simple Response
```json
{
  "data": {
    "countries": [
      {
        "id": "1",
        "iso2": "US",
        "iso3": "USA",
        "name": "United States",
        "continentCode": "NA",
        "currencyCode": "USD",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
      }
    ]
  }
}
```

## 🚀 Performance Optimization Tips

### 1. Use Appropriate Page Sizes
- **Small datasets**: Use limit 10-20
- **Large datasets**: Use limit 50-100
- **Maximum**: 100 items per page

### 2. Efficient Filtering
- **Exact matches** (iso2, iso3, currencyCode) are faster than partial matches
- **Multiple continent codes** are efficient for geographic filtering
- **Combine filters** to narrow down results

### 3. Smart Sorting
- **Indexed fields** (iso2, iso3) sort faster than text fields
- **Use sorting** to group related countries together
- **Consider caching** sorted results for frequently accessed data

### 4. Pagination Strategy
- **Offset-based pagination** for random access
- **Use hasNextPage/hasPreviousPage** for UI navigation
- **Cache first page** for better performance

## 🔧 Error Handling

### Common Error Scenarios
1. **Invalid filter values**: Check ISO codes and continent codes
2. **Pagination limits**: Ensure limit ≤ 100 and offset ≥ 0
3. **Invalid sort fields**: Use only supported field names
4. **Empty results**: Handle gracefully in UI

### Error Response Example
```json
{
  "data": null,
  "errors": [
    {
      "message": "Invalid continent code: 'XX'",
      "locations": [{"line": 2, "column": 3}],
      "path": ["countries"]
    }
  ]
}
```

## 📝 Usage in TypeScript

### Basic Usage
```typescript
import { gqlRequest } from '@/lib/graphql/client';
import { COUNTRIES_QUERY } from '@/graphql/queries/countries';
import { CountriesVariables, CountriesResponse } from '@/types/graphql';

const variables: CountriesVariables = {
  filters: {
    continentCode: ['EU'],
    currencyCode: 'EUR'
  },
  pagination: {
    limit: 20,
    offset: 0
  },
  sort: {
    field: 'name',
    direction: 'ASC'
  }
};

const response = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);
```

### With Error Handling
```typescript
try {
  const response = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);
  console.log('Countries:', response.countries.data);
  console.log('Pagination:', response.countries.pagination);
} catch (error) {
  console.error('Failed to fetch countries:', error);
}
```

This comprehensive query system provides flexible, efficient, and scalable access to country data with proper filtering, pagination, and sorting capabilities.
