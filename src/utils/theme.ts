// src/utils/theme.ts

import { createTheme, PaletteMode } from '@mui/material';

const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: mode === 'light' ? '#fff' : '#121212',
      paper: mode === 'light' ? '#fff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#000' : '#fff',
    },
  },
});

export default getTheme;
