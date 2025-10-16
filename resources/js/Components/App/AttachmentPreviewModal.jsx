import { Fragment,useEffect,useMemo,useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    XMarkIcon,
    PaperClipIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { isImage, isVideo, isAudio, isPDF, isPreviewable } from "@/helpers";
export default function AttachmentPreviewModal({
    attachments,
    index,
    isOpen = false,
    show = false,
    onClose = () => {},
}) {

    const [currentIndex, setCurrentIndex] = useState(0);

    // Normalize attachments input to an array
    const normalizedAttachments = Array.isArray(attachments) ? attachments : [];

    const attachment = useMemo(() => {
        return normalizedAttachments[currentIndex];
    }, [normalizedAttachments, currentIndex]);

    // Build a list of indices in the original attachments array that are previewable
    const previewableIndices = useMemo(() => {
        return normalizedAttachments
            .map((att, idx) => (isPreviewable(att) ? idx : -1))
            .filter((idx) => idx !== -1);
    }, [normalizedAttachments]);
    const close=()=>
    {
        onClose();

    };
const prev = () => {
    const pos = previewableIndices.indexOf(currentIndex);
    if (pos <= 0) return;
    setCurrentIndex(previewableIndices[pos - 1]);
};

const next = () => {
    const pos = previewableIndices.indexOf(currentIndex);
    if (pos === -1 || pos >= previewableIndices.length - 1) return;
    setCurrentIndex(previewableIndices[pos + 1]);
};
useEffect(() => {
    // Ensure index is a valid number and within bounds
    const idx = Number.isFinite(index) ? index : 0;
    if (idx < 0 || idx >= normalizedAttachments.length) {
        setCurrentIndex(0);
    } else {
        setCurrentIndex(idx);
    }
}, [index, normalizedAttachments.length]);

return (
    <Transition show={isOpen || show} as={Fragment} leave="duration-200">
    <Dialog
    as="div"
    className="relative z-50"
    onClose={close}
    id ="modal"
>
<Transition.Child
    as={Fragment}
    enter="ease-out duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="ease-in duration-200"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
>
<div className="fixed inset-0 bg-black/25"/>
</Transition.Child>

<div className="fixed inset-0 overflow-y-auto">
    <div className="h-screen w-screen">
        <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <Dialog.Panel
                className="w-full h-full flex flex-col transform overflow-hidden bg-slate-800
           text-left align-middle shadow-xl transition-all">

            <button
            onClick={close}
            className="absolute top-4 right-4 z-40 w-8 h-8 rounded-full bg-gray-800 text-gray-400 hover:text-gray-200
            flex items-center justify-center"
            >
                <XMarkIcon className="w-6 h-6"/>
            </button>
            <div className = "relative group h-full">
                {currentIndex > 0 && previewableIndices.length > 0 && (
                <div
                onClick={prev}
                className="absolute left-4 top-0 bottom-0 z-20 w-16 flex items-center justify-center
                bg-gradient-to-r from-slate-800/70 to-transparent text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                    <ChevronLeftIcon className="w-8 h-8"/>
                    </div>
             )}
                {previewableIndices.length > 0 && previewableIndices.indexOf(currentIndex) < previewableIndices.length - 1 && (
                    <div
                        onClick={next}
                        className="absolute right-4 top-0 bottom-0 z-20 w-16 flex items-center justify-center
                        bg-gradient-to-l from-slate-800/70 to-transparent text-gray-400 hover:text-gray-200 cursor-pointer"
                    >
                        <ChevronRightIcon className="w-8 h-8"/>
                    </div>
                )}

                {attachment && (
                    <div className="flex items-center justify-center w-full h-full p-3">
                {isImage(attachment) && (
                    <img
                    src={attachment.url}
                    className="max-h-[70vh] max-w-[80%] object-contain rounded-md shadow-lg"
                    />
                )}
                {isVideo(attachment) && (
                    <div className="flex items-center justify-center w-full">
                    <video
                    src={attachment.url}
                    controls
                    autoPlay
                    className="max-h-[70vh] max-w-[80%] rounded-md shadow-lg"
                    />
                </div>
                )}
                   {isAudio(attachment) && (
                    <div className="relative flex justify-center items-center w-full">
                    <audio
                    src={attachment.url}
                    controls
                    autoPlay
                    className="w-full max-w-md"
                    ></audio>
                    </div>
                )}
                {isPDF(attachment) && (
                    <iframe
                    src={attachment.url}
                    className="w-[95vw] h-[95vh] rounded-md shadow-lg"
                    title={attachment.name || 'pdf-preview'}
                    ></iframe>
                )}
                {!isPreviewable(attachment) && (
                    <div className="p-8 flex flex-col items-center justify-center text-gray-100">
                        <PaperClipIcon className="w-10 h-10 mb-3"/>
                        <small>{attachment.name}</small>

                    </div>
                )}
            </div>
                )}
            </div>
            </Dialog.Panel>
            </Transition.Child>

    </div>
    </div>
</Dialog>
</Transition>
);


};
