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
import styles from "./page.module.css";

const generateMachineNumber = (numberList: string[]) => {
  const randomIndex = Math.floor(Math.random() * numberList.length);
  return numberList[randomIndex];
};

const checkGuess = (guess: string, target: string) => {
  let mates = 0;
  let checks = 0;

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      mates++;
    } else if (target.includes(guess[i])) {
      checks++;
    }
  }

  return `${mates}M ${checks}C`;
};

const generateNumberList = () => {
  const numbers = [];
  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j <= 9; j++) {
      if (j === i) continue;
      for (let k = 0; k <= 9; k++) {
        if (k === i || k === j) continue;
        for (let l = 0; l <= 9; l++) {
          if (l === i || l === j || l === k) continue;
          numbers.push(`${i}${j}${k}${l}`);
        }
      }
    }
  }
  return numbers;
};

const updateLeaderboard = (
  score: { tries: number; time: number },
  setLeaderboard: React.Dispatch<
    React.SetStateAction<{ tries: number; time: number }[]>
  >
) => {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push(score);
  leaderboard.sort(
    (a: { tries: number; time: number }, b: { tries: number; time: number }) =>
      a.tries * a.time - b.tries * b.time
  );
  if (leaderboard.length > 10) {
    leaderboard = leaderboard.slice(0, 10);
  }
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  setLeaderboard(leaderboard); // Update the state to refresh the leaderboard
};

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

export default function Home() {
  const [open, setOpen] = useState(true);
  const [secretNumber, setSecretNumber] = useState("");
  const [guess, setGuess] = useState("");
  const [userGuesses, setUserGuesses] = useState<string[]>([]);
  const [numberList, setNumberList] = useState<string[]>([]);
  const [machineNumber, setMachineNumber] = useState("");
  const [tries, setTries] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    { tries: number; time: number }[]
  >([]);
  const [machineGuesses, setMachineGuesses] = useState<string[]>([]);
  const [machineFeedback, setMachineFeedback] = useState<
    { guess: string; feedback: string }[]
  >([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const initialNumberList = generateNumberList();
    setNumberList(initialNumberList);
    setMachineNumber(generateMachineNumber(initialNumberList));
    const storedLeaderboard = JSON.parse(
      localStorage.getItem("leaderboard") || "[]"
    );
    setLeaderboard(storedLeaderboard);
  }, []);

  const handleStartGame = () => {
    setOpen(false);
    setStartTime(new Date());
  };

  const handleGuess = () => {
    if (guess.length === 4 && new Set(guess).size === 4) {
      const feedback = checkGuess(guess, machineNumber);
      setUserGuesses([...userGuesses, `Your guess: ${guess} - ${feedback}`]);
      setTries(tries + 1);
      setGuess("");
      if (feedback === "4M 0C") {
        const endTime = new Date();
        const timeTaken = Math.floor(
          (endTime.getTime() - (startTime?.getTime() || 0)) / 1000
        );
        updateLeaderboard(
          { tries: tries + 1, time: timeTaken },
          setLeaderboard
        );
        alert(
          `Congratulations! You guessed the number in ${
            tries + 1
          } tries and ${timeTaken} seconds.`
        );
        handleRestart();
      } else {
        handleMachineGuess();
      }
    } else {
      alert("Guess must be 4 unique digits");
    }
  };

  const handleMachineGuess = () => {
    // Filter the numberList based on previous feedback
    const newNumberList = numberList.filter((number) => {
      return machineFeedback.every(
        ({ guess, feedback }) => checkGuess(number, guess) === feedback
      );
    });

    // Select a new guess from the filtered list
    const machineGuess = generateMachineNumber(newNumberList);

    // Check the guess against the user's secret number
    const feedback = checkGuess(machineGuess, secretNumber);

    // Update the machine's guesses and feedback state
    setMachineGuesses([
      ...machineGuesses,
      `Machine's guess: ${machineGuess} - ${feedback}`,
    ]);
    setMachineFeedback([...machineFeedback, { guess: machineGuess, feedback }]);

    // Update the filtered number list
    setNumberList(newNumberList);

    // Check if the machine's guess is correct
    if (feedback === "4M 0C") {
      alert(`The machine guessed your number: ${machineGuess}. Game over!`);
      handleRestart();
    }
  };

  const handleRestart = () => {
    const initialNumberList = generateNumberList();
    setNumberList(initialNumberList);
    setSecretNumber("");
    setGuess("");
    setUserGuesses([]);
    setMachineGuesses([]);
    setMachineFeedback([]);
    setMachineNumber(generateMachineNumber(initialNumberList));
    setTries(0);
    setStartTime(new Date());
    setOpen(true);
  };

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Dialog open={open} onClose={handleStartGame}>
        <DialogTitle>Enter Your Secret Number</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Secret Number"
            type="text"
            fullWidth
            variant="standard"
            value={secretNumber}
            onChange={(e) => setSecretNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStartGame}>Start Game</Button>
        </DialogActions>
      </Dialog>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flex="1"
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <TextField
            fullWidth
            label="Your Guess"
            variant="outlined"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleGuess}
            style={{ marginBottom: "20px" }}
          >
            Guess
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleRestart}
          >
            Restart
          </Button>
          <Box
            mt={5}
            style={{
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
              padding: "20px",
            }}
          >
            <Typography variant="h6">Your Guesses:</Typography>
            {userGuesses.map((userGuess, index) => (
              <Typography key={index}>{userGuess}</Typography>
            ))}
          </Box>
          <Box
            mt={5}
            style={{
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
              padding: "20px",
            }}
          >
            <Typography variant="h6">Machines Guesses:</Typography>
            {machineGuesses.map((machineGuess, index) => (
              <Typography key={index}>{machineGuess}</Typography>
            ))}
          </Box>
        </Box>
      </Box>
      <Box alignSelf="flex-end" width="100%" p={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
        </Button>
        {showLeaderboard && <Leaderboard leaderboard={leaderboard} />}
      </Box>
    </Container>
  );
}
