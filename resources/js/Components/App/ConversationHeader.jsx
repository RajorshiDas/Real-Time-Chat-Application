import {Link , usePage} from '@inertiajs/react';
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import UserAvatar from '@/Components/App/UserAvatar';
import GroupAvatar from '@/Components/App/GroupAvatar';
import GroupDescriptionPopover from '@/Components/App/GroupDescriptionPopover';
import GroupUserPopover from '@/Components/App/GroupUserPopover';
import { TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEventBus } from '@/EventBus';

const ConversationHeader = ({selectedConversation}) => {
    const authUser = usePage().props.auth.user;
    const { emit } = useEventBus();


    const onDeleteGroup = () => {
        if(!window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
            return;
        }
        axios.delete(route("group.destroy", selectedConversation.id))
            .then((res) => {
                console.log(res);
                emit("toast.show",res.data.message);


            })
            .catch((error) => {
                alert("An error occurred while deleting the group. Please try again.");
            });
    };

    return (
        <>
        {selectedConversation && (
            <div className="p-3 flex justify-between items-center border-b border-slate-700">
                {/* Left side - Avatar and Name */}
                <div className="flex items-center gap-3">
                    <Link
                        href={route("dashboard")}
                        className="inline-block sm:hidden text-white">
                        <ArrowLeftIcon className="w-6"/>
                    </Link>
                    {selectedConversation.is_user && (
                        <UserAvatar user={selectedConversation} />
                    )}
                    {selectedConversation.is_group && (
                        <GroupAvatar/>
                    )}
                    <div>
                        <h2 className="text-white font-medium">{selectedConversation.name}</h2>
                        {selectedConversation.is_group && (
                            <div className="text-xs text-gray-200">
                                <div className="mt-1">{selectedConversation.users.length} members</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side - Action Icons */}
                {selectedConversation.is_group && (
                    <div className="flex items-center gap-4 text-white">
                        <div className="tooltip tooltip-left" data-tip="Group Description">
                            <GroupDescriptionPopover description={selectedConversation.description} />
                        </div>

                        <div className="tooltip tooltip-left" data-tip="Group Members">
                            <GroupUserPopover users={selectedConversation.users} />
                        </div>

                        {selectedConversation.owner_id === authUser?.id && (
                            <div className="tooltip tooltip-left" data-tip="Edit Group">
                                <button
                                    className="text-white hover:text-gray-200"
                                    onClick={() => {
                                        emit("GroupModal.show", selectedConversation);
                                    }}>
                                    <PencilSquareIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        )}

                        {selectedConversation.owner_id === authUser?.id && (
                            <div className="tooltip tooltip-left" data-tip="Delete Group">
                                <button
                                    className="text-white hover:text-gray-200"
                                    onClick={onDeleteGroup}>
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
        </>
    );
};

export default ConversationHeader;
