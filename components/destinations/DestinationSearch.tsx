"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useDestinationsSearch } from '@/hooks/useDestinationsSearch';
import { Destination } from '@/types/graphql';
import { MapPin, Search, Loader2, AlertCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface DestinationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelectDestination?: (destination: Destination) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function DestinationSearch({
  value,
  onChange,
  onSelectDestination,
  placeholder = "Search for a destination...",
  label = "Destination",
  required = false,
  className = ""
}: DestinationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { destinations, loading, error, searchDestinations, clearResults } = useDestinationsSearch();

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
      searchDestinations(newValue);
      setIsOpen(true);
    } else {
      clearResults();
      setIsOpen(false);
    }
  };

  // Handle destination selection
  const handleDestinationSelect = (destination: Destination) => {
    const destinationDisplayName = destination.title;
    setInputValue(destinationDisplayName);
    onChange(destinationDisplayName);
    setIsOpen(false);
    clearResults();
    
    if (onSelectDestination) {
      onSelectDestination(destination);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (destinations.length > 0 || loading) {
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for destination selection
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
        <Label htmlFor="destination-search">{label}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id="destination-search"
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
            <Card className="shadow-lg border border-gray-200 max-h-80 overflow-hidden">
              <CardContent className="p-0">
                {error ? (
                  <div className="p-4 text-center text-red-600">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                  </div>
                ) : destinations.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {destinations.map((destination, index) => (
                      <motion.div
                        key={destination.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => handleDestinationSelect(destination)}
                      >
                        <div className="flex items-start space-x-3">
                          {destination.heroImageUrl && (
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={destination.heroImageUrl}
                                alt={destination.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {destination.title}
                              </p>
                              {destination.isFeatured && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                              {destination.description}
                            </p>
                            {destination.highlights && destination.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {destination.highlights.slice(0, 3).map((highlight, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {highlight}
                                  </span>
                                ))}
                                {destination.highlights.length > 3 && (
                                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    +{destination.highlights.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : inputValue.trim() && !loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <MapPin className="h-5 w-5 mx-auto mb-2" />
                    <p className="text-sm">No destinations found</p>
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
