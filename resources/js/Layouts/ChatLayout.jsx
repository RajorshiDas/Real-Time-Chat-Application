import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const ChatLayout = ({children}) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});

    const isUserOnline = (userId) => {
        return onlineUsers[userId];
    };


    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);

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


    return(
        <>
            ChatLayout
            <div>{children}</div>
        </>
    );

};
export default ChatLayout;
