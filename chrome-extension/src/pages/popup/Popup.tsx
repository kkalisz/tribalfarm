import React from 'react';
import logo from '@assets/img/logo.svg';
import { useGuiSettings } from '@src/shared/hooks/useGuiSettings';

export default function Popup() {
  const { gui } = useGuiSettings();

  const handleShowGUIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gui.setVisible(e.target.checked);
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <img src={logo} className="h-36 pointer-events-none animate-spin-slow" alt="logo" />
        <p>
          Edit <code>src/pages/popup/Popup.jsx</code> and save to reload.
        </p>
        <a
          className="text-blue-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
        <p>Popup styled with TailwindCSS!</p>

        <div className="mt-4 flex items-center">
          <input 
            type="checkbox" 
            id="showGUI" 
            checked={gui.visible} 
            onChange={handleShowGUIChange}
            className="mr-2"
          />
          <label htmlFor="showGUI">Show GUI</label>
        </div>
      </header>
    </div>
  );
}
