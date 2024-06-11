// src/utils/gameUtils.ts

export const generateMachineNumber = (numberList: string[]) => {
    const randomIndex = Math.floor(Math.random() * numberList.length);
    return numberList[randomIndex];
  };
  
  export const checkGuess = (guess: string, target: string) => {
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
  
  export const generateNumberList = () => {
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
  
  export const updateLeaderboard = (
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
    setLeaderboard(leaderboard);
  };
  