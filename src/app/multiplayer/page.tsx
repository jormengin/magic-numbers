// src/app/multiplayer/page.tsx
"use client";

import React, { useEffect } from "react";
import { Container, Box, Typography } from "@mui/material";
import { usePageTitle } from '../../context/PageTitleContext'; // Import the usePageTitle hook

export default function Multiplayer() {
  const { setTitle } = usePageTitle(); // Use the setTitle function

  useEffect(() => {
    setTitle('Multiplayer');
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
        <Typography variant="h3">Multiplayer Mode</Typography>
        <Typography variant="h6">Coming Soon...</Typography>
      </Box>
    </Container>
  );
}
