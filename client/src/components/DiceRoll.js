import React from 'react';

export default function Dice({ value, onRoll, disabled }) {
  return (
    <div>
      <button onClick={onRoll} disabled={disabled}>Roll Dice</button>
      {value !== null && <p>Dice rolled: {value}</p>}
    </div>
  );
}
