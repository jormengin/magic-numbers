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
  const [open, setOpen] = useState(false);
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
  const [gameStarted, setGameStarted] = useState(false);

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
    setOpen(true);
  };

  const handleConfirmStartGame = () => {
    console.log(secretNumber);
    if (secretNumber.length !== 4 || new Set(secretNumber).size !== 4) {
      alert("Secret number must be 4 unique digits");
      return;
    }
    setOpen(false);
    setGameStarted(true);
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
    const newNumberList = numberList.filter((number) => {
      return machineFeedback.every(
        ({ guess, feedback }) => checkGuess(number, guess) === feedback
      );
    });

    const machineGuess = generateMachineNumber(newNumberList);

    const feedback = checkGuess(machineGuess, secretNumber);

    setMachineGuesses([
      ...machineGuesses,
      `Machine's guess: ${machineGuess} - ${feedback}`,
    ]);
    setMachineFeedback([...machineFeedback, { guess: machineGuess, feedback }]);

    setNumberList(newNumberList);

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
    setGameStarted(false);
    setOpen(true);
  };
console.log(secretNumber);
  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        justifyContent: "flex-start",
      }}
    >
      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={open}
        onClose={() => setOpen(false)}
      >
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
          <Button onClick={handleConfirmStartGame}>Start Game</Button>
        </DialogActions>
      </Dialog>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flex="1"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="20px"
        >
          {secretNumber && gameStarted && (
            <Box
              style={{
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
                padding: "20px",
              }}
            >
              <Typography variant="h6">
                Your Secret Number: {secretNumber}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Your Guess"
            variant="outlined"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={!gameStarted}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleGuess}
            disabled={!gameStarted}
          >
            Guess
          </Button>
          {gameStarted && (
            <>
              {userGuesses.length > 0 && (
                <Box
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
              )}
              {machineGuesses.length > 0 && (
                <Box
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
              )}
            </>
          )}
          <Button
            fullWidth
            variant="contained"
            color={gameStarted ? "secondary" : "primary"}
            onClick={gameStarted ? handleRestart : handleStartGame}
          >
            {gameStarted ? "Restart" : "Start"}
          </Button>
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
function setTitle(arg0: string) {
  throw new Error("Function not implemented.");
}

