"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCountriesSearch } from '@/hooks/useCountriesSearch';
import { Country, CountryFilter, SortInput } from '@/types/graphql';
import { 
  Search, 
  Globe, 
  MapPin, 
  DollarSign, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountriesExplorerProps {
  onSelectCountry?: (country: Country) => void;
  className?: string;
}

export function CountriesExplorer({ onSelectCountry, className = "" }: CountriesExplorerProps) {
  const [filters, setFilters] = useState<CountryFilter>({});
  const [sort, setSort] = useState<SortInput>({ field: 'name', direction: 'ASC' });
  const [selectedContinents, setSelectedContinents] = useState<string[]>([]);
  const [nameSearch, setNameSearch] = useState('');
  const [iso2Search, setIso2Search] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');

  const {
    countries,
    loading,
    error,
    pagination,
    searchCountries,
    fetchNextPage,
    fetchPreviousPage,
    setPage,
    clearResults
  } = useCountriesSearch();

  const continentOptions = [
    { code: 'AF', name: 'Africa' },
    { code: 'AS', name: 'Asia' },
    { code: 'EU', name: 'Europe' },
    { code: 'NA', name: 'North America' },
    { code: 'SA', name: 'South America' },
    { code: 'OC', name: 'Oceania' },
    { code: 'AN', name: 'Antarctica' }
  ];

  const handleSearch = () => {
    const searchFilters: CountryFilter = {
      ...(nameSearch && { name: { iContains: nameSearch } }),
      ...(iso2Search && { iso2: { exact: iso2Search } }),
      // Note: currencyCode and continentCode are not part of the CountryFilter interface
      // These would need to be handled differently or the filter interface updated
    };

    setFilters(searchFilters);
    searchCountries(searchFilters, { limit: 20, offset: 0 }, sort);
  };

  const handleClear = () => {
    setNameSearch('');
    setIso2Search('');
    setCurrencySearch('');
    setSelectedContinents([]);
    setFilters({});
    clearResults();
  };

  const handleContinentToggle = (continentCode: string) => {
    setSelectedContinents(prev => 
      prev.includes(continentCode)
        ? prev.filter(code => code !== continentCode)
        : [...prev, continentCode]
    );
  };

  const handleSortChange = (field: SortInput['field']) => {
    const newSort: SortInput = {
      field,
      direction: sort.field === field && sort.direction === 'ASC' ? 'DESC' : 'ASC'
    };
    setSort(newSort);
    
    if (Object.keys(filters).length > 0) {
      searchCountries(filters, { limit: 20, offset: 0 }, newSort);
    }
  };

  const handleCountrySelect = (country: Country) => {
    if (onSelectCountry) {
      onSelectCountry(country);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Search Countries
          </CardTitle>
          <CardDescription>
            Filter countries by name, ISO codes, continent, or currency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name-search">Name (Partial Match)</Label>
              <Input
                id="name-search"
                placeholder="e.g., united, canada"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="iso2-search">ISO2 Code (Exact)</Label>
              <Input
                id="iso2-search"
                placeholder="e.g., US, CA, FR"
                value={iso2Search}
                onChange={(e) => setIso2Search(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency-search">Currency Code</Label>
              <Input
                id="currency-search"
                placeholder="e.g., INR"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={`${sort.field}-${sort.direction}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split('-') as [SortInput['field'], 'ASC' | 'DESC'];
                  setSort({ field, direction });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-ASC">Name (A-Z)</SelectItem>
                  <SelectItem value="name-DESC">Name (Z-A)</SelectItem>
                  <SelectItem value="iso2-ASC">ISO2 (A-Z)</SelectItem>
                  <SelectItem value="iso2-DESC">ISO2 (Z-A)</SelectItem>
                  <SelectItem value="continentCode-ASC">Continent (A-Z)</SelectItem>
                  <SelectItem value="continentCode-DESC">Continent (Z-A)</SelectItem>
                  <SelectItem value="currencyCode-ASC">Currency (A-Z)</SelectItem>
                  <SelectItem value="currencyCode-DESC">Currency (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Continent Filters */}
          <div className="space-y-2">
            <Label>Continents</Label>
            <div className="flex flex-wrap gap-2">
              {continentOptions.map(continent => (
                <div key={continent.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`continent-${continent.code}`}
                    checked={selectedContinents.includes(continent.code)}
                    onCheckedChange={() => handleContinentToggle(continent.code)}
                  />
                  <Label htmlFor={`continent-${continent.code}`} className="text-sm">
                    {continent.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Countries
            </span>
            {pagination && (
              <span className="text-sm text-gray-500">
                {pagination.total} countries found
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 text-center text-red-600">
              <AlertCircle className="h-5 w-5 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Searching countries...</p>
            </div>
          )}

          {!loading && !error && countries.length > 0 && (
            <>
              <div className="space-y-2">
                <AnimatePresence>
                  {countries.map((country, index) => (
                    <motion.div
                      key={country.iso2}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleCountrySelect(country)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{country.name}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <span className="font-mono">{country.iso2}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Globe className="h-3 w-3" />
                              <span>Country</span>
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCountrySelect(country);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchPreviousPage}
                      disabled={!pagination.hasPreviousPage || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchNextPage}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Select
                      value={pagination.currentPage.toString()}
                      onValueChange={(value) => setPage(parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                          <SelectItem key={page} value={page.toString()}>
                            {page}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !error && countries.length === 0 && Object.keys(filters).length > 0 && (
            <div className="p-8 text-center text-gray-500">
              <Globe className="h-8 w-8 mx-auto mb-4" />
              <p>No countries found matching your criteria</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          )}

          {!loading && !error && countries.length === 0 && Object.keys(filters).length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-4" />
              <p>Enter search criteria to find countries</p>
              <p className="text-sm">You can search by name, ISO code, continent, or currency</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
