import { renderHook, act } from '@testing-library/react-hooks';
import { useQueryParams } from '../useQueryParams';

describe('useQueryParams', () => {
  // Save the original location object
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock the window.location object
    delete window.location;
    window.location = {
      ...originalLocation,
      href: 'https://example.com?param1=value1&param2=value2',
      search: '?param1=value1&param2=value2'
    } as Location;
  });

  afterEach(() => {
    // Restore the original location object
    window.location = originalLocation;
  });

  it('should extract query parameters from the URL for direct destructuring', () => {
    // Render the hook
    const { result } = renderHook(() => useQueryParams());

    // Check that the hook returns an object
    expect(typeof result.current).toBe('object');
    
    // Destructure the result directly
    const { param1, param2, nonexistent } = result.current;
    
    // Check that the destructured values are correct
    expect(param1).toBe('value1');
    expect(param2).toBe('value2');
    expect(nonexistent).toBeUndefined();
  });

  it('should update when the URL changes', () => {
    // Render the hook
    const { result } = renderHook(() => useQueryParams());

    // Check initial values
    const { param1: initialParam1 } = result.current;
    expect(initialParam1).toBe('value1');

    // Simulate URL change
    act(() => {
      // Update the window.location object
      window.location.href = 'https://example.com?param1=newvalue&param3=value3';
      window.location.search = '?param1=newvalue&param3=value3';

      // Dispatch a popstate event to trigger the hook's URL change handler
      window.dispatchEvent(new Event('popstate'));
    });

    // Check that the hook returns the updated parameter values
    const { param1, param2, param3 } = result.current;
    expect(param1).toBe('newvalue');
    expect(param2).toBeUndefined();
    expect(param3).toBe('value3');
  });
});