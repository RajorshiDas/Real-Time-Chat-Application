import { usePage } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import UserAvatar from './UserAvatar';
import {formatMessageDateLong} from '@/helpers';
import MessageInput from './MessageInput';

import MessageOptionsDropdown from './MessageOptionsDropdown';
import MessageAttachments from './MessageAttachments';



const MessageItem = ({message ,attachmentClick}) => {

     const currentUser = usePage().props.auth.user;
     return (
    <div className={
        "chat" + (message.sender_id === currentUser.id
            ? " chat-end"
            : " chat-start")


        }
        >
            {<UserAvatar user={message.sender} />}

        <div className="chat-header text-white">
            {message.sender_id !== currentUser.id
            ? message.sender.name
            : "You"}
            <time className="text-xs opacity-50 ml-2 text-white">
                {formatMessageDateLong(message.created_at)}
            </time>
            </div>
            <div className={"chat-bubble relative " +
                (message.sender_id === currentUser.id
                    ? "chat-bubble-info"
                    : "")
            }>
           {message.sender_id === currentUser.id &&
           (

           <MessageOptionsDropdown message={message} />
              )}
                   <div className="chat-message">
                    <div className="chat-message-content">
                        <ReactMarkdown>
                            {message.message}
                        </ReactMarkdown>
                    </div>
                    <MessageAttachments
                    attachments = {message.attachments}
                    attachmentClick = {attachmentClick}

                    />
                 </div>
           </div>
     </div>

     );

};
export default MessageItem;
