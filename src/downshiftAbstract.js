import { useReducer, useRef, useEffect } from 'react'
import * as keyboardKey from 'keyboard-key'

import {
  actionTypes,
  defaultIds,
  getNextWrappingIndex,
} from './utils'

const downshiftReducer = (state, action) => {
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
    // highlightedIndex
    propsHighlightedIndex,
    initialHighlightedIndex,
    defaultHighlightedIndex,
    // isOpen
    isOpen: propsIsOpen,
    initialIsOpen,
    defaultIsOpen,
    // ids
    labelId: propsLabelId,
    menuId: propsMenuId,
    getItemId,
    // reducer
    stateReducer = (s, a) => a.changes,
  } = props || {}
  // initial state
  const initialState = {
    highlightedIndex: propsHighlightedIndex || initialHighlightedIndex || defaultHighlightedIndex || null,
    isOpen: propsIsOpen || initialIsOpen || defaultIsOpen || false,
  }
  const itemsRef = useRef()
  itemsRef.current = []

  // reducer setup
  const [{ isOpen, highlightedIndex }, dispatch] = useReducer((state, action) => {
    const changes = downshiftReducer(state, action)
    return stateReducer(state, { ...action, changes })
  }, initialState)

  // element ids
  const labelId = propsLabelId || defaultIds.label
  const itemId = getItemId || defaultIds.getItem
  const menuId = propsMenuId || defaultIds.menu

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

  const getItemNavigationKeyDownHandler = (event) => {
    const keyCode = keyboardKey.getCode(event)
    switch (keyCode) {
      case keyboardKey.ArrowDown:
        dispatch({
          type: actionTypes.KeyDownArrowDown,
          itemsLength: itemsRef.current.length,
          shiftKey: event.shiftKey,
        })
        break
      case keyboardKey.ArrowUp:
        dispatch({
          type: actionTypes.KeyDownArrowUp,
          itemsLength: itemsRef.current.length,
          shiftKey: event.shiftKey,
        })
        break
      case keyboardKey.End:
        dispatch({
          type: actionTypes.keyDownEnd,
          itemsLength: itemsRef.current.length,
        })
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
    id: menuId,
    'aria-labelledby': labelId,
  })

  const getItemProps = ({
    item,
  }) => {
    itemsRef.current.push(item)
    return {
      role: 'option',
      id: itemId(itemsRef.current.length - 1),
    }
  }

  return {
    toggleMenu,
    closeMenu,
    openMenu,
    isOpen,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemNavigationKeyDownHandler,
    getItemProps,
  }
}

export default useDownshiftAbstract
