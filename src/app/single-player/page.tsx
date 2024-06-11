// src/app/single-player/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  generateMachineNumber,
  checkGuess,
  generateNumberList,
  updateLeaderboard
} from '../../utils/gameUtils';
import { usePageTitle } from '../../context/PageTitleContext'; // Import the usePageTitle hook

const Leaderboard = ({
  leaderboard,
}: {
  leaderboard: { tries: number; time: number }[];
}) => {
  return (
    <Box>
      <Typography variant="h6">Leaderboard</Typography>
      {leaderboard.map((score, index) => (
        <Typography
          key={index}
        >{`Tries: ${score.tries}, Time: ${score.time}s`}</Typography>
      ))}
    </Box>
  );
};

export default function SinglePlayer() {
  const { setTitle } = usePageTitle(); // Use the setTitle function

  useEffect(() => {
    setTitle('Single Player');
  }, [setTitle]);

  // ... rest of the component code
}
