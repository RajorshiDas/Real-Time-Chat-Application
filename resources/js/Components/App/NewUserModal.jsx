import TestAreaInput from '@/Components/TestAreaInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm, usePage } from '@inertiajs/react';
import { useEventBus } from '@/EventBus';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Checkbox from '../Checkbox';

export default function NewUserModal({show = false, onClose = () => {}}) {
    const { emit } = useEventBus();
    const {data, setData, post, processing, reset, errors} = useForm({
        name: "",
         email : "",
         is_admin: false,
    });



    const submit = (e) => {
        e.preventDefault();

        post(route('user.store'), {
            onSuccess: () => {
                closeModal();
                emit("toast.show", `User "${data.name}" created successfully.`);
                closeModal();
            },
        });
    };

    const closeModal = () => {
        reset();
        onClose();
    };








    return (
        <Modal show={show} onClose={closeModal}>
            <form
            onSubmit={submit}
            className="dark:bg-gray-800 p-6 overflow-y-auto">
                <div className="p-6">

                    <div className="flex justify-between items-center mb-6">

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
                        <InputLabel htmlFor="name" value="Name" className="text-gray-200" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full bg-gray-700 text-white border-gray-600"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* Email Field */}
                    <div className="mb-6">
                        <InputLabel htmlFor="email" value="Email" className="text-gray-200" />
                      <TextInput
                            id="email"
                            type="text"
                            className="mt-1 block w-full bg-gray-700 text-white border-gray-600"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required

                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>


                    <div className="mb-6 relative z-10">
                        <InputLabel value="Select Users"
                         className="text-gray-200" />
                         <label className="flex items-center">
                                                <Checkbox
                                                    name="is_admin"
                                                    checked={data.is_admin}
                                                    onChange={(e) =>
                                                        setData('is_admin', e.target.checked)
                                                    }
                                                />
                                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                                     Admin User
                                                </span>
                                            </label>
                        <InputError message={errors.is_admin} className="mt-2" />
                    </div>


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
                            disabled={processing || !data.name || !data.email}
                            className="bg-blue-600 hover:bg-blue-500"
                        >
                            CREATE USER
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

