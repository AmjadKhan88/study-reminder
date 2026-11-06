type Listener = () => void;
const listeners = new Set<Listener>();

export const onKeyProblem = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitKeyProblem = () => listeners.forEach((l) => l());
