import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * Custom Vite plugin to copy the compiled Tailwind CSS to the public directory
 * with a static name during the build process.
 */
export function copyTailwindCss(): Plugin {
  return {
    name: 'copy-tailwind-css',
    apply: 'build', // Only apply during build
    closeBundle: async () => {
      try {
        // Find the compiled Tailwind CSS file in the assets directory
        const distDir = path.resolve(__dirname, '../dist_chrome/assets');
        const files = fs.readdirSync(distDir);
        const tailwindFile = files.find(file => file.includes('tailwind') && file.endsWith('.css'));
        
        if (tailwindFile) {
          // Source path of the compiled Tailwind CSS
          const sourcePath = path.join(distDir, tailwindFile);
          
          // Destination path in the public directory
          const destPath = path.resolve(__dirname, '../public/tailwind.css');
          
          // Copy the file
          fs.copyFileSync(sourcePath, destPath);
          
          console.log(`Copied Tailwind CSS to public directory: ${destPath}`);
        } else {
          console.warn('Could not find compiled Tailwind CSS file');
        }
      } catch (error) {
        console.error('Error copying Tailwind CSS:', error);
      }
    }
  };
}