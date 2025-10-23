import { TrashIcon } from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { useEventBus } from "@/EventBus";

export default function MessageOptionsDropdown({ message }) {
    const { emit } = useEventBus();

    const onMessageDelete = async () => {
        try {
            if (!window.confirm('Are you sure you want to delete this message?')) {
                return;
            }

            console.log('Attempting to delete message:', message.id);

            const { data } = await axios.delete(route("message.destroy", message.id));

            console.log('Delete response:', data);

            if (data && data.success) {
                emit('message.deleted', {
                    message: message,
                    prevMessage: data.message
                });

                // Add small delay to ensure DOM updates before scrolling
                setTimeout(() => {
                    const chatContainer = document.querySelector('.overflow-y-auto');
                    if (chatContainer) {
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            console.error("Error response:", error.response);
            console.error("Message ID that failed:", message.id);

            if (error.response?.status === 404) {
                alert("This message no longer exists or has already been deleted.");
                // Emit a local delete event to remove it from UI
                emit('message.deleted', {
                    message: message,
                    prevMessage: null
                });
            } else {
                alert(error.response?.data?.message || "Error deleting message");
            }
        }
    };

    return (
        <div className="absolute right-full txt-gray-100 top-1/2 -translate-y-1/2 mr-2 z-10">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-black/40">
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onMessageDelete}
                                        className={`${
                                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                                    >
                                        <TrashIcon className="w-4 h-4 text-gray-400 mr-2" /> Delete Message
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}


