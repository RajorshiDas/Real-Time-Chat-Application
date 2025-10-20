import React, { createContext, useContext, useRef, useEffect } from 'react';

const EventBusContext = createContext();

export const EventBusProvider = ({ children }) => {
    // 🔒 store events in a ref (does NOT trigger re-render)
    const events = useRef({});

    const emit = (name, data) => {
        if (events.current[name]) {
            events.current[name].forEach((callback) => callback(data));
        }
    };

    const on = (name, callback) => {
        if (!events.current[name]) {
            events.current[name] = [];
        }
        events.current[name].push(callback);

        // Return unsubscribe function
        return () => {
            events.current[name] = events.current[name].filter((cb) => cb !== callback);
        };
    };

    // Optional cleanup (clear all events on unmount)
    useEffect(() => {
        return () => {
            events.current = {};
        };
    }, []);

    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
};

export const useEventBus = () => {
    const context = useContext(EventBusContext);
    if (!context) {
        throw new Error('useEventBus must be used within an EventBusProvider');
    }
    return context;
};
