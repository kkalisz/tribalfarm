import React, { useState, useRef, useEffect, forwardRef } from "react";
import {
  Box,
  Input,
  List,
  ListItem,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Icon,
  Text,
  useOutsideClick
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { AutocompleteProps, AutocompleteOption } from "./types";
import {useShadowDomOutsideClick} from "@pages/content/hooks/useShadowDomOutsideClick";

/**
 * Autocomplete Component
 * 
 * A component that combines an input with a dropdown list of options that
 * filters as the user types, styled with the Tribal Wars aesthetic.
 */
const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(({
  options,
  value = "",
  onChange,
  placeholder = "Select an option",
  label,
  helperText,
  errorMessage,
  isInvalid,
  size = "md",
  isDisabled = false,
  noOptionsMessage = "No options found",
  filterOption,
  ...rest
}, ref) => {
  // State for input value, dropdown visibility, and filtered options
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  
  // Refs for component elements
  const componentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Close dropdown when clicking outside
  useShadowDomOutsideClick({
    ref: componentRef,
    handler: () => setIsOpen(false),
    enabled: isOpen,
  });

  // Common styles for input
  const inputStyles = {
    bg: "tribal.primaryBg",
    color: "tribal.primaryText",
    borderColor: "tribal.primaryBorder",
    borderWidth: "2px",
    borderRadius: "md",
    fontFamily: "body",
    _hover: {
      borderColor: "tribal.accent",
    },
    _focus: {
      borderColor: "tribal.accent",
      boxShadow: "0 0 0 1px var(--chakra-colors-tribal-accent)",
    },
    _placeholder: {
      color: "tribal.secondaryText",
      opacity: 0.7,
    },
    _invalid: {
      borderColor: "tribal.error",
      boxShadow: "0 0 0 1px var(--chakra-colors-tribal-error)",
    },
  };

  // Dropdown styles
  const dropdownStyles = {
    position: "absolute",
    width: "100%",
    zIndex: 10,
    mt: "2px",
    bg: "tribal.primaryBg",
    borderColor: "tribal.primaryBorder",
    borderWidth: "2px",
    borderRadius: "md",
    boxShadow: "md",
    maxHeight: "200px",
    overflowY: "auto",
  };

  // Label styles
  const labelStyles = {
    color: "tribal.primaryText",
    fontFamily: "heading",
    fontSize: size === "md" ? "sm" : "xs",
    fontWeight: "bold",
    mb: 1,
  };

  // Helper text styles
  const helperTextStyles = {
    color: "tribal.secondaryText",
    fontSize: "xs",
    mt: 1,
  };

  // Error message styles
  const errorStyles = {
    color: "tribal.error",
    fontSize: "xs",
    mt: 1,
  };

  // Update input value when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      const selectedOption = options.find(option => option.value === value);
      setInputValue(selectedOption ? selectedOption.label : value);
    }
  }, [value, options]);

  // Filter options when input value changes
  useEffect(() => {
    if (filterOption) {
      setFilteredOptions(options.filter(option => filterOption(option, inputValue)));
    } else {
      setFilteredOptions(
        options.filter(option => 
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    }
  }, [inputValue, options, filterOption]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle option selection
  const handleSelectOption = (option: AutocompleteOption) => {
    setInputValue(option.label);
    setIsOpen(false);
    onChange(option.value, option);
  };
  
  // Highlight matching text in option label
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) {
      return text;
    }
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <Text as="span" fontWeight="bold" color="tribal.secondaryText" key={index}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (!isDisabled) {
      setIsOpen(true);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    }
  };

  return (
    <Box ref={componentRef} position="relative" width="100%">
      <FormControl isInvalid={isInvalid}>
        {label && <FormLabel sx={labelStyles}>{label}</FormLabel>}
        
        <InputGroup>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            isDisabled={isDisabled}
            sx={inputStyles}
            {...rest}
          />
          <InputRightElement
            children={
              <Icon
                as={isOpen ? ChevronUpIcon : ChevronDownIcon}
                color="tribal.primaryBorder"
                cursor={isDisabled ? "not-allowed" : "pointer"}
                onClick={toggleDropdown}
              />
            }
          />
        </InputGroup>
        
        {isOpen && (
          <Box sx={dropdownStyles}>
            <List>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <ListItem
                    key={option.value}
                    px={3}
                    py={2}
                    cursor="pointer"
                    bg={index === highlightedIndex ? "tribal.accent" : "transparent"}
                    color={index === highlightedIndex ? "white" : "tribal.primaryText"}
                    _hover={{
                      bg: "tribal.accent",
                      color: "white",
                    }}
                    onClick={() => handleSelectOption(option)}
                  >
                    {highlightMatch(option.label, inputValue)}
                  </ListItem>
                ))
              ) : (
                <ListItem px={3} py={2} color="tribal.secondaryText">
                  {noOptionsMessage}
                </ListItem>
              )}
            </List>
          </Box>
        )}
        
        {helperText && !isInvalid && (
          <FormHelperText sx={helperTextStyles}>{helperText}</FormHelperText>
        )}
        {errorMessage && isInvalid && (
          <FormErrorMessage sx={errorStyles}>{errorMessage}</FormErrorMessage>
        )}
      </FormControl>
    </Box>
  );
});

Autocomplete.displayName = "Autocomplete";

export default Autocomplete;