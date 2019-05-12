import { useReducer, useRef, useEffect } from 'react'
import * as keyboardKey from 'keyboard-key'

import {
  actionTypes,
  defaultIds,
  getNextHighlightedIndexOnArrowDown,
  getNextHighlightedIndexOnArrowUp,
} from './utils'

const downshiftReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.KeyDownArrowDown:
      return {
        ...state,
        highlightedIndex: getNextHighlightedIndexOnArrowDown(
          state.highlightedIndex,
          action.payload.itemsLength,
          action.payload.shiftKeyModifier,
        ),
      }
    case actionTypes.KeyDownArrowUp:
      return {
        ...state,
        highlightedIndex: getNextHighlightedIndexOnArrowUp(
          state.highlightedIndex,
          action.payload.itemsLength,
          action.payload.shiftKeyModifier,
        ),
      }
    case actionTypes.keyDownEnd:
      return {
        ...state,
        highlightedIndex: action.payload.itemsLength - 1,
      }
    case actionTypes.keyDownHome:
      return {
        ...state,
        highlightedIndex: 0,
      }
    case actionTypes.ToggleMenu:
      return { ...state, isOpen: !state.isOpen }
    case actionTypes.CloseMenu:
      return { ...state, isOpen: false }
    case actionTypes.OpenMenu:
      return { ...state, isOpen: true }
    default:
      throw new Error();
  }
}

const useDownshiftAbstract = (props) => {
  const {
    propsHighlightedIndex,
    initialHighlightedIndex,
    defaultHighlightedIndex,
    isOpen: propsIsOpen,
    initialIsOpen,
    defaultIsOpen,
    labelId: propsLabelId,
    itemId: propsItemId,
    stateReducer = (s, a) => a.changes,
  } = props || {}
  // initial state
  const initialState = {
    highlightedIndex: propsHighlightedIndex || initialHighlightedIndex || defaultHighlightedIndex || null,
    isOpen: propsIsOpen || initialIsOpen || defaultIsOpen || false,
  }
  const items = []
  let itemsCleanup

  // items cleanup effect.
  useEffect(() => {
    itemsCleanup = true
  })

  // reducer setup
  const [{ isOpen, highlightedIndex }, dispatch] = useReducer((state, action) => {
    const changes = downshiftReducer(state, action)
    return stateReducer(state, { ...action, changes })
  }, initialState)

  // refs
  const menuRef = useRef(null)

  // element ids
  const labelId = propsLabelId || defaultIds.label
  const itemId = index => `${propsItemId || defaultIds.item}-${index}`

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

  const getItemNavigationKeyDownHandler = (e) => {
    const keyCode = keyboardKey.getCode(e)
    switch (keyCode) {
      case keyboardKey.ArrowDown:
        dispatch({ type: actionTypes.KeyDownArrowDown, payload: { itemsLength: items.length } })
        break
      case keyboardKey.ArrowUp:
        dispatch({ type: actionTypes.KeyDownArrowUp, payload: { itemsLength: items.length } })
        break
      case keyboardKey.End:
        dispatch({ type: actionTypes.keyDownEnd, payload: { itemsLength: items.length } })
        break
      case keyboardKey.Home:
        dispatch({ type: actionTypes.keyDownHome })
        break
      default:
    }
  }

  const getLabelProps = () => ({
    id: labelId,
  })

  const getMenuProps = () => ({
    ref: menuRef,
    'aria-labelledby': labelId,
  })

  const getItemProps = ({
    item,
    index,
  }) => {
    if (itemsCleanup) {
      items.length = 0
      itemsCleanup = false
    }
    items.push(item)
    return {
      role: 'option',
      id: itemId(index || items.length - 1),
    }
  }

  return {
    toggleMenu,
    closeMenu,
    openMenu,
    isOpen,
    getLabelProps,
    getMenuProps,
    menuRef,
    highlightedIndex,
    getItemNavigationKeyDownHandler,
    getItemProps,
  }
}

export default useDownshiftAbstract
