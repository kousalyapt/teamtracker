import React, { createContext, useState, useContext } from 'react';


const ShowTaskDetailsContext = createContext();

export const useShowTaskDetails = () => useContext(ShowTaskDetailsContext);

export const ShowTaskDetailsProvider = ({ children }) => {
  const [showTaskDetails, setShowTaskDetails] = useState(null);

  return (
    <ShowTaskDetailsContext.Provider value={{ showTaskDetails, setShowTaskDetails }}>
      {children}
    </ShowTaskDetailsContext.Provider>
  );
};
