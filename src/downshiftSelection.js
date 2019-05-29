import { useReducer, useRef, useEffect } from 'react'
import * as keyboardKey from 'keyboard-key'

import {
  singleSelectActionTypes as actionTypes,
  defaultIds,
  getNextWrappingIndex,
  callAllEventHandlers,
} from './utils'

function downshiftSelectionReducer(state, action) {
  switch (action.type) {
    case actionTypes.KeyDownArrowDown:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          action.shiftKey ? 5 : 1,
          state.highlightedIndex,
          action.itemsLength,
        ),
      }
    case actionTypes.KeyDownArrowUp:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          action.shiftKey ? -5 : -1,
          state.highlightedIndex,
          action.itemsLength,
        ),
      }
    case actionTypes.keyDownEnd:
      return {
        ...state,
        highlightedIndex: action.itemsLength - 1,
      }
    case actionTypes.keyDownHome:
      return {
        ...state,
        highlightedIndex: 0,
      }
    case actionTypes.ToggleMenu:
    case actionTypes.TriggerButtonClick:
      return { ...state, isOpen: !state.isOpen }
    case actionTypes.CloseMenu:
      return { ...state, isOpen: false }
    case actionTypes.OpenMenu:
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
    highlightedIndex: highlightedIndexFromProps || initialHighlightedIndex || defaultHighlightedIndex || null,
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
  const isInitialMount = useRef(true)
  const triggerButtonRef = useRef(null)
  const menuRef = useRef(null)
  itemsRef.current = []

  // Focus list but not on firs render.
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else if (isOpen) {
      menuRef.current.focus()
    }
  }, [isOpen])

  // Event handler functions
  const keyDownHandlers = {
    ArrowDown(event) {
      dispatch({
        type: actionTypes.KeyDownArrowDown,
        itemsLength: itemsRef.current.length,
        shiftKey: event.shiftKey,
      })
    },
    ArrowUp(event) {
      dispatch({
        type: actionTypes.KeyDownArrowUp,
        itemsLength: itemsRef.current.length,
        shiftKey: event.shiftKey,
      })
    },
  }

  const menuKeyDownHandlers = {
    ...keyDownHandlers,
    Home() {
      dispatch({ type: actionTypes.keyDownHome })
    },
    End() {
      dispatch({
        type: actionTypes.keyDownEnd,
        itemsLength: itemsRef.current.length,
      })
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
  }

  // returns
  const toggleMenu = () => {
    dispatch({ type: actionTypes.ToggleMenu })
  }

  const closeMenu = () => {
    dispatch({ type: actionTypes.CloseMenu })
  }

  const openMenu = () => {
    dispatch({ type: actionTypes.OpenMenu })
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
  } = {}) => ({
    ref: triggerButtonRef,
    'aria-haspopup': 'listbox',
    'aria-expanded': isOpen,
    'aria-labelledby': `${labelId} ${triggerButtonId}`,
    onClick: callAllEventHandlers(
      onClick,
      triggerButtonHandleClick,
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
