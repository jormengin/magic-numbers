// src/app/layout.tsx
"use client";
import getTheme from '../utils/theme';
import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import { CssBaseline, ThemeProvider, createTheme, PaletteMode } from '@mui/material';
import './globals.css';
import Navbar from '@/components/NavBar';
import { PageTitleProvider } from '@/context/PageTitleContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as PaletteMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  };

  const theme = getTheme(mode);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <PageTitleProvider>
            <CssBaseline />
            <Navbar mode={mode} toggleColorMode={toggleColorMode} />
            {children}
          </PageTitleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}