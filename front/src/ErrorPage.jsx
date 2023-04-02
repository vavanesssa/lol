import { useRouteError } from "react-router-dom";
import style from "./ErrorPage.module.scss";
export default function ErrorPage () {
  const error = useRouteError();
  console.error( error );

  return (
    <div id="error-page">

      <div className={ style.errorContainer }>
        <img src="logo.png" className={ style.logo } />
        <h1>Oups!  😂</h1>
        <p>Cette page n'existe pas.</p>
        <p>
          <i>{ error.statusText || error.message }</i>
        </p>
      </div>
    </div>
  );
}