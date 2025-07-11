# Autocomplete Component

A generic autocomplete component that allows typing values in an input field and shows a filtered dropdown of options. The component is styled to match the Tribal Wars aesthetic.

## Features

- Input field for typing with real-time filtering
- Dropdown menu showing filtered options
- Highlighted matching text in dropdown options
- Keyboard navigation (arrow keys, enter, escape)
- Support for custom filtering
- Consistent styling with other tribal components
- Support for labels, helper text, and error messages
- Size variants (md, sm, xs)
- Accessibility features
- Auto-close dropdown when clicking outside the component

## Usage

```tsx
import React, { useState } from 'react';
import Autocomplete from '@src/shared/ui/Autocomplete';

const MyComponent = () => {
  const [selectedValue, setSelectedValue] = useState('');
  
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
  ];
  
  const handleChange = (value: string) => {
    setSelectedValue(value);
    console.log('Selected value:', value);
  };
  
  return (
    <Autocomplete
      options={options}
      value={selectedValue}
      onChange={handleChange}
      placeholder="Select an option"
      label="My Autocomplete"
      helperText="Select one of the options"
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| options | `AutocompleteOption[]` | Required | Array of options to display in the dropdown |
| value | `string` | `''` | Currently selected value |
| onChange | `(value: string, option?: AutocompleteOption) => void` | Required | Function called when a value is selected |
| placeholder | `string` | `'Select an option'` | Placeholder text for the input |
| label | `string` | - | Optional label for the input |
| helperText | `string` | - | Optional helper text to display below the input |
| errorMessage | `string` | - | Optional error message to display when input is invalid |
| isInvalid | `boolean` | `false` | Whether the input is invalid |
| size | `'md' \| 'sm' \| 'xs'` | `'md'` | Input size |
| isDisabled | `boolean` | `false` | Whether the input is disabled |
| noOptionsMessage | `string` | `'No options found'` | Message to display when no options match the input |
| filterOption | `(option: AutocompleteOption, inputValue: string) => boolean` | - | Custom function to filter options based on input value |

## AutocompleteOption Interface

```typescript
interface AutocompleteOption {
  value: string;
  label: string;
}
```

## Enhanced Features

### Text Highlighting

When typing in the input field, matching parts of option labels in the dropdown are automatically highlighted with bold text and accent color. This makes it easier for users to see which parts of the options match their input.

### Outside Click Handling

The dropdown automatically closes when a user clicks anywhere outside the component. This provides a more intuitive user experience and follows standard UI patterns.

## Examples

### Basic Usage

```tsx
<Autocomplete
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  value={selectedValue}
  onChange={handleChange}
/>
```

### With Custom Filtering

```tsx
<Autocomplete
  options={options}
  value={selectedValue}
  onChange={handleChange}
  filterOption={(option, inputValue) => 
    option.label.toLowerCase().startsWith(inputValue.toLowerCase())
  }
/>
```

### With Error State

```tsx
<Autocomplete
  options={options}
  value={selectedValue}
  onChange={handleChange}
  isInvalid={true}
  errorMessage="Please select a valid option"
/>
```

### Small Size

```tsx
<Autocomplete
  options={options}
  value={selectedValue}
  onChange={handleChange}
  size="sm"
/>
```