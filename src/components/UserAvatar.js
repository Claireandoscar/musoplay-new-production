import React, { useState } from 'react';
import { Camera, Edit2 } from 'lucide-react';

const UserAvatar = ({ 
  imageUrl, 
  username = 'Player',
  onImageChange,
  onUsernameChange
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

  const handleUsernameSubmit = () => {
    onUsernameChange?.(newUsername);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div
        className="relative w-24 h-24 rounded-full bg-[#1174B9] text-white font-patrick"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center text-3xl">
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file && onImageChange) {
                  onImageChange(file);
                }
              };
              input.click();
            }}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Username */}
      <div className="relative flex items-center gap-2">
        {isEditing ? (
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onBlur={handleUsernameSubmit}
            onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            className="px-2 py-1 border border-[#1174B9]/30 rounded font-patrick text-[#1174B9] bg-transparent"
            autoFocus
          />
        ) : (
          <>
            <span className="font-patrick text-xl text-[#1174B9]">{username}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#1174B9]/50 hover:text-[#1174B9] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserAvatar;