import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loader = ({ size = 'medium' }) => {
  const sizeMap = {
    small: '100px',
    medium: '200px',
    large: '300px'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      minHeight: '200px'
    }}>
      <DotLottieReact
        src="/animations/loading.lottie"
        loop
        autoplay
        style={{
          width: sizeMap[size],
          height: sizeMap[size]
        }}
      />
    </div>
  );
};

export default Loader; 