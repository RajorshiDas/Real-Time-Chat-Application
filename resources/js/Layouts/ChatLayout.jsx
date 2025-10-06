import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationItem from "@/Components/App/ConversationItem";

const ChatLayout = ({children}) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});

    const isUserOnline = (userId) => {
        // Temporary: make the current user (Rajorshi Das) always appear online for testing
        if (userId === 1) return true;
        return onlineUsers[userId] || false;
    };

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    };



    useEffect(() => {
        if (localConversations && Array.isArray(localConversations)) {
            setSortedConversations(
                [...localConversations].sort((a, b) => {
                    if(a.blocked_at && b.blocked_at) {
                        return a.blocked_at > b.blocked_at ? 1 : -1;
                    }
                    else if (a.blocked_at) {
                        return 1;
                    }
                    else if (b.blocked_at) {
                        return -1;
                    }
                    if(a.last_message_date && b.last_message_date) {
                        return b.last_message_date.localeCompare(a.last_message_date);
                    }
                    else if (a.last_message_date) {
                        return -1;
                    }
                    else if (b.last_message_date) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                })
            );
        } else {
            setSortedConversations([]);
        }
    }, [localConversations]);

    useEffect(() => {
        setLocalConversations(conversations || []);
    }, [conversations]);

    useEffect(() => {
        if (window.Echo) {
            window.Echo.join('online')
                .here((users) => {
                   const onlineUserObject = Object.fromEntries(
                    users.map(user => [user.id, user])
                );
                   setOnlineUsers(prevOnlineUsers => {
                    return { ...prevOnlineUsers, ...onlineUserObject };
                   });
                })
                .joining((user) => {
                    setOnlineUsers((prevOnlineUsers) => {
                         const updatedOnlineUsers = { ...prevOnlineUsers };
                         updatedOnlineUsers[user.id] = user;
                         return updatedOnlineUsers;
                    });
                })
                .leaving((user) => {
                    setOnlineUsers((prevOnlineUsers) => {
                         const updatedOnlineUsers = { ...prevOnlineUsers };
                         delete updatedOnlineUsers[user.id];
                         return updatedOnlineUsers;
                    });
                })
                .error((error) => {
                    console.error("Error", error);
                });
        }
    }, []);

    return (
        <div className="flex w-full h-full">
            {/* Left Sidebar - Conversations */}
            <div className={`transition-all w-full sm:w-[220px] lg:w-[300px] border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full
                ${selectedConversation ? "-ml-[100%] sm:ml-0" : ""}
            `}>
                {/* Header - Fixed */}
                <div className="flex items-center justify-between py-2 px-3 text-xl font-medium border-b border-gray-300 dark:border-gray-700">
                    My Conversations
                    <div className="tooltip tooltip-left" data-tip="Create new Group">
                        <button className="text-gray-400 hover:text-gray-200">
                            <PencilSquareIcon className="w-4 h-4 inline-block ml-2"/>
                        </button>
                    </div>
                </div>

                {/* Search - Fixed */}
                <div className="p-3 border-b border-gray-300 dark:border-gray-700">
                    <TextInput
                        onKeyUp={onSearch}
                        placeholder="Filter users and groups"
                        className="w-full"
                    />
                </div>

                {/* Conversations List - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {sortedConversations &&
                    sortedConversations.map((conversation) => (
                        <ConversationItem
                            key={`${
                                conversation.is_group
                                ? "group_"
                                : "user_"
                            } ${conversation.id}`}
                            conversation={conversation}
                            online={conversation.is_group ? false : !!isUserOnline(conversation.id)}
                            selectedConversation={selectedConversation}
                        />
                    ))}
                </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default ChatLayout;
