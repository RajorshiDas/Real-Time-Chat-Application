import {
    PaperClipIcon,
    ArrowDownTrayIcon,
    PlayCircleIcon,
} from "@heroicons/react/24/solid";
import { isAudio, isImage,isPDF,isPreviewable,isVideo } from "@/helpers";
import React from "react";


const MessageAttachments = ({ attachments, attachmentClick}) => {

return (
    <>
    {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-end gap-1">
            {attachments.map((attachment, index) => (
                <div
                    onClick={() => attachmentClick(attachments, index)}
                    key={attachment.id}
                    className={`group flex flex-col items-center justify-center
            text-gray-500 relative cursor-pointer
            hover:text-gray-300` +
                        (isImage(attachment)
                            ? " w-84"
                            : "w-32 aspect-square bg-blue-100")}
                >
       {!isAudio(attachment)  && (
        <a
               onClick={(ev)=> ev.stopPropagation()}
               download
               href = {attachment.url}
               className="z-10 opacity-0 group-hover:opacity-100 transition-all w-8 h-8 flex items-center justify-center
               absolute top-1 right-1 p-1 bg-gray-800 rounded-full text-gray-400 hover:text-gray-200"


>
    <ArrowDownTrayIcon className="w-5 h-5" />

</a>
       )}
         {isImage(attachment) && (
            <img
            src={attachment.url}
            className="object-contain aspect-square"/>
            )}
            {isVideo(attachment) && (
                <div className="relative flex justify-center items-center">
                    <PlayCircleIcon className="z-20 absolute w-16 h-16 text-white opacity-70" />
                    <div className="w-full h-full bg-black left-0 top-0 opacity-20 absolute z-10" ></div>
                    <video src={attachment.url}></video>
                    </div>
            )}
            {isAudio(attachment) && (
                <div className="relative flex justify-center items-center">
                     <audio src={attachment.url} controls></audio>
                    </div>
            )}
            {isPDF(attachment) && (
                <div className="relative flex justify-center items-center ">
                    <div className="absolute left-0 top-0 right-0 bottom-0"></div>
                    <iframe
                    src={attachment.url}
                    className="w-full h-48"
                    ></iframe>
                    </div>

            )}
            {!isPreviewable(attachment) && (
               <a
               onClick={(ev)=> ev.stopPropagation()}
                download
                href = {attachment.url}
                className="flex flex-col items-center justify-center gap-2">

                    <PaperClipIcon className="w-10 h-10 mb-3" />
                    <small className="text-center">{attachment.name}</small>
                </a>

            )}

        </div>
    ))}
</div>
    )}

    </>
);
};
export default MessageAttachments;
