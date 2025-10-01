import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const ChatLayout = ({children}) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [onlineUsers, setOnlineUsers] = useState({});

    const isUserOnline = (userId) => {
        return onlineUsers[userId];
    };

    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);



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
