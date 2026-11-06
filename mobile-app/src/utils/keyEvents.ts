type Listener = () => void;
const listeners = new Set<Listener>();
const pineconeListeners = new Set<Listener>();

export const onKeyProblem = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const onPineconeProblem = (listener: Listener) => {
  pineconeListeners.add(listener);
  return () => {
    pineconeListeners.delete(listener);
  };
};

export const emitPineconeProblem = () => pineconeListeners.forEach((l) => l());

export const emitKeyProblem = () => listeners.forEach((l) => l());
