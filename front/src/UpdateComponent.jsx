// UpdateComponent.js
import React from 'react';
import { useStore } from './store';

const UpdateComponent = () => {
  const increment = useStore( state => state.increment );

  return (
    <button onClick={ increment }>
      Increment
    </button>
  );
}

export default UpdateComponent;
