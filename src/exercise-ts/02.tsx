// Compound Components
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {Switch} from '../switch'

type ToggleProps = {
  children: React.ReactNode[]
}
function Toggle({children}: ToggleProps) {
  const [on, setOn] = React.useState<boolean>(false)
  const toggle = () => setOn(!on)

  // 🐨 replace this with a call to React.Children.map and map each child in
  // props.children to a clone of that child with the props they need using
  // React.cloneElement.
  // 💰 React.Children.map(props.children, child => {/* return child clone here */})
  // 📜 https://reactjs.org/docs/react-api.html#reactchildren
  // 📜 https://reactjs.org/docs/react-api.html#cloneelement
  return (
    <>
      {React.Children.map(children, child =>
        React.isValidElement(child) && typeof child.type !== 'string'
          ? React.cloneElement(child, {on, toggle})
          : child,
      )}
    </>
  )
}

// 🐨 Flesh out each of these components

// Accepts `on` and `children` props and returns `children` if `on` is true
const ToggleOn: React.FC<{on?: boolean}> = ({on, children = ''}) =>
  on ? <>{children}</> : null

// Accepts `on` and `children` props and returns `children` if `on` is false
const ToggleOff: React.FC<{on?: boolean}> = ({on, children = ''}) =>
  on ? null : <>{children}</>

// Accepts `on` and `toggle` props and returns the <Switch /> with those props.
type ToggleButtonProps = {
  on?: boolean
  toggle?: (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void
}
const ToggleButton: React.VFC<ToggleButtonProps> = ({
  on = false,
  toggle = () => void 0,
}) => <Switch on={on} onClick={toggle} />

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <span>Hello</span>
        <ToggleButton />
      </Toggle>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
