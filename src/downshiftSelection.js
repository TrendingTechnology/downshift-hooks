import { useReducer, useRef } from 'react'
import * as keyboardKey from 'keyboard-key'

import {
  singleSelectActionTypes as actionTypes,
  defaultIds,
  getNextWrappingIndex,
  callAllEventHandlers,
} from './utils'

function downshiftSelectionReducer(state, action) {
  switch (action.type) {
    case actionTypes.MenuKeyDownArrowDown:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          action.shiftKey ? 5 : 1,
          state.highlightedIndex,
          action.itemsLength,
        ),
      }
    case actionTypes.MenuKeyDownArrowUp:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          action.shiftKey ? -5 : -1,
          state.highlightedIndex,
          action.itemsLength,
        ),
      }
    case actionTypes.MenuKeyDownEnd:
      return {
        ...state,
        highlightedIndex: action.itemsLength - 1,
      }
    case actionTypes.MenuKeyDownHome:
      return {
        ...state,
        highlightedIndex: 0,
      }
    case actionTypes.MenuKeyDownEscape:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
      }
    case actionTypes.TriggerButtonKeyDownArrowDown:
      return {
        ...state,
        isOpen: true,
        highlightedIndex: 0,
      }
    case actionTypes.TriggerButtonKeyDownArrowUp:
      return {
        ...state,
        isOpen: true,
        highlightedIndex: action.itemsLength - 1,
      }
    case actionTypes.TriggerButtonClick:
    case actionTypes.FunctionToggleMenu:
      return {
        ...state,
        isOpen: !state.isOpen,
        highlightedIndex: state.isOpen ? -1 : -1,
      }
    case actionTypes.FunctionCloseMenu:
      return { ...state, isOpen: false }
    case actionTypes.FunctionOpenMenu:
      return { ...state, isOpen: true }
    default:
      throw new Error();
  }
}

function getState(state, props) {
  return Object.keys(state).reduce((prevState, key) => {
    // eslint-disable-next-line no-param-reassign
    prevState[key] = props[key] !== undefined
      ? props[key]
      : state[key]
    return prevState
  }, {})
}

function useDownshiftSelection(props) {
  // Props destructuring.
  const {
    // highlightedIndex
    highlightedIndex: highlightedIndexFromProps,
    initialHighlightedIndex,
    defaultHighlightedIndex,
    // isOpen
    isOpen: isOpenFromProps,
    initialIsOpen,
    defaultIsOpen,
    // ids
    labelId: labelIdFromProps,
    menuId: menuIdFromProps,
    itemId: itemIdFromProps,
    triggerButtonId: triggerButtonIdFromProps,
    // reducer
    stateReducer = (s, a) => a.changes,
  } = props

  // Initial state.
  const initialState = {
    highlightedIndex: highlightedIndexFromProps || initialHighlightedIndex || defaultHighlightedIndex || -1,
    isOpen: isOpenFromProps || initialIsOpen || defaultIsOpen || false,
  }

  // Reducer init.
  const [{ isOpen, highlightedIndex }, dispatch] = useReducer((state, action) => {
    // eslint-disable-next-line no-param-reassign
    state = getState(state, props)
    const changes = downshiftSelectionReducer(state, action)
    return stateReducer(state, { ...action, changes })
  }, initialState)

  // IDs generation.
  const labelId = labelIdFromProps || defaultIds.label
  const itemId = itemIdFromProps || defaultIds.item
  const menuId = menuIdFromProps || defaultIds.menu
  const triggerButtonId = triggerButtonIdFromProps || defaultIds.triggerButton

  // Refs
  const itemsRef = useRef()
  const triggerButtonRef = useRef(null)
  const menuRef = useRef(null)
  itemsRef.current = []

  // Event handler functions
  const keyDownHandlers = {
    ArrowDown(event) {
      dispatch({
        type: actionTypes.MenuKeyDownArrowDown,
        itemsLength: itemsRef.current.length,
        shiftKey: event.shiftKey,
      })
    },
    ArrowUp(event) {
      dispatch({
        type: actionTypes.MenuKeyDownArrowUp,
        itemsLength: itemsRef.current.length,
        shiftKey: event.shiftKey,
      })
    },
  }
  const menuKeyDownHandlers = {
    ...keyDownHandlers,
    Home() {
      dispatch({ type: actionTypes.MenuKeyDownHome })
    },
    End() {
      dispatch({
        type: actionTypes.MenuKeyDownEnd,
        itemsLength: itemsRef.current.length,
      })
    },
    Escape() {
      dispatch({
        type: actionTypes.MenuKeyDownEscape,
      })
      triggerButtonRef.current.focus()
    },
  }
  const triggerButtonKeyDownHandlers = {
    ArrowDown() {
      dispatch({
        type: actionTypes.TriggerButtonKeyDownArrowDown,
      })
      menuRef.current.focus()
    },
    ArrowUp() {
      dispatch({
        type: actionTypes.TriggerButtonKeyDownArrowUp,
        itemsLength: itemsRef.current.length,
      })
      menuRef.current.focus()
    },
  }

  // Event handlers.
  const menuHandleKeyDown = (event) => {
    const key = keyboardKey.getKey(event)
    if (key && menuKeyDownHandlers[key]) {
      menuKeyDownHandlers[key].call(this, event)
    }
  }
  const triggerButtonHandleClick = () => {
    dispatch({ type: actionTypes.TriggerButtonClick })
    menuRef.current.focus()
  }
  const triggerButtonHandleKeyDown = (event) => {
    const key = keyboardKey.getKey(event)
    if (key && triggerButtonKeyDownHandlers[key]) {
      triggerButtonKeyDownHandlers[key].call(this, event)
    }
  }

  // returns
  const toggleMenu = () => {
    dispatch({ type: actionTypes.FunctionToggleMenu })
  }
  const closeMenu = () => {
    dispatch({ type: actionTypes.FunctionCloseMenu })
  }
  const openMenu = () => {
    dispatch({ type: actionTypes.FunctionOpenMenu })
  }
  const getLabelProps = () => ({
    id: labelId,
  })
  const getMenuProps = ({
    onKeyDown,
  } = {}) => ({
    id: menuId,
    'aria-labelledby': labelId,
    tabIndex: -1,
    ref: menuRef,
    onKeyDown: callAllEventHandlers(
      onKeyDown,
      menuHandleKeyDown,
    ),
  })
  const getTriggerButtonProps = ({
    onClick,
    onKeyDown,
  } = {}) => ({
    ref: triggerButtonRef,
    'aria-haspopup': 'listbox',
    'aria-expanded': isOpen,
    'aria-labelledby': `${labelId} ${triggerButtonId}`,
    onClick: callAllEventHandlers(
      onClick,
      triggerButtonHandleClick,
    ),
    onKeyDown: callAllEventHandlers(
      onKeyDown,
      triggerButtonHandleKeyDown,
    ),
  })
  const getItemProps = ({
    item,
  } = {}) => {
    itemsRef.current.push(item)
    return {
      role: 'option',
      id: itemId(itemsRef.current.length - 1),
    }
  }

  return {
    toggleMenu,
    openMenu,
    closeMenu,
    getTriggerButtonProps,
    getLabelProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    isOpen,
  }
}

export default useDownshiftSelection
