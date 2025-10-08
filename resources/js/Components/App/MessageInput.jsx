import { useState } from "react";
import {
    PaperAirplaneIcon,
    PaperClipIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";
import NewMessageInput from "./NewMessageInput";
import axios from "axios";

const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState("");
    const [inputErrorMessage, setInputErrorMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);

    const onSendClick = () => {
        if (newMessage.trim() === "") {
            setInputErrorMessage("Please enter a valid message or upload a file.");
            setTimeout(() => {
                setInputErrorMessage("");
            }, 3000);
            return;
        }

        if (!conversation) {
            setInputErrorMessage("Please select a conversation");
            setTimeout(() => {
                setInputErrorMessage("");
            }, 3000);
            return;
        }

        const formData = new FormData();
        formData.append("message", newMessage);

        if (conversation.is_user) {
            formData.append("receiver_id", conversation.id);
        } else if (conversation.is_group) {
            formData.append("group_id", conversation.id);
        }

        setMessageSending(true);

        axios
            .post(route("message.store"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log(`Upload Progress: ${progress}%`);
                },
            })
            .then((response) => {
                console.log("Message sent:", response.data);
                setNewMessage("");
                setInputErrorMessage("");
            })
            .catch((error) => {
                console.error("Error sending message:", error);
                console.error("Error response:", error.response?.data);
                console.error("Error status:", error.response?.status);

                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    "Failed to send message";
                setInputErrorMessage(message);
                setTimeout(() => {
                    setInputErrorMessage("");
                }, 3000);
            })
            .finally(() => {
                setMessageSending(false);
            });
    };

    return (
        <div className="flex flex-wrap items-start border-t border-slate-700 py-3">
            <div className="order-2 flex-1 xs:flex-none xs:order-1 p-2">
                <button className="p-1 text-gray-400 hover:text-gray-300 relative">
                    <PaperClipIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        className="absolute top-0 left-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-300 relative">
                    <PhotoIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute top-0 left-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
            </div>
            <div className="order-1 px-3 xs:p-0 min-w-[220px] basis-full xs:basis-0 xs:order-2 flex-1 relative">
                <div className="flex">
                    <NewMessageInput
                        onSend={onSendClick}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />

                    <button
                        onClick={onSendClick}
                        disabled={messageSending}
                        className="btn btn-info rounded-l-none"
                    >
                        {messageSending && (
                            <span className="loading loading-spinner loading-xs"></span>
                        )}
                        <PaperAirplaneIcon className="w-6" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </div>
                {inputErrorMessage && (
                    <p className="text-red-400 text-xs">{inputErrorMessage}</p>
                )}
            </div>
            <div className="order-3 xs:order-3 p-2 flex">
                <button className="p-1 text-gray-400 hover:text-gray-300">
                    <FaceSmileIcon className="w-6 h-6" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-300">
                    <HandThumbUpIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
