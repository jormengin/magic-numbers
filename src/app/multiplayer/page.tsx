// src/app/multiplayer/page.tsx
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
import { checkGuess } from "../../utils/gameUtils";
import { usePageTitle } from "../../context/PageTitleContext";
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { v4 as uuidv4 } from "uuid";

export default function Multiplayer() {
  const { setTitle } = usePageTitle();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [secretNumber, setSecretNumber] = useState("");
  const [guess, setGuess] = useState("");
  const [userGuesses, setUserGuesses] = useState<string[]>([]);
  const [opponentGuesses, setOpponentGuesses] = useState<string[]>([]);
  const [gameState, setGameState] = useState("waiting");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [roomData, setRoomData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [openSecretDialog, setOpenSecretDialog] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    setTitle("Multiplayer");
  }, [setTitle]);

  useEffect(() => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      const unsubscribe = onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setRoomData(data);
  
          if (data.player1 === playerId || data.player2 === playerId) {
            setUserGuesses(data.player1 === playerId ? data.player1Guesses || [] : data.player2Guesses || []);
            setOpponentGuesses(data.player1 === playerId ? data.player2Guesses || [] : data.player1Guesses || []);
          }
  
          if (data.player1 && data.player2) {
            setOpponentReady(data.player1 === playerId ? data.player2Ready : data.player1Ready);
            if (data.player1Ready && data.player2Ready) {
              setGameStarted(true);
            } else if (data.player1Ready && playerId === data.player2) {
              setOpenSecretDialog(true);
            } else if (data.player2Ready && playerId === data.player1) {
              setOpenSecretDialog(true);
            } else if (!data.player1Ready || !data.player2Ready) {
              setOpenSecretDialog(true);
            }
          }
        } else {
          console.log("No such document!");
        }
      });
  
      return () => unsubscribe();
    }
  }, [roomId, playerId]);
  
  

  const createRoom = async () => {
    try {
      const playerId = uuidv4();
      setPlayerId(playerId);
      localStorage.setItem('playerId', playerId);
      
      const roomRef = await addDoc(collection(db, "rooms"), {
        player1: playerId,
        player1Ready: false,
        player2: null,
        player2Ready: false,
        player1Guesses: [],
        player2Guesses: []
      });
      
      setRoomId(roomRef.id);
      localStorage.setItem('roomId', roomRef.id);
      console.log("Room created with ID: ", roomRef.id);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };
  
  const joinRoom = () => {
    const roomId = prompt('Enter Room ID');
    if (roomId) {
      setRoomId(roomId);
      localStorage.setItem('roomId', roomId);
      
      const playerId = uuidv4();
      setPlayerId(playerId);
      localStorage.setItem('playerId', playerId);
  
      const roomRef = doc(db, "rooms", roomId);
      updateDoc(roomRef, {
        player2: playerId,
      });
    }
  };
  

  const setSecret = async () => {
    if (roomId && playerId && roomData) {
      const roomRef = doc(db, "rooms", roomId);
      const updateData = playerId === roomData.player1 
        ? { player1Ready: true, player1Secret: secretNumber }
        : { player2Ready: true, player2Secret: secretNumber };
  
      await updateDoc(roomRef, updateData);
      setPlayerReady(true);
      setOpenSecretDialog(false); // Close the dialog after setting the secret number
  
      if (roomData.player1Ready && roomData.player2Ready) {
        setGameStarted(true); // Start the game if both players are ready
      }
    }
  };
  


  const handleGuess = async () => {
    if (guess.length === 4 && new Set(guess).size === 4) {
      if (roomId && playerId && roomData) {
        const roomRef = doc(db, "rooms", roomId);
        const docSnap = await getDoc(roomRef);
        const roomData = docSnap.data();

        const opponentSecret =
          playerId === roomData?.player1
            ? roomData?.player2Secret
            : roomData?.player1Secret;
        const feedback = checkGuess(guess, opponentSecret);

        const newUserGuesses = [
          ...userGuesses,
          `Your guess: ${guess} - ${feedback}`,
        ];
        setUserGuesses(newUserGuesses);

        const updateData =
          playerId === roomData?.player1
            ? { player1Guesses: newUserGuesses }
            : { player2Guesses: newUserGuesses };

        await updateDoc(roomRef, updateData);

        setGuess("");
        if (feedback === "4M 0C") {
          setSnackbarMessage(`Congratulations! You guessed the number!`);
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          handleRestart();
        }
      }
    } else {
      setSnackbarMessage("Guess must be 4 unique digits");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRestart = async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        player1Ready: false,
        player2Ready: false,
        player1Guesses: [],
        player2Guesses: [],
      });
    }
    setSecretNumber("");
    setGuess("");
    setUserGuesses([]);
    setOpponentGuesses([]);
    setGameState("waiting");
  };

  const leaveRoom = async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      await deleteDoc(roomRef);
      localStorage.removeItem("roomId");
      localStorage.removeItem("playerId");
      setRoomId(null);
      setPlayerId(null);
      setGameState("waiting");
    }
  };
  return (
    <Container style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex="1">
        {!roomId ? (
          <>
            <Button variant="contained" onClick={createRoom}>
              Create Room
            </Button>
            <Button variant="contained" onClick={joinRoom}>
              Join Room
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4">Room ID: {roomId}</Typography>
            <Button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/multiplayer/${roomId}`)}>Copy Link</Button>
            {gameStarted && (
              <>
                <TextField
                  fullWidth
                  label="Your Guess"
                  variant="outlined"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={!gameStarted}
                />
                <Button fullWidth variant="contained" color="primary" onClick={handleGuess} disabled={!gameStarted}>
                  Guess
                </Button>
                {userGuesses.length > 0 && (
                  <Box style={{ borderRadius: "5px", border: "1px solid #ccc", width: "100%", padding: "20px" }}>
                    <Typography variant="h6">Your Guesses:</Typography>
                    {userGuesses.map((userGuess, index) => (
                      <Typography key={index}>{userGuess}</Typography>
                    ))}
                  </Box>
                )}
                {opponentGuesses.length > 0 && (
                  <Box style={{ borderRadius: "5px", border: "1px solid #ccc", width: "100%", padding: "20px" }}>
                    <Typography variant="h6">Opponent's Guesses:</Typography>
                    {opponentGuesses.map((opponentGuess, index) => (
                      <Typography key={index}>{opponentGuess}</Typography>
                    ))}
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>
      <Dialog disableEscapeKeyDown maxWidth="xs" open={openSecretDialog} onClose={() => setOpenSecretDialog(false)}>
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
          <Button onClick={setSecret}>Confirm</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
  
  
}
