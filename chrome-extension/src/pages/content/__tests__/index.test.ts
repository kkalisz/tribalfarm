import { describe, it, expect, vi, beforeEach } from 'vitest';
import {isValidDomain} from "@src/shared/helpers/isValidDomain";

// Mock the window.location object
const mockLocation = {
  hostname: 'pl123.plemiona.pl'
};

describe('Content Script Utilities', () => {
  beforeEach(() => {
    // Reset the mocked location before each test
    Object.defineProperty(window, 'location', {
      value: { ...mockLocation },
      writable: true
    });
  });

  describe('isValidDomain', () => {
    it('should return true for valid plemiona.pl domains', () => {
      // Test valid domains
      window.location.hostname = 'pl123.plemiona.pl';
      expect(isValidDomain()).toBe(true);
      
      window.location.hostname = 'pl456.plemiona.pl';
      expect(isValidDomain()).toBe(true);
      
      window.location.hostname = 'plworld9.plemiona.pl';
      expect(isValidDomain()).toBe(true);
    });

    it('should return false for non-plemiona.pl domains', () => {
      // Test non-plemiona domains
      window.location.hostname = 'example.com';
      expect(isValidDomain()).toBe(false);
      
      window.location.hostname = 'google.com';
      expect(isValidDomain()).toBe(false);
    });

    it('should return false for plemiona.pl domains with invalid subdomains', () => {
      // Test plemiona domains with invalid subdomains
      window.location.hostname = 'abc.plemiona.pl';
      expect(isValidDomain()).toBe(false);
      
      window.location.hostname = 'xyz123.plemiona.pl';
      expect(isValidDomain()).toBe(false);
      
      // Subdomain starts with 'pl' but doesn't end with a number
      window.location.hostname = 'plworld.plemiona.pl';
      expect(isValidDomain()).toBe(false);
    });
  });
});