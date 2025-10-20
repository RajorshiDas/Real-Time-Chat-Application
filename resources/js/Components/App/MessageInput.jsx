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
import EmojiPicker from "emoji-picker-react";
import { Fragment } from "react";
import { Popover, PopoverPanel, Transition } from "@headlessui/react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { isAudio, isImage } from "@/helpers";
import AttachmentPreview from "./AttachmentPreview";
import CustomAudioPlayer from "./CustomAudioPlayer";
import AudioRecorder from "./AudioRecorder";



const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState("");
    const [inputErrorMessage, setInputErrorMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);
    const [chosenFiles, setChosenFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onFileChange = (ev) => {
        const files = ev.target.files;
        const uploadedFiles = [...files].map((file) => {
            return {
                file: file,
                url : URL.createObjectURL(file),

            };
        });
        ev.target.value = null;

        setChosenFiles((prevFiles) => {
            return [...prevFiles, ...uploadedFiles];
        });
    };
    // Function to send a message
    const sendMessage = (message, clearInput = true) => {
        if (message.trim() === ""  && chosenFiles.length === 0) {
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
      chosenFiles.forEach((file) => {
        formData.append("attachments[]", file.file);


      });


        formData.append("message", message);

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
                    // ...existing code...
                    setUploadProgress(progress);
                },
            })
            .then((response) => {
                // ...existing code...
                if (clearInput) setNewMessage(""); // Only clear if needed
                setInputErrorMessage("");
                setMessageSending(false);
                setChosenFiles([]);
                setUploadProgress(0);
            })
            .catch((error) => {
                // ...existing code...

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

                setChosenFiles([]);
            });
    };

    // Like button handler: send only 👍, don't clear input
    const onLikeClick = () => {
        sendMessage("👍", false);
    };

    const recordedAudioReady = (file,url) => {
        setChosenFiles((prevFiles) => {
            return [...prevFiles, { file: file, url: url }];
        });
    };
    return (
        <div className="flex flex-wrap items-start border-t border-slate-700 py-3">
            <div className="order-2 flex-1 xs:flex-none xs:order-1 p-2">
                <button className="p-1 text-gray-400 hover:text-gray-300 relative">
                    <PaperClipIcon className="w-6" />
                    <input
                        type="file"
                        onChange={onFileChange}
                        multiple
                        className="absolute top-0 left-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-300 relative">
                    <PhotoIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        accept="image/*"
                        className="absolute top-0 left-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <AudioRecorder fileReady={recordedAudioReady} />
            </div>
            <div className="order-1 px-3 xs:p-0 min-w-[220px] basis-full xs:basis-0 xs:order-2 flex-1 relative">
                <div className="flex">
                    <NewMessageInput
                        onSend={sendMessage}
                        value={newMessage}

                        onChange={(e) => setNewMessage(e.target.value)}
                    />

                    <button
                        onClick={() => sendMessage(newMessage, true)}
                        disabled={messageSending}
                        className="btn btn-info rounded-l-none"
                    >
                        {messageSending && (
                            <span className="loading loading-spinner loading-xs"></span>
                        )}
                        <PaperAirplaneIcon className="w-6" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </div> {""}
                {!!uploadProgress && (
                    <process
                        className="progress progress-info w-full mt-1"
                        value={uploadProgress}
                        max="100"
                    ></process>
                )}
                {inputErrorMessage && (
                    <p className="text-red-400 text-xs">{inputErrorMessage}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                    {chosenFiles.map((file) => (
                        <div
                         key={file.file.name}
                         className={`relative flex justify-between cursor-pointer` +
                            (!isImage(file.file)? "w-[240px]" : "")}>
                            {isImage(file.file) && (
                                <img
                                    src={file.url}
                                    alt= ""
                                    className="w-16 h-16 object-cover"
                                />
                            )}
                            {isAudio(file.file) && (
                                <CustomAudioPlayer
                                    file={file}
                                    showVolume={false}
                                />
                            )}
                            {/* <audio src={file.url} controls></audio> */}
                            {!isAudio(file.file) && !isImage(file.file) && (
                                <AttachmentPreview file={file} />
                            )}
                            <button
                                onClick={() =>
                                    setChosenFiles(
                                    chosenFiles.filter(
                                        (f) =>
                                            f.file.name !== file.file.name
                                       )
                                    )

                                }
                                className="absolute w-6 h-6 rounded-full bg-gray-800 text-gray-400 hover:text-gray-300 top-0 right-0 flex items-center justify-center z-10"
                                   >
                                    <XCircleIcon className="w-6 " />

                            </button>

                        </div>
                    ))}
                </div>
            </div>

            <div className="order-3 xs:order-3 p-2 flex">
                <Popover className="relative">
                    <Popover.Button className="p-1 text-gray-400 hover:text-gray-300">
                        <FaceSmileIcon className="w-6 h-6" />
                    </Popover.Button>
                    <Popover.Panel
                        className="absolute z-50 bottom-full mb-2 right-0"
                        style={{ minWidth: 250 }}
                    >
                        <EmojiPicker
                            theme="dark"
                            onEmojiClick={(emoji) => {
                                setNewMessage(newMessage + emoji.emoji);
                            }}
                        />
                    </Popover.Panel>
                </Popover>

                <button onClick={onLikeClick} className="p-1 text-gray-400 hover:text-gray-300">
                    <HandThumbUpIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
