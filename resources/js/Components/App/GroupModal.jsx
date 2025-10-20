import TestAreaInput from '@/Components/TestAreaInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@Components/SecondaryButton';
import PrimaryButton from '@Components/PrimaryButton';
import UserPicker from '@/Components/App/UserPicker';
import {useForm ,usePage} from '@inertiajs/react';
import { useEventBus } from '@/EventBus';
import { useEffect,useState } from 'react';

  export default function GroupModal({show = false , onclose = () => {}}) {

    const page = usePage();
    const conversation = page.props.conversation;
    const {on ,emit} = useEventBus();
    const [group ,setGroup] = useState({});
    const {data,setData,post,processing,reset,errors,put} = useForm({
        id :"",
        name : "",
        description : "",
        user_ids : [],
    });


    const users = conversation.filter ((c) => !c.is_group);
    const createOrUpdateGroup = (e) =>{
        e.preventDefault();
        if(group.id){
            put(route('groups.update',group.id),{
                onSuccess : () => {
                  closeModal();
                  emit("toast.show",`Group "${data.name}" updated successfully.`);
                },
              });
              return;
        }
        post(route('groups.store'),{
            onSuccess : () => {
              closeModal();
              emit("toast.show",`Group "${data.name}" created successfully.`);
            },
          });
        }

    const closeModal = () =>{

        reset();
        onclose();
    };

    useEffect(() => {
        return on("GroupModal.show",(group = {}) => {
            setGroup(group);
            setData({
                id : group.id || "",
                name : group.name || "",
                description : group.description || "",
                user_ids : group.users ? group.users.map((u) => u.id) : [],
            });
        }   );
    },[]);

    return (
        <Modal show={show} onClose={closeModal}>
            <form onSubmit={createOrUpdateGroup} >
                <div className="p-6">
                    <InputLabel htmlFor="name" value="Group Name" />
                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                    />
                    <InputError message={errors.name} className="mt-2" />


                </div>
                <div className="p-6">
                    <InputLabel htmlFor="description" value="Description" />
                    <TextInput
                        id="description"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        required
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>
                <div className="p-6">
                    <InputLabel htmlFor="users" value="Users" />
                    <UserPicker
                        id="users"
                        value={data.user_ids}
                        onChange={(value) => setData('user_ids', value)}
                        required
                    />
                    <InputError message={errors.user_ids} className="mt-2" />
                </div>
                <div className="p-6">
                    <PrimaryButton type="submit" disabled={processing}>
                        {group.id ? 'Update Group' : 'Create Group'}
                    </PrimaryButton>
                    <SecondaryButton onClick={closeModal} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                </div>
            </form>
        </Modal>
    );
}

