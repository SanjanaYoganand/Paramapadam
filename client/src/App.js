import React, { useState, useRef } from 'react';
import axios from 'axios';
import diceRollGif from './assets/dice-roll.gif';
import diceRoll1Gif from './assets/dice-roll1.gif';
import diceRollSound from './assets/bling.mp3';
import './App.css'; // Optional: keep if you're using global styles


function App() {

  const [P1pos, setP1] = useState(1); // Computer (Red) - start at 1
  const [P2pos, setP2] = useState(1); // User (Blue) - start at 1
  const [turn, setTurn] = useState(1);
  const [, setIsComputerRolling] = useState(false);
  // Update state declarations
  const [userDiceValue, setUserDiceValue] = useState(null);
  const [computerDiceValue, setComputerDiceValue] = useState(null);
  const [snldMsg, setSnldMsg] = useState('');
  const [showMsg, setShowMsg] = useState(false);
  const audioRef = useRef(null);
  const [showUserDiceGif, setShowUserDiceGif] = useState(false);
const [showComputerDiceGif, setShowComputerDiceGif] = useState(false);
const userRollAudioRef = useRef(null);
const computerRollAudioRef = useRef(null);


const handleSnldFeedback = (snld) => {
  if (snld === "snake") {
    setSnldMsg("WHOOPS! SNAKE! 🐍");
    setShowMsg(true);

    const audio = new Audio("/snake.mp3");
    audio.play().catch(err => console.log("Audio error:", err));
  } 
  else if (snld === "ladder") {
    setSnldMsg("YAY! LADDER! 🪜");
    setShowMsg(true);

    const audio = new Audio("/ladder.mp3");
    audio.play().catch(err => console.log("Audio error:", err));
  } 
  else {
    setShowMsg(false);
    setSnldMsg("");
    return;
  }

  setTimeout(() => {
    setShowMsg(false);
    setSnldMsg("");
  }, 6000);
};

  // Function to get coordinates based on position
const getCoordinates = (pos) => {
  if (pos < 1 || pos > 132) {
    return { left: '-100%', top: '-100%' };
  }

  const baseLeft = 57.87;
  const baseTop = 749.625;
  const squareWidth = 61.93;
  const squareHeight = 60.435;

  const row = Math.floor((pos - 1) / 11);
  const col = row % 2 === 0
    ? (pos - 1) % 11
    : 10 - ((pos - 1) % 11);

  return {
    left: `${((baseLeft + col * squareWidth) / 740) * 100}%`,
    top: `${((baseTop - row * squareHeight - (1.3 * squareHeight)) / 740) * 100}%`
  };
};
  
  // rollDice function
  const rollDice = async () => {
    try {
      setUserDiceValue('-');
      setShowUserDiceGif(true); // 👈 Show user dice gif
      userRollAudioRef.current.play();
      await new Promise(resolve => setTimeout(resolve, 3000));
  
      const { data } = await axios.post('https://paramapadam-server.onrender.com/api/game/dice-roll');
      setUserDiceValue(data.value);
      setShowUserDiceGif(false); // 👈 Hide after roll shown
  
      await new Promise(resolve => setTimeout(resolve, 2000));
      await movePlayer(data.value);
    } catch (err) {
      console.error("Dice roll error:", err);
      setShowUserDiceGif(false); // fallback
    }
  };
  

  
  const movePlayer = async (dice) => {
    try {
      const { data } = await axios.post('https://paramapadam-server.onrender.com/api/game/move', {
        player: turn,
        dice,
      });

      handleSnldFeedback(data.snld);
  
      // Show intermediate position (landedPos)
      if (turn === 1) setP1(data.landedPos);
else setP2(data.landedPos);

if (data.landedPos !== data.finalPos) {
  // Let React flush the landedPos to DOM
  await new Promise(resolve => setTimeout(resolve, 0));
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (turn === 1) setP1(data.finalPos);
  else setP2(data.finalPos);
}

      // Update turn and positions
      setP1(data.P1pos);
      setP2(data.P2pos);
      setTurn(data.turn);// Show intermediate position
      if (turn === 1) setP1(data.landedPos);
      else setP2(data.landedPos);
      
      // Let React render it before proceeding
      await new Promise(resolve => requestAnimationFrame(() => resolve()));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now show final position
      if (turn === 1) setP1(data.finalPos);
      else setP2(data.finalPos);
      
      // Finally, update all positions and turn state from backend
      setP1(data.P1pos);
      setP2(data.P2pos);
      setTurn(data.turn);      
  
      if (data.winner) return;
  
      // Use data.turn directly, NOT the state variable "turn"
      if (data.turn === 2) {
        setIsComputerRolling(true);
        setComputerDiceValue('-');
        setShowComputerDiceGif(true); 
        computerRollAudioRef.current.play();
        await new Promise(resolve => setTimeout(resolve, 3000));
        setShowComputerDiceGif(false);
        const computerDice = Math.floor(Math.random() * 6) + 1;
        setComputerDiceValue(computerDice);
        await new Promise(resolve => setTimeout(resolve, 2000));
      
        const computerMove = await axios.post('https://paramapadam-server.onrender.com/api/game/move', {
          player: 2,
          dice: computerDice,
        });

        handleSnldFeedback(computerMove.data.snld);
      
        // 🟡 Intermediate step
        setP2(computerMove.data.landedPos);
      
        if (computerMove.data.landedPos !== computerMove.data.finalPos) {
          // 🔁 Force browser to render landedPos before waiting
          await new Promise(resolve => requestAnimationFrame(() => resolve()));
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1s
          setP2(computerMove.data.finalPos);
        }
      
        setP1(computerMove.data.P1pos);
        setTurn(computerMove.data.turn);
        setIsComputerRolling(false);
      }
      
    } catch (err) {
      console.error("Move error:", err);
      setIsComputerRolling(false);
    }
  };
  
  

  return (
    <div className="game-container">
      {/* Turn Indicator at the top */}
      <div
        style={{
          position: 'absolute',
          top: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
          fontSize: '2.2em',
          fontWeight: 900,
          letterSpacing: '2px',
          color: turn === 1 ? '#40c4ff' : '#ff5252',
          textShadow: '0 2px 8px rgba(0,0,0,0.25)',
          background: 'rgba(0,0,0,0.55)',
          padding: '16px 48px',
          borderRadius: '18px',
          border: `2.5px solid ${turn === 1 ? '#40c4ff' : '#ff5252'}`,
          boxShadow: '0 2px 16px rgba(0,0,0,0.18)'
        }}
      >
       {turn === 1 ? "PLAYER'S TURN" : "COMPUTER'S TURN"}

{showMsg && (
  <div style={{
    marginTop: '1px',
    fontSize: '15px',
    fontWeight: 900,
    color: snldMsg.includes("SNAKE") ? '#ff5252' : '#4caf50',
    letterSpacing: '2px',
    textAlign: 'center'
  }}>
    {snldMsg}
  </div>
)}
</div>
      {/* Computer Panel (Left) */}
      <div className={`side-panel computer-panel${turn !== 2 ? ' active' : ''}`}>
        <div
          className="panel-content"
          style={{
            background: 'rgba(0,0,0,0.65)',
            borderRadius: '18px',
            padding: '32px 18px',
            color: '#fff',
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)'
          }}
        >
          <h2 style={{
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 700,
            fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.25)',
            color: '#fff'
          }}>Computer</h2>
          <p style={{
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: 600,
            fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
            color: '#fff'
          }}>Current Position: <span style={{fontWeight: 900}}>{P2pos}</span></p>
          
          <p style={{
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: 600,
            fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
            color: '#fff'
          }}>Computer's Turn: <span style={{fontWeight: 900}}>{turn === 2 ? "YES" : "NO"}</span></p>
        {turn === 2 && computerDiceValue && (
    <div style={{
      background: 'rgba(0,0,0,0.65)',
      borderRadius: '12px',
      padding: '10px 24px',
      margin: '16px auto',
      display: 'inline-block',
      minWidth: '160px'
    }}>
      {computerDiceValue === '-' ? (
        <p style={{
          color: '#ff5252',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 700,
          fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
          margin: 0
        }}>Rolling Dice...</p>
      ) : (
        <p style={{
          color: '#ff5252',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 700,
          fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
          margin: 0
        }}>Dice Rolled: {computerDiceValue}</p>
      )}
    </div>
  )}
        </div>
      </div>
      {/* Board Centered */}
     <div className="board-container">
  <div className="board-wrapper">

    <img
      src={require('./assets/board.png')}
      alt="Board"
      className="board-image"
    />

    {/* USER / PLAYER MARKER */}
    <img
      src="/p1.png"
      alt="Player"
      style={{
        position: 'absolute',
        left: getCoordinates(P1pos).left,
        top: getCoordinates(P1pos).top,
        width: '7.43%',
        height: '7.43%',
        objectFit: 'contain',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />

    {/* COMPUTER MARKER */}
    <img
      src="/p2.png"
      alt="Computer"
      style={{
        position: 'absolute',
        left: getCoordinates(P2pos).left,
        top: getCoordinates(P2pos).top,
        width: '7.43%',
        height: '7.43%',
        objectFit: 'contain',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />

  </div>
</div>
      {/* User Panel (Right) */}
      <div className={`side-panel user-panel${turn !== 1 ? ' active' : ''}`}>
        <div className="panel-content"  style={{
            background: 'rgba(0,0,0,0.65)',
            borderRadius: '18px',
            padding: '32px 18px',
            color: '#fff',
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)'
          }}>
          <h2 style={{
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 700,
            fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.25)',
            color: '#fff'
          }}>User</h2>
          <p style={{
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: 600,
            fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
            color: '#fff'
          }}>Current Position: <span style={{fontWeight: 900}}>{P1pos}</span></p>
          
          <p style={{
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: 600,
            fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
            color: '#fff'
          }}>Your Turn: <span style={{fontWeight: 900}}>{turn === 1 ? "YES" : "NO"}</span></p>
          {/* Replace the existing user dice display with: */}
          {turn === 1 && userDiceValue && (
    <div style={{
      background: 'rgba(0,0,0,0.65)',
      borderRadius: '12px',
      padding: '10px 24px',
      margin: '16px auto',
      display: 'inline-block',
      minWidth: '160px'
    }}>
      {userDiceValue === '-' ? (
        <p style={{
          color: '#40c4ff',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 700,
          fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
          margin: 0
        }}>Rolling Dice...</p>
      ) : (
        <p style={{
          color: '#40c4ff',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 700,
          fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
          margin: 0
        }}>Dice Rolled: {userDiceValue}</p>
      )}
    </div>
  )}
     
          <button 
            onClick={rollDice} 
            disabled={turn !== 1}
            style={{
              background: turn === 1 ? '#40c4ff' : '#666',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '1.2em',
              fontWeight: 700,
              fontFamily: "'Orbitron', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: turn === 1 ? 'pointer' : 'not-allowed',
              boxShadow: turn === 1 ? '0 4px 8px rgba(64, 196, 255, 0.3)' : 'none',
              transition: 'all 0.3s ease',
              marginTop: '20px',
              width: '100%',
              maxWidth: '200px'
            }}
          >
            Roll Dice
          </button>
        </div>
      </div>


<audio ref={audioRef}>
  <source src="" type="audio/mp3" />
</audio>
{showUserDiceGif && (
  <img
    src={diceRollGif}
    alt="Rolling..."
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '300px',
      height: '200px',
      zIndex: 1000,
    }}
  />
)}

{showComputerDiceGif && (
  <img
    src={diceRoll1Gif}
    alt="Computer Rolling..."
    style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '300px',
      height: '200px',
      zIndex: 1000,
    }}
  />
)}
<audio ref={userRollAudioRef} src={diceRollSound} volume={0.5} />
<audio ref={computerRollAudioRef} src={diceRollSound} volume={0.5} />
<audio
  src="/bgm.mp3"
  autoPlay
  loop
/>

    </div>
  
  );
}

export default App;
