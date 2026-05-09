function createEventBus() {
  const listenersByEvent = new Map();

  function on(eventName, handler) {
    if (!eventName || typeof handler !== "function") {
      return () => {};
    }

    const listeners = listenersByEvent.get(eventName) ?? new Set();
    listeners.add(handler);
    listenersByEvent.set(eventName, listeners);

    return () => off(eventName, handler);
  }

  function off(eventName, handler) {
    const listeners = listenersByEvent.get(eventName);

    if (!listeners) {
      return false;
    }

    const deleted = listeners.delete(handler);

    if (listeners.size === 0) {
      listenersByEvent.delete(eventName);
    }

    return deleted;
  }

  function emit(eventName, payload = null) {
    const listeners = listenersByEvent.get(eventName);

    if (!listeners) {
      return false;
    }

    for (const listener of [...listeners]) {
      try {
        listener(payload);
      } catch (error) {
        console.error(`[EventBus] ${eventName} listener failed`, error);
      }
    }

    return true;
  }

  return {
    on,
    off,
    emit,
  };
}

export const eventBus = createEventBus();

export { createEventBus, eventBus as EventBus };
