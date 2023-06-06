import React, { useEffect } from 'react';
import { useStore } from './store';
import UpdateComponent from './UpdateComponent';
import ReadComponent from './ReadComponent';

function Base () {
  const initialize = useStore( ( state ) => state.initialize );

  useEffect( () => {
    initialize();
  }, [ initialize ] );

  return (
    <div className="Base">
      BASE
      <UpdateComponent />
      <ReadComponent />
    </div>
  );
}

export default Base;