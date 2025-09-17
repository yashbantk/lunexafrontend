"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useCountriesSimple } from '@/hooks/useCountriesSearch';
import { Country } from '@/types/graphql';
import { Globe, Search, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountrySearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCountry?: (country: Country) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function CountrySearch({
  value,
  onChange,
  onSelectCountry,
  placeholder = "Search for a country...",
  label = "Country",
  required = false,
  className = ""
}: CountrySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { countries, loading, error, fetchCountries, clearResults } = useCountriesSimple();

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    if (newValue.trim()) {
      fetchCountries({ name: { iContains: newValue } });
      setIsOpen(true);
    } else {
      clearResults();
      setIsOpen(false);
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    const countryDisplayName = country.name;
    setInputValue(countryDisplayName);
    onChange(countryDisplayName);
    setIsOpen(false);
    clearResults();
    
    if (onSelectCountry) {
      onSelectCountry(country);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (countries.length > 0 || loading) {
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for country selection
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="country-search">{label}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id="country-search"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1"
          >
            <Card className="shadow-lg border border-gray-200 max-h-60 overflow-hidden">
              <CardContent className="p-0">
                {error ? (
                  <div className="p-4 text-center text-red-600">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                  </div>
                ) : countries.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {countries.map((country, index) => (
                      <motion.div
                        key={country.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => handleCountrySelect(country)}
                      >
                        <div className="flex items-center space-x-3">
                          <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {country.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {country.iso2}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : inputValue.trim() && !loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <Globe className="h-5 w-5 mx-auto mb-2" />
                    <p className="text-sm">No countries found</p>
                    <p className="text-xs">Try a different search term</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
