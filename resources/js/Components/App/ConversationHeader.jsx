import {Link , usePage} from '@inertiajs/react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import UserAvatar from '@/Components/App/UserAvatar';
import GroupAvatar from '@/Components/App/GroupAvatar';
const ConversationHeader = ({selectedConversation}) => {
     return (
        <>
        {selectedConversation && (
            <div className="p-3 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <Link
                        href={route("dashboard")}
                        className="inline-block sm:hidden">
                        <ArrowLeftIcon className="w-6"/>
                    </Link>
                    {selectedConversation.is_user && (
                        <UserAvatar user={selectedConversation} />
                    )}
                    {selectedConversation.is_group && (
                        <GroupAvatar/>
                    )}
                    <div>
                        <h2>{selectedConversation.name}</h2>
                        {selectedConversation.is_group && (
                            <p className="text-xs text-gray-500">
                                {selectedConversation.users.length} members
                            </p>
                        )}
                    </div>
                </div>

            </div>
        )}
        </>
     );
    };

export default ConversationHeader;
