import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarContainer } from '../index';

describe('SidebarContainer Component', () => {
  it('renders left and right sidebars', () => {
    // Render the component
    render(<SidebarContainer />);
    
    // Check that the left sidebar is rendered
    expect(screen.getByText('Left Sidebar')).toBeInTheDocument();
    expect(screen.getByText('This is the left view!')).toBeInTheDocument();
    
    // Check that the right sidebar is rendered
    expect(screen.getByText('Right Sidebar')).toBeInTheDocument();
    expect(screen.getByText('This is the right view!')).toBeInTheDocument();
  });
  
  it('has the correct styling and positioning', () => {
    // Render the component
    const { container } = render(<SidebarContainer />);
    
    // Get the main container
    const mainContainer = container.firstChild as HTMLElement;
    
    // Check that it has the correct classes and styles
    expect(mainContainer).toHaveClass('fixed');
    expect(mainContainer).toHaveClass('top-0');
    expect(mainContainer).toHaveClass('left-0');
    expect(mainContainer).toHaveClass('w-screen');
    expect(mainContainer).toHaveClass('h-screen');
    expect(mainContainer).toHaveClass('pointer-events-none');
    expect(mainContainer.style.zIndex).toBe('99999');
    
    // Get the left sidebar
    const leftSidebar = mainContainer.children[0] as HTMLElement;
    
    // Check that it has the correct classes
    expect(leftSidebar).toHaveClass('fixed');
    expect(leftSidebar).toHaveClass('top-0');
    expect(leftSidebar).toHaveClass('left-0');
    expect(leftSidebar).toHaveClass('h-full');
    expect(leftSidebar).toHaveClass('w-1/4');
    expect(leftSidebar).toHaveClass('bg-blue-500');
    
    // Get the right sidebar
    const rightSidebar = mainContainer.children[1] as HTMLElement;
    
    // Check that it has the correct classes
    expect(rightSidebar).toHaveClass('fixed');
    expect(rightSidebar).toHaveClass('top-0');
    expect(rightSidebar).toHaveClass('right-0');
    expect(rightSidebar).toHaveClass('h-full');
    expect(rightSidebar).toHaveClass('w-1/4');
    expect(rightSidebar).toHaveClass('bg-green-500');
  });
});