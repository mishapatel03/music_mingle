import React from 'react';
import { Audio } from 'react-loader-spinner';

const Loader = ({ loading }) => {
  return (
    <>
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '9999',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Audio
            height={80}
            width={80}
            radius={9}
            color="orange"
            ariaLabel="three-dots-loading"
          />
        </div>
      )}
    </>
  );
};

export default Loader;
