import { useState } from 'react';

export function useDenseToggle() {
  const [dense, setDense] = useState(false);

  const toggleDense = () => {
    setDense((prev) => !prev);
  };

  return { dense, toggleDense };
}