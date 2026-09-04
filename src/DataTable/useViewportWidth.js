import { useState, useEffect } from 'react';

function getViewportWidth() {
  if (typeof window === 'undefined') {
    return 0;
  }
  return window.innerWidth;
}

export function useViewportWidth() {
  const [width, setWidth] = useState(getViewportWidth);

  useEffect(() => {
    const handleResize = () => setWidth(getViewportWidth());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}
