# Migration Plan: Headless UI & Tailwind CSS to Chakra UI

## 1. Current State Analysis

### 1.1 Current UI Libraries
The chrome-extension module currently uses the following UI-related libraries:
- **Headless UI** (@headlessui/react ^2.1): Provides unstyled, accessible UI components
- **Tailwind CSS** (tailwindcss ^4.1.2): Utility-first CSS framework for styling
- **tailwind-merge** (^3.2.0): Utility for merging Tailwind CSS classes

### 1.2 Components Using Headless UI
Based on the codebase analysis, the following components use Headless UI:

| Component | Headless UI Components | File Path |
|-----------|------------------------|-----------|
| Popup | Switch, Tab, Dialog, Transition | src/pages/popup/Popup.tsx |
| LeftSidebar | Transition (imported but not used) | src/pages/content/ui/LeftSidebar.tsx |
| RightSidebar | Transition (imported but not used) | src/pages/content/ui/RightSidebar.tsx |

### 1.3 Components Using Tailwind CSS
Tailwind CSS is used extensively throughout the codebase for styling. Key components include:

| Component | File Path |
|-----------|-----------|
| TribalCard | src/shared/ui/TribalCard.tsx |
| LeftSidebar | src/pages/content/ui/LeftSidebar.tsx |
| RightSidebar | src/pages/content/ui/RightSidebar.tsx |
| SidebarToggleButton | src/pages/content/ui/SidebarToggleButton.tsx |
| Popup | src/pages/popup/Popup.tsx |

### 1.4 Tailwind Configuration
The project uses a standard Tailwind configuration with no custom theme extensions or plugins.

## 2. Migration Strategy

### 2.1 Required Dependencies
To migrate to Chakra UI, we need to:

1. **Add Chakra UI dependencies**:
   ```bash
   npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
   ```

2. **Remove Headless UI and Tailwind dependencies**:
   ```bash
   npm uninstall @headlessui/react tailwindcss @tailwindcss/vite tailwind-merge
   ```

### 2.2 Project Setup Changes

1. **Remove Tailwind configuration files**:
   - tailwind.config.js
   - src/assets/styles/tailwind.css

2. **Add Chakra UI Provider**:
   - Update the root component to wrap the application with ChakraProvider
   - Create a custom theme file to match the current design

3. **Update build configuration**:
   - Remove Tailwind CSS plugin from Vite configuration
   - Update any CSS imports that reference Tailwind

### 2.3 Component Migration Strategy

#### 2.3.1 Headless UI Component Mapping

| Headless UI Component | Chakra UI Equivalent | Notes |
|----------------------|---------------------|-------|
| Switch | Switch | Direct replacement |
| Tab | Tabs, TabList, Tab, TabPanels, TabPanel | More verbose but similar structure |
| Dialog | Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter | More structured approach |
| Transition | Use framer-motion animations | Chakra UI uses framer-motion for animations |

#### 2.3.2 Tailwind CSS to Chakra UI Style Mapping

| Tailwind Pattern | Chakra UI Approach | Example |
|-----------------|-------------------|---------|
| className="flex items-center" | <Flex alignItems="center"> | Replace flex utility classes with Flex component |
| className="p-4 m-2" | <Box p={4} m={2}> | Replace spacing utilities with Chakra props |
| className="text-white bg-blue-500" | <Box color="white" bg="blue.500"> | Replace color utilities with Chakra color props |
| className="rounded-lg shadow-md" | <Box borderRadius="lg" boxShadow="md"> | Replace border and shadow utilities with Chakra props |
| className="hover:bg-blue-600" | <Box _hover={{ bg: "blue.600" }}> | Replace pseudo-class utilities with Chakra pseudo props |

### 2.4 Component-by-Component Migration Plan

1. **Shared UI Components**:
   - TribalCard.tsx: Convert to Chakra UI Box or Card component with appropriate styling

2. **Content UI Components**:
   - LeftSidebar.tsx: Replace Tailwind classes with Chakra UI components and props
   - RightSidebar.tsx: Replace Tailwind classes with Chakra UI components and props
   - SidebarContainer.tsx: Replace Tailwind classes with Chakra UI components and props
   - SidebarToggleButton.tsx: Replace Tailwind classes with Chakra UI components and props

3. **Popup Components**:
   - Popup.tsx: Replace Headless UI components with Chakra UI equivalents and convert Tailwind styling

## 3. Theme Migration

### 3.1 Create Chakra UI Theme
Create a custom Chakra UI theme that matches the current design:

```typescript
// src/shared/theme.ts
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    tribal: {
      card: '#f4e2c6',
      cardHeader: '#dbc2a3',
      cardBorder: '#red.600',
      cardHeaderBorder: '#red.700',
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
});

export default theme;
```

### 3.2 Global Styles
Replace Tailwind's global styles with Chakra UI's global styles:

```typescript
// src/shared/styles.ts
import { mode } from '@chakra-ui/theme-tools';

export const globalStyles = {
  global: (props) => ({
    body: {
      bg: mode('white', 'gray.800')(props),
      color: mode('gray.800', 'whiteAlpha.900')(props),
    },
  }),
};
```

## 4. Testing Strategy

### 4.1 Unit Tests
1. Update existing unit tests to work with Chakra UI components
2. Create new tests for Chakra UI specific functionality
3. Ensure all components render correctly with the new styling

### 4.2 Visual Regression Testing
1. Take screenshots of the current UI before migration
2. Compare with screenshots after migration to ensure visual consistency
3. Adjust styling as needed to match the original design

### 4.3 Manual Testing
1. Test all interactive components to ensure they function correctly
2. Test responsive behavior across different screen sizes
3. Test accessibility features provided by Chakra UI

## 5. Implementation Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Setup** | Add Chakra UI dependencies, remove Tailwind/Headless UI, setup ChakraProvider | 1 day |
| **Theme Migration** | Create custom theme to match current design | 1 day |
| **Shared Components** | Migrate shared UI components to Chakra UI | 1 day |
| **Content UI** | Migrate content UI components to Chakra UI | 2 days |
| **Popup UI** | Migrate popup components to Chakra UI | 2 days |
| **Testing & Refinement** | Test all components, fix issues, refine styling | 3 days |
| **Documentation** | Update documentation to reflect new UI library | 1 day |

**Total Estimated Time**: 11 days

## 6. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual inconsistencies after migration | Medium | Thorough visual testing and refinement |
| Functionality differences between libraries | High | Comprehensive testing of all interactive components |
| Performance impact | Low | Monitor bundle size and performance metrics |
| Learning curve for developers | Medium | Provide training and documentation on Chakra UI |

## 7. Benefits of Migration

1. **Improved Developer Experience**: Chakra UI provides a more consistent API and better documentation
2. **Better Accessibility**: Chakra UI has strong accessibility features built-in
3. **Reduced Bundle Size**: Potentially smaller bundle size by using a single UI library
4. **Simplified Styling**: Props-based styling instead of className strings
5. **Theme Consistency**: Better theme management with Chakra UI's theme system
6. **Dark Mode Support**: Built-in support for light/dark mode

## 8. Post-Migration Tasks

1. Remove any unused files related to Tailwind CSS
2. Update documentation to reflect the new UI library
3. Train team members on Chakra UI best practices
4. Consider implementing additional Chakra UI features like color mode switching

## 9. Conclusion

This migration plan outlines a comprehensive approach to migrating from Headless UI and Tailwind CSS to Chakra UI. By following this plan, we can ensure a smooth transition with minimal disruption to the development process and user experience.