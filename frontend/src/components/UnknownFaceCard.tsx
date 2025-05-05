import React from 'react';

interface UnknownFaceCardProps {
  croppedImage: string;
  descriptor: Float32Array;
  onClick: (descriptor: Float32Array, croppedImage: string) => void;
}

const UnknownFaceCard: React.FC<UnknownFaceCardProps> = ({ croppedImage, descriptor, onClick }) => {
  return (
    <div>
      <img
        src={croppedImage}
        alt="Unknown face"
        width={100}
        onClick={() => onClick(descriptor, croppedImage)}
        style={{ borderRadius: '8px', boxShadow: '0 0 5px #ccc' }}
      />
    </div>
  );
};

export default UnknownFaceCard;
