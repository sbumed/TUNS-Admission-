import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { getAutocompleteSuggestions } from '../services/geminiService';

interface AIAutoCompleteInputProps {
    value: string;
    onValueChange: (value: string) => void;
    label: string;
    fieldType: 'school' | 'occupation';
    isRequired?: boolean;
    placeholder?: string;
    className?: string;
}

export const AIAutoCompleteInput: React.FC<AIAutoCompleteInputProps> = ({
    value,
    onValueChange,
    label,
    fieldType,
    isRequired = false,
    placeholder = '',
    className = ''
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const debouncedSearchTerm = useDebounce(inputValue, 400);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedSearchTerm) {
                setIsLoading(true);
                const results = await getAutocompleteSuggestions(debouncedSearchTerm, fieldType);
                setSuggestions(results);
                setIsLoading(false);
                setIsSuggestionsVisible(results.length > 0);
                setActiveIndex(-1);
            } else {
                setSuggestions([]);
                setIsSuggestionsVisible(false);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchTerm, fieldType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    const handleSelect = (selectedValue: string) => {
        setInputValue(selectedValue);
        onValueChange(selectedValue);
        setSuggestions([]);
        setIsSuggestionsVisible(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prevIndex => (prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
                e.preventDefault();
                handleSelect(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsSuggestionsVisible(false);
        }
    };
    
    const handleBlur = () => {
        // Delay hiding suggestions to allow click events to process
        setTimeout(() => {
            setIsSuggestionsVisible(false);
            if (value !== inputValue) {
                 onValueChange(inputValue);
            }
        }, 200);
    };

    const handleFocus = () => {
        if(suggestions.length > 0) {
            setIsSuggestionsVisible(true);
        }
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={handleFocus}
                required={isRequired}
                placeholder={placeholder}
                className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                autoComplete="off"
            />
            {isSuggestionsVisible && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <li className="p-3 text-gray-500">กำลังค้นหา...</li>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className={`p-3 cursor-pointer hover:bg-primary-light ${index === activeIndex ? 'bg-primary-light' : ''}`}
                                onMouseDown={() => handleSelect(suggestion)} // use onMouseDown to fire before onBlur
                            >
                                {suggestion}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};
