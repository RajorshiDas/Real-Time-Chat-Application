import {Link , usePage} from '@inertiajs/react';
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import UserAvatar from '@/Components/App/UserAvatar';
import GroupAvatar from '@/Components/App/GroupAvatar';
import GroupDescriptionPopover from '@/Components/App/GroupDescriptionPopover';
import GroupUserPopover from '@/Components/App/GroupUserPopover';
import { TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
const ConversationHeader = ({selectedConversation}) => {
    const { props: { authUser } = {} } = usePage() || {};
    const onDeleteGroup = () => {
        if(!window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
            return;
        }
        axios   .delete(route("groups.destroy", selectedConversation.id))
                .then(() => {
                    emit("Conversation.deleted", selectedConversation.id);
                })
                .catch((error) => {
                    // ...existing code...
                    alert("An error occurred while deleting the group. Please try again.");
                });
    };

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
                        <h2 className="text-white">{selectedConversation.name}</h2>
                        {selectedConversation.is_group && (
                            <div className="text-xs text-gray-500">
                                <div className="flex gap-3">
                                    <GroupDescriptionPopover
                                       description={selectedConversation.description}
                                    />
                                    <GroupUserPopover
                                        users={selectedConversation.users}
                                    />
                                    {selectedConversation.owner_id === authUser?.id &&
                                    (
                                        <div className="tooltip tooltip-left"
                                            data-tip="Edit Group">
                                           <button
                                                className=" text-gray-400 hover:text-white"
                                                  onClick={() => {
                                                    emit("GroupEditModal.show", selectedConversation);
                                                  }}>
                                                    <PencilSquareIcon className="w-5 h-5"/>
                                                  </button>
                                        </div>
                                    )}
                                    <div className="tooltip tooltip-left"
                                         data-tip="Delete Group">
                                        <button
                                            className=" text-gray-400 hover:text-white"
                                            onClick={onDeleteGroup}>
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-1">{selectedConversation.users.length} members</div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        )}
        </>
     );
    };

export default ConversationHeader;
