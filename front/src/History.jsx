import React, { useEffect, useState } from 'react';
import * as API from './api';
import socket from './socket';
import style from "./history.module.scss";

const History = () => {
  const [ history, setHistory ] = useState( [] );

  const fetchHistory = async () => {
    const history = await API.getHistory();
    setHistory( history );
    console.log( 'REACT/ fetching game' );
    console.log( history );
  };

  useEffect( () => {

    socket.connect();

    fetchHistory();
    socket.on( 'history', fetchHistory );
    return () => {
      socket.off( 'history', fetchHistory );
    };
  }, [] );

  return (
    <div>
      { history.map( ( item, index ) => (
        <div key={ index }>
          <div className={ style.date }>
            { new Date( item.createdAt ).toLocaleDateString( 'fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
            } ) }  </div>
          <div className={ style.message } >

            { item.log }

          </div>

        </div>
      ) )
}
    </div >
  );

};

export default History;
