// src/app/home/page.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Container, Box, Typography, Button } from "@mui/material";
import { usePageTitle } from '../../context/PageTitleContext'; // Import the usePageTitle hook

export default function Home() {
  const { setTitle } = usePageTitle(); // Use the setTitle function

  useEffect(() => {
    setTitle('Magic Numbers');
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
        <Typography variant="h3">Welcome to the Game</Typography>
        <Link href="/single-player" passHref>
          <Button variant="contained" color="primary">Single Player</Button>
        </Link>
        <Link href="/multiplayer" passHref>
          <Button variant="contained" color="secondary">Multiplayer</Button>
        </Link>
      </Box>
    </Container>
  );
}
