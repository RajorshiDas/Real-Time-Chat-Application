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
                    className={`group inline-flex flex-col items-center justify-center
            text-gray-500 relative cursor-pointer
            hover:text-gray-300 p-1`}
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
            className="object-contain rounded-md shadow-sm max-w-[220px] max-h-[220px]"
            />
            )}
            {isVideo(attachment) && (
                <div className="relative flex justify-center items-center">
                    <PlayCircleIcon className="z-20 absolute w-12 h-12 text-white opacity-70" />
                    <video src={attachment.url} className="max-w-[260px] max-h-[180px] rounded-md" />
                </div>
            )}
            {isAudio(attachment) && (
                <div className="relative flex justify-center items-center">
                     <audio src={attachment.url} controls></audio>
                    </div>
            )}
            {isPDF(attachment) && (
                <div className="relative flex flex-col items-center justify-center">
                    <div className="w-16 h-20 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden shadow-sm">
                        <img src="/img/pdf.png" alt="pdf" className="object-contain w-full h-full" />
                    </div>
                    <small className="max-w-[80px] text-center truncate text-xs mt-1">{attachment.name}</small>
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
