import { InputProps } from "@chakra-ui/react";

/**
 * Option interface for Autocomplete component
 */
export interface AutocompleteOption {
  value: string;
  label: string;
}

/**
 * Autocomplete Component Props
 * 
 * @param options - Array of options to display in the dropdown
 * @param value - Currently selected value
 * @param onChange - Function called when a value is selected
 * @param placeholder - Placeholder text for the input
 * @param label - Optional label for the input
 * @param helperText - Optional helper text to display below the input
 * @param errorMessage - Optional error message to display when input is invalid
 * @param isInvalid - Whether the input is invalid
 * @param size - Input size: "md" (default), "sm", or "xs"
 * @param isDisabled - Whether the input is disabled
 * @param noOptionsMessage - Message to display when no options match the input
 * @param filterOption - Custom function to filter options based on input value
 */
export interface AutocompleteProps extends Omit<InputProps, 'size' | 'onChange' | 'value'> {
  options: AutocompleteOption[];
  value?: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  size?: "md" | "sm" | "xs";
  isDisabled?: boolean;
  noOptionsMessage?: string;
  filterOption?: (option: AutocompleteOption, inputValue: string) => boolean;
}