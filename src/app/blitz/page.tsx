// src/app/blitz/page.tsx
"use client";

import React, { useEffect } from "react";
import { Container, Box, Typography } from "@mui/material";
import { usePageTitle } from '../../context/PageTitleContext';

export default function Blitz() {
  const { setTitle } = usePageTitle();
  
  useEffect(() => {
    setTitle('Blitz Mode');
  }, [setTitle]);

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap="20px">
        <Typography variant="h3">Blitz Mode</Typography>
        <Typography variant="h6">Game logic to be implemented...</Typography>
      </Box>
    </Container>
  );
}
