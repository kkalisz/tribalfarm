// src/shared/theme.ts
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// Define the custom theme colors and styles based on Tribal Wars aesthetic
const theme = extendTheme({
  colors: {
    tribal: {
      // Primary colors from ui_plan.md
      rootBg: '#d2c89d', // Light parchment
      primaryBg: '#f4e2c6', // Light parchment
      secondaryBg: '#dbc2a3', // Darker parchment for headers
      primaryBorder: '#8b4513', // Saddle brown
      secondaryBorder: '#a52a2a', // Brown/red for emphasis
      primaryText: '#3b2b1f', // Dark brown
      secondaryText: '#4a2c1a', // Slightly lighter brown for headers
      accent: '#c19a6b', // Gold/bronze for highlights
      hover: '#d4a76a', // Lighter gold for interactions
      success: '#2e7d32', // Forest green
      error: '#b71c1c', // Deep red

      // Component-specific colors
      cardPrimary: '#e9d9b6',//'#f4e2c6', // Light parchment background
      cardSecondary: '#f1e5c0', // #e9d9b6
      cardHeader: '#dbc2a3', // Darker parchment for headers
      cardBorder: '#8b4513', // Saddle brown
      cardHeaderBorder: '#a52a2a', // Brown/red for emphasis
      cardText: '#3b2b1f', // Dark brown
      cardHeaderText: '#4a2c1a', // Slightly lighter brown for headers
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
  fonts: {
    // Typography settings updated to Verdana, Arial
    heading: "'Verdana', 'Arial', sans-serif", // Updated font family
    body: "'Verdana', 'Arial', sans-serif", // Updated font family
  },
  fontSizes: {
    xs: "10px", // Small text
    sm: "12px", // Body text
    md: "14px", // Body text
    lg: "16px", // Headings
    xl: "18px", // Headings
    "2xl": "20px", // Headings
    "3xl": "24px", // Headings
  },
  fontWeights: {
    normal: 400, // Regular
    bold: 700, // Bold
  },
  components: {
    // Define custom component styles here
  },
  styles: {
    global: () => ({
      body: {
        background: "", // or don't set it at all
        fontFamily: "body",
        color: "tribal.primaryText",
      },
    }),
  },
});

export default theme;
