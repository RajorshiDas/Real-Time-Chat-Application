import React, { useContext } from 'react';

// Create the context
const EventBusContext = React.createContext();

export const EventBusProvider = ({ children }) => {
    const [events, setEvents] = React.useState({});

    const emit = (name, data) => {
        if (events[name]) {
            events[name].forEach((callback) => callback(data));
        }
    };

    const on = (name, callback) => {
        if (!events[name]) {
            events[name] = [];
        }
        events[name].push(callback);

        // Return unsubscribe function
        return () => {
            setEvents((prevEvents) => ({
                ...prevEvents,
                [name]: prevEvents[name].filter((cb) => cb !== callback),
            }));
        };
    };

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
