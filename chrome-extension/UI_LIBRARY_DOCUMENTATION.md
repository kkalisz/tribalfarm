# Headless UI Integration Documentation

## Overview
This document provides information about the integration of Headless UI into the Chrome extension project. Headless UI is a set of completely unstyled, fully accessible UI components that work seamlessly with Tailwind CSS.

## Why Headless UI?
Headless UI was chosen for this project because:
1. It's designed specifically to work with Tailwind CSS, which the project already uses
2. It provides unstyled, fully accessible UI components
3. It's lightweight and won't significantly increase the bundle size of the Chrome extension
4. It has excellent TypeScript support
5. It's maintained by the same team that created Tailwind CSS

## Installation
Headless UI has been added to the project's dependencies in package.json:
```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.18",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "webextension-polyfill": "^0.12.0"
  }
}
```

To install the dependencies, run:
```bash
npm install
```

## Components Used

### Transition
The `Transition` component is used in both the LeftSidebar and RightSidebar components to provide smooth animations when toggling the sidebars.

Example usage:
```jsx
<Transition
  show={visible}
  enter="transition-opacity duration-300"
  enterFrom="opacity-0"
  enterTo="opacity-100"
  leave="transition-opacity duration-300"
  leaveFrom="opacity-100"
  leaveTo="opacity-0"
>
  {/* Content */}
</Transition>
```

### Switch
The `Switch` component is used in the Popup component to replace the standard checkbox for toggling the GUI visibility.

Example usage:
```jsx
<Switch
  checked={checked}
  onChange={setChecked}
  className={`${
    checked ? 'bg-blue-500' : 'bg-gray-500'
  } relative inline-flex h-6 w-11 items-center rounded-full`}
>
  <span className="sr-only">Enable notifications</span>
  <span
    className={`${
      checked ? 'translate-x-6' : 'translate-x-1'
    } inline-block h-4 w-4 transform rounded-full bg-white`}
  />
</Switch>
```

### Tab
The `Tab` component is used in the Popup component to create a tabbed interface for organizing different sections.

Example usage:
```jsx
<Tab.Group>
  <Tab.List>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </Tab.List>
  <Tab.Panels>
    <Tab.Panel>Content 1</Tab.Panel>
    <Tab.Panel>Content 2</Tab.Panel>
  </Tab.Panels>
</Tab.Group>
```

### Dialog
The `Dialog` component is used in the Popup component to create a modal dialog for displaying additional information.

Example usage:
```jsx
<Dialog open={isOpen} onClose={setIsOpen}>
  <Dialog.Overlay />
  <Dialog.Title>Title</Dialog.Title>
  <Dialog.Description>Description</Dialog.Description>
  {/* Content */}
  <button onClick={() => setIsOpen(false)}>Close</button>
</Dialog>
```

## Additional Components Available

Headless UI provides several other components that can be used in the project:

1. **Combobox**: A autocomplete input with a dropdown list of options
2. **Listbox**: A custom select component
3. **Menu**: A dropdown menu
4. **Popover**: A popup that displays additional content
5. **Radio Group**: A group of radio buttons
6. **Disclosure**: An expandable/collapsible section

For more information and examples, visit the [Headless UI documentation](https://headlessui.com/).

## Best Practices

1. **Accessibility**: Headless UI components are designed to be accessible by default. Maintain this by using proper ARIA attributes and keyboard navigation.
2. **Styling**: Use Tailwind CSS classes to style the components according to your design.
3. **Transitions**: Use the Transition component for smooth animations when showing/hiding elements.
4. **State Management**: Use React state to manage the state of the components (open/closed, selected, etc.).
