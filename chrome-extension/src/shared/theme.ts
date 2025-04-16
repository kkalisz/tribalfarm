// src/shared/theme.ts
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// Define the custom theme colors and styles
const theme = extendTheme({
  colors: {
    tribal: {
      card: '#f4e2c6',
      cardHeader: '#dbc2a3',
      cardBorder: 'red.600',
      cardHeaderBorder: 'red.700',
      cardText: '#3b2b1f',
      cardHeaderText: '#4a2c1a',
    },
    blue: {
      500: '#3b82f6', // Match Tailwind blue-500
      600: '#2563eb', // Match Tailwind blue-600
    },
    gray: {
      700: '#374151', // Match Tailwind gray-700
      800: '#1f2937', // Match Tailwind gray-800
    },
  },
  components: {
    // Define custom component styles here
  },
  styles: {
    global: () => ({
      body: {
        background: "", // or don't set it at all
      },
    }),
  },
});

export default theme;