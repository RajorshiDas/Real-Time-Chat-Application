import React, { useEffect, useRef } from "react";

const NewMessageInput = ({ value, onChange, onSend }) => {
    const input = useRef();
    const onInputKeyDown = (e) => {
        // Shift+Enter sends the message
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            onSend();
        }
        // Enter alone allows new line (default behavior)
    };
    const onChangeEvent = (e) => {
        onChange(e);
        setTimeout(() => {
            adjustHeight();
        }, 10);
    };
    const adjustHeight = () => {
        setTimeout(() => {
            if (input.current) {
                input.current.style.height = "auto";
                input.current.style.height = input.current.scrollHeight + 1 + "px";
            }
        }, 10);
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={input}
            value={value}
            rows="1"
            placeholder="Type a message"
            onKeyDown={onInputKeyDown}
            onChange={onChangeEvent}
            className="input input-bordered w-full rounded resize-none overflow-auto max-h-40 bg-slate-800 text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600 p-2"
        ></textarea>
    );
};
export default NewMessageInput;
