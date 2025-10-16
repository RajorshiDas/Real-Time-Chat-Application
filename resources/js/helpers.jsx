

export const formatMessageDateLong = (date) => {

  const now = new Date();
  const inputDate = new Date(date);
  if(isToday(inputDate)) {
      return inputDate.toLocaleTimeString('en-US', {
         hour: 'numeric',
         minute: '2-digit',
         hour12: true
        });
  } else if (isYesterday(inputDate)) {
      return (
        "Yesterday " +
        inputDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      );
  } else if (inputDate.getFullYear() === now.getFullYear()) {
      return inputDate.toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
      });
  } else {
      return inputDate.toLocaleDateString();
  }
   };
export const formatMessageDateShort = (date) => {

    const now = new Date();
    const inputDate = new Date(date);

    if(isToday(inputDate)) {
        return inputDate.toLocaleTimeString('en-US', {
           hour: "numeric",
           minute: "2-digit",
           hour12: true
          });
    } else if (isYesterday(inputDate)) {
        return "Yesterday";
    } else if (inputDate.getFullYear() === now.getFullYear()) {
        return inputDate.toLocaleDateString([], {
          day: "2-digit",
          month: "short",
        });
    } else {
        return inputDate.toLocaleDateString();
    }
};
export const isToday = (date) => {
    const today = new Date();

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};
export const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    );
};
export const isImage = (attachment) => {
    const mimeRaw = (attachment && (attachment.mime || attachment.type) || "").toString().toLowerCase();
    if (mimeRaw.includes("/")) {
        return mimeRaw.split("/")[0] === "image";
    }
    const name = (attachment && attachment.name || "").toString().toLowerCase();
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name);

};
export const isVideo = (attachment) => {
    const mimeRaw = (attachment && (attachment.mime || attachment.type) || "").toString().toLowerCase();
    if (mimeRaw.includes("/")) {
        return mimeRaw.split("/")[0] === "video";
    }
    const name = (attachment && attachment.name || "").toString().toLowerCase();
    return /\.(mp4|webm|ogg|mov|mkv)$/.test(name);

};


export const isAudio = (attachment) => {
    const mimeRaw = (attachment && (attachment.mime || attachment.type) || "").toString().toLowerCase();
    if (mimeRaw.includes("/")) {
        return mimeRaw.split("/")[0] === "audio";
    }
    const name = (attachment && attachment.name || "").toString().toLowerCase();
    return /\.(mp3|wav|m4a|ogg|flac)$/.test(name);

};
export const isPDF = (attachment) => {
    const mimeRaw = (attachment && (attachment.mime || attachment.type) || "").toString().toLowerCase();
    if (mimeRaw === "application/pdf") return true;
    if (mimeRaw.includes("/")) {
        const parts = mimeRaw.split("/");
        if (parts[1] && parts[1].toLowerCase().includes("pdf")) return true;
    }
    const name = (attachment && attachment.name || "").toString().toLowerCase();
    return name.endsWith(".pdf");
};

export const isPreviewable = (attachment) => {
    return (
        isImage(attachment) ||
        isVideo(attachment) ||
        isAudio(attachment) ||
        isPDF(attachment)
    );
};
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes","KB", "MB","GB"];
    let i = 0;
    let size = bytes;
    while(size >= k)
    {
        size /= k;
        i++;
    }
    return parseFloat(size.toFixed(dm))+ " "+sizes[i];


};

