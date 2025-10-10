import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';
import ConversationHeader from '@/Components/App/ConversationHeader';
import { usePage } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';

export default function Home({messages = null, selectedConversation = null}) {
    const [localMessages, setLocalMessages] = useState([]);
    const messagesCtrRef = useRef(null);
    const { on } = useEventBus();
    const page = usePage();
    const currentUserId = page.props.auth.user.id;

    const messageCreated = (message) => {
        console.log('messageCreated event received:', message);

        if (!selectedConversation) {
            return;
        }

        // For group messages
        if (selectedConversation.is_group &&
            selectedConversation.id == message.group_id) {
            setLocalMessages((prevMessages) => {
                // Check if message already exists
                if (prevMessages.find(m => m.id === message.id)) {
                    console.log('Message already exists, skipping');
                    return prevMessages;
                }
                console.log('Adding message to group conversation');
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
                        console.log('Message already exists, skipping');
                        return prevMessages;
                    }
                    console.log('Adding message to user conversation');
                    return [...prevMessages, message];
                });
            }
        }
    };

    // Listen to EventBus for message.created events
    useEffect(() => {
        console.log('Setting up message.created listener');
        const offCreated = on('message.created', messageCreated);

        return () => {
            console.log('Cleaning up message.created listener');
            offCreated();
        };
    }, [selectedConversation]);

    // Set initial messages
    useEffect(() => {
        if (messages && messages.data) {
            console.log('Loading initial messages:', messages.data.length);
            setLocalMessages([...messages.data].reverse());
        } else {
            setLocalMessages([]);
        }
    }, [messages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 10);
    }, [localMessages]);

    // Listen to WebSocket for incoming messages from others
    useEffect(() => {
        if (!selectedConversation) {
            return;
        }

        let channel;

        if (selectedConversation.is_user) {
            const channelName = `message.user.${[currentUserId, selectedConversation.id].sort((a, b) => a - b).join('-')}`;
            console.log('Subscribing to channel:', channelName);

            channel = window.Echo.private(channelName)
                .error((error) => {
                    console.error('Channel subscription error:', error);
                })
                .listen('SocketMessage', (e) => {
                    console.log('SocketMessage received from WebSocket:', e);
                    const message = e.message;

                    // Only add messages from others (not from current user)
                    if (message.sender_id !== currentUserId) {
                        console.log('Adding message from other user');
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
        } else if (selectedConversation.is_group) {
            const channelName = `message.group.${selectedConversation.id}`;
            console.log('Subscribing to channel:', channelName);

            channel = window.Echo.private(channelName)
                .error((error) => {
                    console.error('Channel subscription error:', error);
                })
                .listen('SocketMessage', (e) => {
                    console.log('SocketMessage received from WebSocket:', e);
                    const message = e.message;

                    // Only add messages from others (not from current user)
                    if (message.sender_id !== currentUserId) {
                        console.log('Adding message from other user');
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
                                {localMessages.map((message) => (
                                    <MessageItem key={message.id} message={message} />
                                ))}
                            </div>
                        )}
                    </div>

                    <MessageInput conversation={selectedConversation} />
                </>
            )}
        </>
    );
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
}

