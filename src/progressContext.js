import React, { createContext, useContext, useState } from "react";

// Create context
const ProgressContext = createContext();

// Provider component
export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(0); // Default progress value

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

// Hook to use progress context
export const useProgress = () => {
  return useContext(ProgressContext);
};
