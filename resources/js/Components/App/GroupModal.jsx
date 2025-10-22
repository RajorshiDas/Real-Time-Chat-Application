import TestAreaInput from '@/Components/TestAreaInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import UserPicker from "@/Components/App/UserPicker";
import { useForm, usePage } from '@inertiajs/react';
import { useEventBus } from '@/EventBus';
import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Add this import
import axios from 'axios';

export default function GroupModal({show = false, onclose = () => {}}) {
    const page = usePage();
    const conversations = page.props.conversations || [];
    const {on, emit} = useEventBus();
    const [group, setGroup] = useState({});
    const [step, setStep] = useState(1); // Add step state
    const {data, setData, post, processing, reset, errors, put} = useForm({
        id: "",
        name: "",
        description: "",
        user_ids: [],
    });

    const users = conversations.filter((c) => !c.is_group) || [];

    const createOrUpdateGroup = (e) => {
        e.preventDefault();
        if(group.id) {
            put(route('group.update', group.id), {
                onSuccess: () => {
                    closeModal();
                    emit("toast.show", `Group "${data.name}" updated successfully.`);
                },
            });
            return;
        }
        post(route('group.store'), {
            onSuccess: () => {
                closeModal();
                emit("toast.show", `Group "${data.name}" created successfully.`);
            },
        });
    };

    const closeModal = () => {
        reset();
        setGroup({});
        setData({
            id: "",
            name: "",
            description: "",
            user_ids: [],
        });
        onclose(); // This calls the parent's onClose handler from ChatLayout
    };

    const nextStep = () => {
        if (step === 1 && !data.name) {
            return; // Don't proceed if name is empty
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const deleteGroup = () => {
        if (!confirm('Are you sure you want to delete this group?')) return;

        axios.delete(route('group.destroy', group.id))  // Changed from groups.destroy to group.destroy
            .then(() => {
                closeModal();
                emit('toast.show', `Group "${group.name}" deleted successfully.`);
            })
            .catch(error => {
                console.error('Error deleting group:', error);
                emit('toast.show', 'Error deleting group.');
            });
    };

    useEffect(() => {
        return on("GroupModal.show", (group = {}) => {
            setGroup(group);
            setData({
                id: group.id || "",
                name: group.name || "",
                description: group.description || "",
                user_ids: group.users ? group.users
                    .filter((u) => group.owner_id !== u.id)
                    .map((u) => u.id)
                    : [],
            });
        });
    }, [on]);

    return (
        <Modal show={show} onClose={closeModal}>
            <form onSubmit={createOrUpdateGroup} className="dark:bg-gray-800">
                <div className="p-6">
                    {/* Header with close button */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">
                            {group.id ? `Edit Group "${group.name}"` : 'Create new Group'}
                        </h2>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Name Field */}
                    <div className="mb-6">
                        <InputLabel value="Name" className="text-gray-200" />
                        <TextInput
                            type="text"
                            className="mt-1 block w-full bg-gray-700 text-white border-gray-600"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* Description Field */}
                    <div className="mb-6">
                        <InputLabel value="Description" className="text-gray-200" />
                        <TestAreaInput
                            rows="3"
                            className="mt-1 block w-full bg-gray-700 text-white border-gray-600"
                            value={data.description || ""}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Add group description (optional)"
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    {/* Select Users Field */}
                    <div className="mb-6 relative z-10"> {/* Added z-index */}
                        <InputLabel value="Select Users" className="text-gray-200" />
                        <div className="mt-1"> {/* Added wrapper div */}
                            <UserPicker
                                value={users.filter(
                                    (u) => group?.owner_id != u.id &&
                                    data.user_ids.includes(u.id)
                                ) || []}
                                options={users}
                                onSelect={(users) =>
                                    setData("user_ids", users.map((u) => u.id))
                                }
                            />
                        </div>
                        <InputError message={errors.user_ids} className="mt-2" />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <SecondaryButton
                            type="button"
                            onClick={closeModal}
                            className="bg-gray-600 text-white hover:bg-gray-500"
                        >
                            CANCEL
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={processing || !data.name || data.user_ids.length === 0}
                            className="bg-blue-600 hover:bg-blue-500"
                        >
                            {group.id ? 'UPDATE' : 'CREATE'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

