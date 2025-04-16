import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '@src/shared/theme';
import Popup from '@pages/popup/Popup';

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(
    <ChakraProvider theme={theme}>
      <Popup />
    </ChakraProvider>
  );
}

init();
