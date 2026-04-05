import { createContext, useContext } from "react";

export const QueueContext = createContext({
  queueItems: [],
  isQueueExpanded: true,
  setIsQueueExpanded: () => {},
  addToQueue: () => {},
  removeFromQueue: () => {},
  clearQueue: () => {},
});

export const useQueue = () => useContext(QueueContext);
