# rhoto-router
it's a react router


Example usage:

```jsx
//index.js
import React from "react";
import ReactDOM from "react-dom"
import { Router, Route, Link, useRouter } from "rhoto-router"

const Greeting = () => {
  const {params, navigate} = useRouter()
  if (!params.world) navigate("/")
  return (<span id="world-name">{params.world}</span>)
}

ReactDOM.render(
  <Router>
    <Route path="/hello/:world"><Greeting/></Route>
    <Route exact path="/">
      <ol>
        <li><Link href="/hello/earth">Greet earth</Link></li>
        <li><Link href="/hello/mars">Greet mars</Link></li>
      </ol>
    </Route>
  </Router>,
  document.getElementById("root")
)

  
