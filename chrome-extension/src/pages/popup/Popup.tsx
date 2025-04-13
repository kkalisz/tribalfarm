import React, { useState } from 'react';
import logo from '@assets/img/logo.svg';
import { useGuiSettings } from '@src/shared/hooks/useGuiSettings';
import { Switch, Tab, Dialog, Transition } from '@headlessui/react';

export default function Popup() {
  const { gui } = useGuiSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleShowGUIChange = (checked: boolean) => {
    gui.setVisible(checked);
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <img src={logo} className="h-36 pointer-events-none animate-spin-slow" alt="logo" />

        {/* Tabs for different sections */}
        <div className="w-full max-w-md px-2 py-4 sm:px-0">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <Tab 
                className={({ selected }) =>
                  `w-full rounded-lg py-2 text-sm font-medium leading-5 
                  ${selected ? 'bg-blue-500 text-white shadow' : 'text-blue-100 hover:bg-blue-800/30 hover:text-white'}`
                }
              >
                Settings
              </Tab>
              <Tab 
                className={({ selected }) =>
                  `w-full rounded-lg py-2 text-sm font-medium leading-5 
                  ${selected ? 'bg-blue-500 text-white shadow' : 'text-blue-100 hover:bg-blue-800/30 hover:text-white'}`
                }
              >
                About
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-2">
              <Tab.Panel className="rounded-xl bg-gray-700 p-3 text-white">
                <div className="mt-2 flex items-center justify-between">
                  <span>Show GUI</span>
                  <Switch
                    checked={gui.visible}
                    onChange={handleShowGUIChange}
                    className={`${
                      gui.visible ? 'bg-blue-500' : 'bg-gray-500'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span className="sr-only">Show GUI</span>
                    <span
                      className={`${
                        gui.visible ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  More Info
                </button>
              </Tab.Panel>
              <Tab.Panel className="rounded-xl bg-gray-700 p-3 text-white">
                <p className="text-sm">
                  This is a Chrome extension built with React, TypeScript, and Tailwind CSS.
                </p>
                <p className="mt-2 text-sm">
                  UI components powered by Headless UI.
                </p>
                <a
                  className="mt-2 block text-blue-400"
                  href="https://headlessui.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about Headless UI
                </a>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </header>

      {/* Dialog for additional information */}
      <Transition show={isDialogOpen} as={React.Fragment}>
        <Dialog 
          open={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto"
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="relative mx-auto max-w-md rounded-lg bg-gray-700 p-6 text-white">
                <Dialog.Title className="text-lg font-medium">
                  GUI Settings Information
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm">
                  Enabling the GUI will show the sidebar interfaces on the webpage.
                </Dialog.Description>

                <p className="mt-4 text-sm">
                  The left sidebar shows status information, while the right sidebar displays logs.
                </p>

                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Got it, thanks!
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
