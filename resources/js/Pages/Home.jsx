import { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';
import ConversationHeader from '@/Components/App/ConversationHeader';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import AttachmentPreviewModal from '@/Components/App/AttachmentPreviewModal';




export default function Home({messages = null, selectedConversation = null}) {
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const loadMoreIntersect = useRef(null);
    const messagesCtrRef = useRef(null);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const { on } = useEventBus();
    const page = usePage();
    const currentUserId = page.props.auth.user.id;

    const messageCreated = (message) => {
    // ...existing code...

        if (!selectedConversation) {
            return;
        }

        // For group messages
        if (selectedConversation.is_group &&
            selectedConversation.id == message.group_id) {
            setLocalMessages((prevMessages) => {
                // Check if message already exists
                if (prevMessages.find(m => m.id === message.id)) {
                    // ...existing code...
                    return prevMessages;
                }
                // ...existing code...
                return [...prevMessages, message];
            });
        }

        // For user messages
        if (selectedConversation.is_user) {
            const isMessageForThisConversation =
                (selectedConversation.id == message.sender_id) ||
                (selectedConversation.id == message.receiver_id);

            if (isMessageForThisConversation) {
                setLocalMessages((prevMessages) => {
                    // Check if message already exists
                    if (prevMessages.find(m => m.id === message.id)) {
                        // ...existing code...
                        return prevMessages;
                    }
                    // ...existing code...
                    return [...prevMessages, message];
                });
            }
        }
    };
    const messageDeleted = ({message}) => {

    // ...existing code...

        if (!selectedConversation) {
            return;
        }

        // For group messages
        if (selectedConversation.is_group &&
            selectedConversation.id == message.group_id) {
            setLocalMessages((prevMessages) => {
                // Check if message already exists
                return prevMessages.filter(m => m.id !== message.id);
            });
        }

        // For user messages
        if (selectedConversation.is_user) {
            const isMessageForThisConversation =
                (selectedConversation.id == message.sender_id) ||
                (selectedConversation.id == message.receiver_id);

            if (isMessageForThisConversation) {
                setLocalMessages((prevMessages) => {

                    return [...prevMessages.filter(m => m.id !== message.id)];
                });
            }
        }
    };


   const loadMoreMessages = useCallback(() => {
    // ...existing code...

       if(noMoreMessages || localMessages.length === 0){
           return;
       }
       // Load more messages logic here
       const firstMessage = localMessages[0];
       axios
       .get(route('message.older', firstMessage.id))
       .then(({data}) => {
           if(data.data.length === 0){
               setNoMoreMessages(true);
               return;
           }
           const scrollHeight = messagesCtrRef.current.scrollHeight;
           const scrollTop = messagesCtrRef.current.scrollTop;
           const clientHeight = messagesCtrRef.current.clientHeight;
           const tempScrollFromBottom = scrollHeight - (scrollTop + clientHeight);
           // ...existing code...
           setScrollFromBottom(tempScrollFromBottom);

           setLocalMessages((prevMessages) => {
               return [...data.data.reverse(), ...prevMessages];
           });
       })
       .catch((error) => {
           // ...existing code...
       });
   }, [localMessages, noMoreMessages]);

   const onAttachmentClick = (attachments , index) => {
        setPreviewAttachment({ attachments , index });
        setShowAttachmentPreview(true);
   };
    useEffect(() => {
    // ...existing code...
        const offCreated = on('message.created', messageCreated);

        return () => {
            // ...existing code...
            offCreated();
        };
    }, [selectedConversation]);

    // Set initial messages
    useEffect(() => {
        if (messages && messages.data) {
            // ...existing code...
            setLocalMessages([...messages.data].reverse());
        } else {
            setLocalMessages([]);
        }
    }, [messages]);

    useEffect(() => {
        if(messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop =
            messagesCtrRef.current.scrollHeight -
            messagesCtrRef.current.offsetHeight -
            scrollFromBottom;

        }
        if(noMoreMessages){
            return;
        }
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach(
                    (entry) => entry.isIntersecting && loadMoreMessages()
                ),
                {
                    rootMargin: '0px 0px 250px 0px',
                }
            );
        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100);
        }
        return () => {
            observer.disconnect();
        };

    }, [localMessages]);
    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 10);
        const offCreated = on('message.created', messageCreated);
        const offDeleted = on('message.deleted', messageDeleted);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            offCreated();
            offDeleted();
        };
    }, [selectedConversation]);

    // Listen to WebSocket for incoming messages from others
    useEffect(() => {
        if (!selectedConversation) {
            return;
        }

        let channel;

        if (selectedConversation.is_user) {
            const channelName = `message.user.${[currentUserId, selectedConversation.id].sort((a, b) => a - b).join('-')}`;
            // ...existing code...

            channel = window.Echo.private(channelName)
                .error((error) => {
                    // ...existing code...
                })
                .listen('SocketMessage', (e) => {
                    // ...existing code...
                    const message = e.message;

                    // Only add messages from others (not from current user)
                    if (message.sender_id !== currentUserId) {
                        // ...existing code...
                        setLocalMessages((prevMessages) => {
                            if (prevMessages.find(m => m.id === message.id)) {
                                return prevMessages;
                            }
                            return [...prevMessages, message];
                        });
                    } else {
                        // ...existing code...
                    }
                });
        } else if (selectedConversation.is_group) {
            const channelName = `message.group.${selectedConversation.id}`;
            // ...existing code...

            channel = window.Echo.private(channelName)
                .error((error) => {
                    // ...existing code...
                })
                .listen('SocketMessage', (e) => {
                    // ...existing code...
                    const message = e.message;

                    // Only add messages from others (not from current user)
                    if (message.sender_id !== currentUserId) {
                        // ...existing code...
                        setLocalMessages((prevMessages) => {
                            if (prevMessages.find(m => m.id === message.id)) {
                                return prevMessages;
                            }
                            return [...prevMessages, message];
                        });
                    } else {
                        console.log('Ignoring own message from WebSocket');
                    }
                });
        }

        return () => {
            if (channel) {
                console.log('Unsubscribing from channel');
                channel.stopListening('SocketMessage');
            }
        };
    }, [selectedConversation, currentUserId]);

    return (
        <>
            {!selectedConversation && (


                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-4xl p-16 text-slate-200">
                        Please select conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon className="w-32 h-32 text-slate-400" />
                </div>
            )}

            {selectedConversation && (
                <>
                    <ConversationHeader selectedConversation={selectedConversation} />

                    <div ref={messagesCtrRef} className="flex-1 overflow-y-auto p-5">
                        {localMessages.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200">
                                    No messages found
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className="flex-1 flex flex-col">
                                <div ref={loadMoreIntersect} />
                                {Array.from(
                                    new Map(localMessages.map(m => [m.id, m])).values()
                                ).map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                        attachmentClick={onAttachmentClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <MessageInput conversation={selectedConversation} />
                </>
            )}
            {previewAttachment.attachments && (
                <AttachmentPreviewModal
                attachments = {previewAttachment.attachments}
                index = {previewAttachment.index}
                isOpen = {showAttachmentPreview}
                onClose = {() => setShowAttachmentPreview(false)}

                />
            )}
        </>
    );
}

Home.layout = (page) => {
    console.log('Home.layout called with page props:', page.props);
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};
