# Tribal Wars UI Component Plan

## Introduction and Purpose

This document outlines the plan for implementing UI components using Chakra UI that mimic the styling of the game plemiona.pl (Tribal Wars). The goal is to create a set of basic components with styling similar to the game's interface, while keeping the implementation simple and focused on essential elements.

These components will be used in the Chrome extension to provide a consistent and thematic user experience that feels like an extension of the game itself.

## Design Principles Based on Tribal Wars

Tribal Wars (plemiona.pl) has a distinctive medieval/tribal aesthetic with the following characteristics:

1. **Rustic and Aged Appearance**: UI elements look like aged parchment or worn wood
2. **Earthy Color Palette**: Browns, beiges, reds, and golds dominate the interface
3. **Ornate Borders**: Elements often have decorative borders that resemble medieval manuscripts
4. **Textured Backgrounds**: Backgrounds have subtle textures that mimic parchment or leather
5. **Contrast**: Dark text on light backgrounds for readability
6. **Hierarchical Design**: Clear visual hierarchy through size, color, and positioning

## Color Palette

Based on the existing theme and Tribal Wars aesthetic:

- **Primary Background**: `#f4e2c6` (Light parchment)
- **Secondary Background**: `#dbc2a3` (Darker parchment for headers)
- **Primary Border**: `#8b4513` (Saddle brown)
- **Secondary Border**: `#a52a2a` (Brown/red for emphasis)
- **Primary Text**: `#3b2b1f` (Dark brown)
- **Secondary Text**: `#4a2c1a` (Slightly lighter brown for headers)
- **Accent**: `#c19a6b` (Gold/bronze for highlights)
- **Hover/Focus**: `#d4a76a` (Lighter gold for interactions)
- **Success**: `#2e7d32` (Forest green)
- **Error**: `#b71c1c` (Deep red)

## Typography

- **Primary Font**: A serif font that resembles medieval text (e.g., "Cinzel" or "MedievalSharp")
- **Secondary Font**: A more readable serif font for body text (e.g., "Merriweather" or "Lora")
- **Font Sizes**:
  - Headings: 16-24px
  - Body: 12-14px
  - Small text: 10-12px
- **Font Weights**:
  - Regular: 400
  - Bold: 700

## Component Specifications

### 1. Card Component ✅

- **Purpose**: Container for related content
- **Styling**:
  - Light parchment background
  - Brown border with slight rounding
  - Optional header with darker background
  - Inner shadow for depth
  - Padding for content
- **Variants**:
  - Standard: With header
  - Simple: Without header
  - Highlighted: With gold accent border

### 2. Button Component ✅

- **Purpose**: Trigger actions
- **Styling**:
  - Gradient background from gold to brown
  - Darker border
  - Hover effect with lighter color
  - Active effect with pressed appearance
  - Text shadow for depth
- **Variants**:
  - Primary: Gold/brown gradient
  - Secondary: Darker brown
  - Small: Compact version
  - Icon: With icon only or icon + text

### 3. Header Component ✅

- **Purpose**: Section titles and page headers
- **Styling**:
  - Darker background
  - Decorative border
  - Bold text
  - Optional icon
- **Variants**:
  - Page: Larger, more ornate
  - Section: Medium size
  - Subsection: Smaller

### 4. Text Component ✅

- **Purpose**: Display text content
- **Styling**:
  - Dark brown color
  - Serif font
  - Proper line height for readability
- **Variants**:
  - Body: Standard text
  - Small: Smaller text for less important information
  - Emphasis: Bold or italic for emphasis

### 5. Checkbox Component ✅

- **Purpose**: Toggle options
- **Styling**:
  - Custom checkbox design with parchment background
  - Brown border
  - Gold/bronze check mark
  - Hover effect
- **Variants**:
  - Standard: Normal size
  - Small: Compact version

### 6. Select Component ✅

- **Purpose**: Choose from options
- **Styling**:
  - Parchment background
  - Brown border
  - Custom dropdown icon
  - Dropdown menu with matching style
- **Variants**:
  - Standard: Normal size
  - Small: Compact version
  - Multiple: Allow multiple selections

### 7. Text Input Component ✅

- **Purpose**: Enter text
- **Styling**:
  - Parchment background
  - Brown border
  - Focus state with gold/bronze glow
  - Placeholder text in lighter color
- **Variants**:
  - Standard: Normal size
  - Small: Compact version
  - Textarea: Multi-line input

## Implementation Guidelines

1. **Extend Chakra UI Theme**:
   - Update the existing theme.ts file with the complete color palette
   - Add custom component styles for each component
   - Define typography settings

2. **Component Structure**:
   - Create each component in a separate file in src/shared/ui
   - Use Chakra UI components as the foundation
   - Apply custom styling through the theme and props

3. **Accessibility**:
   - Ensure all components meet accessibility standards
   - Maintain proper contrast ratios
   - Include appropriate ARIA attributes

4. **Responsiveness**:
   - Make all components responsive by default
   - Use Chakra UI's responsive props system

5. **Documentation**:
   - Document each component with examples
   - Include prop definitions
   - Provide usage guidelines

## Progress Tracking

- [x] Update theme.ts with complete color palette and typography
- [x] Card Component
  - [x] Design and implement base component
  - [x] Add variants
  - [x] Document usage
- [x] Button Component
  - [x] Design and implement base component
  - [x] Add variants
  - [x] Document usage
- [x] Header Component
  - [x] Design and implement base component
  - [x] Add variants
  - [x] Document usage
- [x] Text Component
  - [x] Design and implement base component
  - [x] Add variants
  - [x] Document usage
- [x] Checkbox Component
  - [x] Design and implement base component
  - [x] Add variants
  - [x] Document usage
- [x] Select Component
  - [x] Design and implement base component
  - [x] Add variants
  - [x] Document usage
- [x] Text Input Component
  - [x] Design and implement base component
  - [x] Add variants
  - [x] Document usage
- [ ] Integration Testing
  - [ ] Test all components in the extension
  - [ ] Verify styling matches Tribal Wars aesthetic
  - [ ] Ensure components work together harmoniously

## Next Steps

1. Begin by updating the theme.ts file with the complete color palette and typography settings
2. Implement components in order of priority: Card, Button, Header, Text, Checkbox, Select, Text Input
3. Create a simple demo page to showcase all components
4. Integrate components into the extension's existing UI
5. Gather feedback and refine as needed
