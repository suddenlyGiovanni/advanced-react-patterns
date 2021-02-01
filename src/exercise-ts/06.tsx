// Control Props
// http://localhost:3000/isolated/exercise-ts/06.tsx

import * as React from 'react'
import warning from 'warning'
import {Switch} from '../switch'

//#region  'src/hooks/use-toggle'
//#region Interface
type CallAll = <
  Fns extends Array<((...args: unknown[]) => unknown) | undefined>,
  Args extends unknown[]
>(
  ...fns: [...Fns]
) => (...args: [...Args]) => void

interface TogglerProps {
  'aria-pressed': boolean
  onClick: (...args: unknown[]) => void
}
interface ResetterProps {
  onClick: (...args: unknown[]) => void
}

interface ToggleImperativeAPI {
  on: boolean
  toggle: () => void
  reset: () => void
}

interface GetTogglerProps {
  <
    T extends Partial<TogglerProps> &
      Partial<ToggleImperativeAPI> & {[AttributeName: string]: unknown}
  >(
    attributes?: T,
  ): TogglerProps & Omit<T, 'onClick'>
}
interface GetResetterProps {
  <
    T extends Partial<ResetterProps> &
      Partial<ToggleImperativeAPI> & {[AttributeName: string]: unknown}
  >(
    attributes?: T,
  ): ResetterProps & Omit<T, 'onClick'>
}
//#endregion

const callAll: CallAll = (...fns) => (...args) =>
  fns.forEach(fn => fn?.(...args))

type State = {on: boolean}
type Action = {type: 'toggle'} | {type: 'reset'; initialState: State}

enum ActionTypes {
  TOGGLE = 'toggle',
  RESET = 'reset',
}

const toggleReducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE:
      return {on: !state.on}

    case ActionTypes.RESET:
      return action.initialState

    default:
      throw new Error(`Unsupported type: ${action.type}`)
  }
}

interface ToggleBag extends ToggleImperativeAPI {
  getTogglerProps: GetTogglerProps
  getResetterProps: GetResetterProps
}

function useToggle<
  ToggleOptions extends {
    initialOn?: boolean
    reducer?: typeof toggleReducer
    onChange?: (state: State, action: Action) => void
    on?: boolean
    readonly?: boolean
  }
>(
  {
    initialOn = false,
    reducer = toggleReducer,
    // 🐨 add an `onChange` prop.
    onChange,
    // 🐨 add an `on` option here
    // 💰 you can alias it to `controlledOn` to avoid "variable shadowing."
    on: controlledOn,
    readonly = false,
  } = {} as ToggleOptions,
): ToggleBag {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const onIsControlled: boolean = controlledOn != null
  const on: boolean = onIsControlled ? controlledOn! : state.on

  useControlledSwitchWarning(controlledOn, 'on', 'useToggle')
  useReadOnlyWarning(
    controlledOn,
    'on',
    'useToggle',
    Boolean(onChange),
    readonly,
    'readonly',
    'initialOn',
    'onChange',
  )

  const dispatchWithOnChange = (action: Action): void => {
    if (!onIsControlled) dispatch(action)
    onChange?.(reducer({...state, on}, action), action)
  }
  const toggle = (): void => dispatchWithOnChange({type: ActionTypes.TOGGLE})
  const reset = (): void =>
    dispatchWithOnChange({type: ActionTypes.RESET, initialState})

  function getTogglerProps<
    T extends Partial<TogglerProps> &
      Partial<ToggleImperativeAPI> & {[AttributeName: string]: unknown}
  >({onClick, ...props} = {} as T): TogglerProps & Omit<T, 'onClick'> {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps<
    T extends Partial<ResetterProps> &
      Partial<ToggleImperativeAPI> & {[AttributeName: string]: unknown}
  >({onClick, ...props} = {} as T): ResetterProps & Omit<T, 'onClick'> {
    return {onClick: callAll(onClick, reset), ...props}
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

// export {useToggle, toggleReducer, ActionType}
//#endregion  'src/hooks/use-toggle'

type ToggleProps = {
  on?: boolean
  onChange?: (state: State, action: Action) => void
  readonly?: boolean
}
function useControlledSwitchWarning(
  controlPropValue: any,
  controlPropName: string,
  componentName: string,
): void {
  let effect: () => void = (): void => void 0
  const isControlled = controlPropValue != null
  const {current: wasControlled} = React.useRef(isControlled)

  if (process.env.NODE_ENV !== 'production') {
    effect = (): void => {
      warning(
        !(isControlled && !wasControlled),
        `\`${componentName}\` is changing from uncontrolled to be controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
      )

      warning(
        !(!isControlled && wasControlled),
        `\`${componentName}\` is changing from controlled to be uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
      )
    }
  }

  React.useEffect(effect, [
    componentName,
    controlPropName,
    isControlled,
    wasControlled,
  ])
}

function useReadOnlyWarning(
  controlPropValue: any,
  controlPropName: string,
  componentName: string,
  hasOnChange: boolean,
  readOnly: boolean,
  readOnlyProp: string,
  initialValueProp: string,
  onChangeProp: string,
): void {
  const isControlled = controlPropName != null
  let effect: () => void = () => void 0

  if (process.env.NODE_ENV !== 'production') {
    effect = () => {
      warning(
        !(!hasOnChange && isControlled && !readOnly),
        `A \`${controlPropName}\` prop was provided to \`${componentName}\` without an \`${onChangeProp}\` handler. This will result in a read-only \`${controlPropName}\` value. If you want it to be mutable, use \`${String(
          initialValueProp,
        )}\`. Otherwise, set either \`${onChangeProp}\` or \`${readOnlyProp}\`.`,
      )
    }
  }

  React.useEffect(effect, [
    componentName,
    controlPropName,
    hasOnChange,
    initialValueProp,
    isControlled,
    onChangeProp,
    readOnly,
    readOnlyProp,
  ])
}

function Toggle({on: controlledOn, onChange, readonly}: ToggleProps) {
  const {on, getTogglerProps} = useToggle({
    on: controlledOn,
    onChange,
    readonly,
  })
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App(): JSX.Element {
  const [bothOn, setBothOn] = React.useState<boolean>(false)
  const [timesClicked, setTimesClicked] = React.useState<number>(0)
  const isClickedTooManyTimes: boolean = timesClicked > 4

  function handleToggleChange(state: State, action: Action): void {
    if (action.type === ActionTypes.TOGGLE && isClickedTooManyTimes) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick(): void {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
