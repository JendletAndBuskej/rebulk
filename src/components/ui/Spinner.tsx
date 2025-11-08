import React from 'react';

const Spinner: React.FC = () => (
  <div className="spinner" role="status" aria-live="polite" aria-label="Loading">
    <div className="spinner__circle" />
    <span>Loading</span>
  </div>
);

export default Spinner;

