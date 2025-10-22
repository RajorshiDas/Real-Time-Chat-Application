import React from 'react';
const UserAvatar = ({ user, online = null , profile = false }) => {
    if (!user) return null;

    let onlineClass = online === true ? "online" : online === false ? "offline" : "";
    const sizeClass = profile ? "w-40" : "w-8";
    return (
        <>
           {user.avatar_url && (
            <div className= {`chat-image avatar ${onlineClass} relative`}>
              <div className= {`rounded-full ${sizeClass}`}>
                <img src={user.avatar_url} alt={user.name} />
              </div>
            </div>
           )}
              {!user.avatar_url && (
                <div className={`chat-image avatar ${onlineClass} relative`}>
                  <div className={`rounded-full ${sizeClass} bg-gray-600 flex items-center justify-center text-center`}>
                    <span className="placeholder-avatar text-white font-semibold leading-none">
                        {user.name ? user.name.substring(0, 1) : ''}
                    </span>
                  </div>
                </div>
              )}
        </>
    );
}

export default UserAvatar;
