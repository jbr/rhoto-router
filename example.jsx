import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Link, useRouter } from "rhoto-router";

const Greeting = () => {
  const { params, navigate } = useRouter();
  if (!params.world) navigate("/");
  return <span id="world-name">{params.world}</span>;
};

ReactDOM.render(
  <Router>
    <Route path="/hello/:world">
      <Greeting />
    </Route>
    <Route exact path="/">
      <ol>
        <li>
          <Link href="/hello/earth">Greet earth</Link>
        </li>
        <li>
          <Link href="/hello/mars">Greet mars</Link>
        </li>
      </ol>
    </Route>
    <Route path="/contrived-example/:contrivedId">
      <Route path="/nested/:something">
        {({ contrivedId, something }) => (
          <span>
            this matches /contrived-example/{contrivedId}/nested/{something},
            but more often than using a render prop, a child component would
            `useRouter()`
          </span>
        )}
      </Route>
    </Route>
  </Router>,
  document.getElementById("root")
);
