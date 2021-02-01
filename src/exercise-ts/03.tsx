// Flexible Compound Components
// http://localhost:3000/isolated/exercise/03.tsx

import * as React from 'react'
import {Switch} from '../switch'

// 🐨 create your ToggleContext context here
interface ToggleContextType {
  readonly on: boolean
  readonly toggle: () => void
}
// 📜 https://reactjs.org/docs/context.html#reactcreatecontext
const ToggleContext = React.createContext<ToggleContextType>(undefined!)
ToggleContext.displayName = 'ToggleContext'

const Toggle: React.FC = props => {
  const [on, setOn] = React.useState(false)
  const toggle = (): void => setOn(!on)
  const value: ToggleContextType = {on, toggle} as const
  return <ToggleContext.Provider value={value} {...props} />
}

// 🐨 we'll still get the children from props (as it's passed to us by the
// developers using our component), but we'll get `on` implicitly from
// ToggleContext now
// 🦉 You can create a helper method to retrieve the context here. Thanks to that,
// your context won't be exposed to the user
// 💰 `const context = React.useContext(ToggleContext)`
// 📜 https://reactjs.org/docs/hooks-reference.html#usecontext

const useToggle = (): ToggleContextType => {
  const ctx = React.useContext(ToggleContext)
  if (!ctx) {
    throw new Error('``useToggle` must be used as a child of a `<Toggle />`')
  }
  return ctx
}

const ToggleOn: React.FC = ({children}) => {
  const {on} = useToggle()
  return on ? <>{children}</> : null
}

// 🐨 do the same thing to this that you did to the ToggleOn component
const ToggleOff: React.FC = ({children}) => {
  const {on} = useToggle()
  return on ? null : <>{children}</>
}

// 🐨 get `on` and `toggle` from the ToggleContext with `useContext`
const ToggleButton: React.VFC = () => {
  const {on, toggle} = useToggle()
  return <Switch on={on} onClick={toggle} />
}

function App(): JSX.Element {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <div>
          <ToggleButton />
        </div>
      </Toggle>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
