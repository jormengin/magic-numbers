// src/utils/gameUtils.ts

export const generateMachineNumber = (numberList: string[]) => {
  const randomIndex = Math.floor(Math.random() * numberList.length);
  return numberList[randomIndex];
};

// const simulateAllFeedbacks = (guess: string, numberList: string[]) => {
//   const feedbackMap: { [key: string]: number } = {};
//   numberList.forEach(number => {
//     const feedback = checkGuess(guess, number);
//     feedbackMap[feedback] = (feedbackMap[feedback] || 0) + 1;
//   });

//   return feedbackMap;
// };

// export const minimaxGuessSelection = (numberList: string[]) => {
//   let bestGuess = numberList[0];
//   let bestScore = Number.MAX_VALUE;

//   numberList.forEach(guess => {
//     const feedbackMap = simulateAllFeedbacks(guess, numberList);

//     const worstCase = Math.max(...Object.values(feedbackMap));
//     if (worstCase < bestScore) {
//       bestScore = worstCase;
//       bestGuess = guess;
//     }
//   });
//   console.log(bestGuess);
//   return bestGuess;
// };
export const getFourDifferentDigits = (excludeDigits: Set<string>, numberList: string[]) => {
  for (let i = 0; i < numberList.length; i++) {
    const number = numberList[i];
    const digits = new Set(number.split(''));
    const intersection = new Set([...excludeDigits].filter(digit => digits.has(digit)));

    if (intersection.size === 0) {
      return number;
    }
  }
  // In case we don't find a number that matches the criteria, just return the first number
  return numberList[0];
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
