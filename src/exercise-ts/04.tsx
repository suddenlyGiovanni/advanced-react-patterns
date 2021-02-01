// Prop Collections and Getters
// http://localhost:3000/isolated/exercise-ts/04.tsx

import * as React from 'react'
import {Switch} from '../switch'

type CallAll = <
  Fns extends Array<((...args: unknown[]) => unknown) | undefined>,
  Args extends unknown[]
>(
  ...fns: [...Fns]
) => (...args: [...Args]) => void

const callAll: CallAll = (...fns) => (...args) =>
  fns.forEach(fn => fn && fn(...args))

interface GetTogglerProps {
  <
    T extends Partial<TogglerProps> &
      Partial<ToggleImperativeAPI> & {[AttributeName: string]: unknown}
  >(
    attributes?: T,
  ): TogglerProps & Omit<T, 'onClick'>
}

interface TogglerProps {
  'aria-pressed': boolean
  onClick: (...args: unknown[]) => void
}

interface ToggleImperativeAPI {
  on: boolean
  toggle: () => void
}

interface ToggleBag extends ToggleImperativeAPI {
  togglerProps: TogglerProps
  getTogglerProps: GetTogglerProps
}

function useToggle(): ToggleBag {
  const [on, setOn] = React.useState(false)
  const toggle = (): void => setOn(!on)

  // 🐨 Add a property called `togglerProps`. It should be an object that has
  // `aria-pressed` and `onClick` properties.
  // 💰 {'aria-pressed': on, onClick: toggle}
  const togglerProps: TogglerProps = {
    'aria-pressed': on,
    onClick: () => toggle,
  }

  function getTogglerProps<
    T extends Partial<TogglerProps> &
      Partial<ToggleImperativeAPI> & {[AttributeName: string]: unknown}
  >({onClick, ...props} = {} as T) {
    return {
      ...togglerProps,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  return {
    on,
    toggle,
    togglerProps,
    getTogglerProps,
  }
}

function App(): JSX.Element {
  const {on, getTogglerProps} = useToggle()
  return (
    <div>
      <Switch {...getTogglerProps({on})} />
      <hr />
      <button
        {...getTogglerProps({
          'aria-label': 'custom-button',
          onClick: () => console.info('onButtonClick'),
          id: 'custom-button-id',
        })}
      >
        {on ? 'on' : 'off'}
      </button>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
