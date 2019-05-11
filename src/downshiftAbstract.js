import { useReducer, useRef } from 'react'
import * as keyboardKey from 'keyboard-key'
import { actionTypes, defaultIds } from './utils'

const downshiftReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.KeyDownArrowDown:
      return { ...state, highlightedIndex: (state.highlightedIndex || 0) + 1 }
    case actionTypes.KeyDownArrowUp:
      return { ...state, highlightedIndex: (state.highlightedIndex || 0) - 1 }
    case actionTypes.TriggerClick:
      return { ...state, isOpen: !state.isOpen }
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
    items: [],
  }

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

  // helpers
  const toggleMenu = () => {
    dispatch({ type: actionTypes.TriggerClick })
  }

  // returns
  const getItemNavigationKeyDownHandler = (e) => {
    const keyCode = keyboardKey.getCode(e)
    switch (keyCode) {
      case keyboardKey.ArrowDown:
        dispatch({ type: actionTypes.KeyDownArrowDown })
        break
      case keyboardKey.ArrowUp:
        dispatch({ type: actionTypes.KeyDownArrowUp })
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
  }) => ({
    role: 'option',
    id: itemId(index),
  })

  return {
    toggleMenu,
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
