// src/context/PageTitleContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PageTitleContextProps {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextProps | undefined>(undefined);

export const PageTitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState('Magic Numbers');

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
};
