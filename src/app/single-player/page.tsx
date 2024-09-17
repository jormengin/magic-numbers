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
  Snackbar,
  Alert,
} from "@mui/material";
import {
  generateMachineNumber,
  checkGuess,
  generateNumberList,
  updateLeaderboard,
  getFourDifferentDigits,
} from "../../utils/gameUtils";
import { usePageTitle } from "../../context/PageTitleContext"; // Import the usePageTitle hook

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
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Single Player");
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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

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
    if (secretNumber.length !== 4 || new Set(secretNumber).size !== 4) {
      setSnackbarMessage("Secret number must be 4 unique digits");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
        setSnackbarMessage(
          `Congratulations! You guessed the number in ${
            tries + 1
          } tries and ${timeTaken} seconds.`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleRestart();
      } else {
        handleMachineGuess();
      }
    } else {
      setSnackbarMessage("Guess must be 4 unique digits");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleMachineGuess = () => {
    // Filter the numberList based on machine feedback
    const newNumberList = numberList.filter((number) => {
      return machineFeedback.every(
        ({ guess, feedback }) => checkGuess(number, guess) === feedback
      );
    });

    let machineGuess;
    // When no previous guesses exist, generate the first guess
    if (machineGuesses.length === 0) {
      machineGuess = generateMachineNumber(newNumberList);
    }
    // When one guess exists, make a guess with different digits
    else if (machineGuesses.length === 1) {
      const firstGuessDigits = new Set(
        machineGuesses[0].split(" - ")[0].split("")
      );
      machineGuess = getFourDifferentDigits(firstGuessDigits, newNumberList);
    }
    // For subsequent guesses, use all previous guesses (not just the last one)
    else {
      const previousGuesses = machineGuesses.map(
        (guess) => guess.split(" - ")[0]
      );
      machineGuess = selectMostDifferentNumber(newNumberList, previousGuesses); // Use the full array of previous guesses
    }

    const feedback = checkGuess(machineGuess, secretNumber);

    // Update machine guesses and feedback state
    setMachineGuesses([
      ...machineGuesses,
      `Machine's guess: ${machineGuess} - ${feedback}`,
    ]);
    setMachineFeedback([...machineFeedback, { guess: machineGuess, feedback }]);
    setNumberList(newNumberList);

    if (feedback === "4M 0C") {
      setSnackbarMessage(
        `The machine guessed your number: ${machineGuess}. Game over! The machine secret number was ${machineNumber}`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
  const calculateDifference = (num1: string, num2: string) => {
    const set1 = new Set(num1.split(""));
    const set2 = new Set(num2.split(""));
    let difference = 0;

    set1.forEach((digit) => {
      if (!set2.has(digit)) {
        difference++;
      }
    });

    set2.forEach((digit) => {
      if (!set1.has(digit)) {
        difference++;
      }
    });

    return difference;
  };

  const selectMostDifferentNumber = (
    numberList: string[],
    previousGuesses: string[]
  ) => {
    let maxDifference = -1;
    let bestGuess = numberList[0];
    
    numberList.forEach((number) => {
      let totalDifference = 0;
      previousGuesses.forEach((guess) => {
        totalDifference += calculateDifference(number, guess);
      });

      const averageDifference = totalDifference / previousGuesses.length;

      if (averageDifference > maxDifference) {
        maxDifference = averageDifference;
        bestGuess = number;
      }
    });

    return bestGuess;
  };

  const handleSimulation = () => {
    const numGames = 1000;
    let totalTries = 0;

    for (let i = 0; i < numGames; i++) {
      const initialNumberList = generateNumberList();
      const secretNumber = generateMachineNumber(initialNumberList);
      let currentMachineGuesses: string[] = [];
      let currentMachineFeedback: { guess: string; feedback: string }[] = [];
      let currentTries = 0;
      console.log(`Game ${i + 1}`);
      while (true) {
        const newNumberList = initialNumberList.filter((number) => {
          return currentMachineFeedback.every(
            ({ guess, feedback }) => checkGuess(number, guess) === feedback
          );
        });

        let machineGuess;
        if (currentMachineGuesses.length === 0) {
          machineGuess = generateMachineNumber(newNumberList);
        } else if (currentMachineGuesses.length === 1) {
          //TODO improve second guess
          const firstGuessDigits = new Set(
            currentMachineGuesses[0].split(" - ")[0]
          );
          machineGuess = getFourDifferentDigits(
            firstGuessDigits,
            newNumberList
          );
          console.log(`Machine's guess: ${machineGuess}`);
        } else {
          const lastGuesses = currentMachineGuesses.map(
            (guess) => guess.split(" - ")[0]
          );
          machineGuess = selectMostDifferentNumber(newNumberList, lastGuesses);
          console.log(`Machine's guess: ${machineGuess}`);
        }

        const feedback = checkGuess(machineGuess, secretNumber);

        currentMachineGuesses.push(
          `${machineGuess} - ${feedback}`
        );
        currentMachineFeedback.push({ guess: machineGuess, feedback });
        currentTries++;

        if (feedback === "4M 0C") {
          totalTries += currentTries;
          break;
        }
      }
    }

    const averageTries = totalTries / numGames;
    console.log(`Average tries over ${numGames} games: ${averageTries}`);
    alert(
      `Simulation complete! Average tries over ${numGames} games: ${averageTries}`
    );
  };

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
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleSimulation}
          >
            Run Simulation
          </Button>
        </Box>
        <Box alignSelf="flex-end" width="100%" p={2}></Box>
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
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={gameStarted ? 10000 : 10000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
