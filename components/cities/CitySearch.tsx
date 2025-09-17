"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useCitySearch } from '@/hooks/useCitySearch';
import { City } from '@/types/graphql';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CitySearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCity?: (city: City) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function CitySearch({
  value,
  onChange,
  onSelectCity,
  placeholder = "Search for a city...",
  label = "City",
  required = false,
  className = ""
}: CitySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { cities, loading, error, searchCities, clearResults } = useCitySearch();

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
      searchCities(newValue);
      setIsOpen(true);
    } else {
      clearResults();
      setIsOpen(false);
    }
  };

  // Handle city selection
  const handleCitySelect = (city: City) => {
    const cityDisplayName = `${city.name}, ${city.country.name}`;
    setInputValue(cityDisplayName);
    onChange(cityDisplayName);
    setIsOpen(false);
    clearResults();
    
    if (onSelectCity) {
      onSelectCity(city);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (cities.length > 0 || loading) {
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for city selection
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
        <Label htmlFor="city-search">{label}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id="city-search"
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
                ) : cities.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {cities.map((city, index) => (
                      <motion.div
                        key={city.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => handleCitySelect(city)}
                      >
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {city.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {city.country.name}
                              {city.timezone && ` • ${city.timezone}`}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : inputValue.trim() && !loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <MapPin className="h-5 w-5 mx-auto mb-2" />
                    <p className="text-sm">No cities found</p>
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
