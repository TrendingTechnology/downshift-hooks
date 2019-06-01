import { useReducer, useRef, useEffect } from 'react'
import * as keyboardKey from 'keyboard-key'

import {
  actionTypes,
  defaultIds,
  getNextWrappingIndex,
  callAllEventHandlers,
} from './utils'

function downshiftSelectionReducer(state, action) {
  const {
    type,
    props,
    key,
    shiftKey,
  } = action
  switch (type) {
    case actionTypes.SingleSelect.Menu.Blur:
      return {
        ...state,
        isOpen: false,
        ...(state.highlightedIndex >= 0 && {
          selectedItem: props.items[state.highlightedIndex],
        }),
      }
    case actionTypes.SingleSelect.Menu.KeyDown:
      switch (key) {
        case keyboardKey.ArrowDown:
          return {
            ...state,
            highlightedIndex: getNextWrappingIndex(
              shiftKey ? 5 : 1,
              state.highlightedIndex,
              props.items.length,
              props.circularNavigation,
            ),
          }
        case keyboardKey.ArrowUp:
          return {
            ...state,
            highlightedIndex: getNextWrappingIndex(
              shiftKey ? -5 : -1,
              state.highlightedIndex,
              props.items.length,
              props.circularNavigation,
            ),
          }
        case keyboardKey.Home:
          return {
            ...state,
            highlightedIndex: 0,
          }
        case keyboardKey.End:
          return {
            ...state,
            highlightedIndex: props.items.length - 1,
          }
        case keyboardKey.Escape:
          return {
            ...state,
            isOpen: false,
            highlightedIndex: -1,
          }
        case keyboardKey.Enter:
          return {
            ...state,
            isOpen: false,
            highlightedIndex: -1,
            selectedItem: props.items[state.highlightedIndex],
          }
        default:
          return state
      }
    case actionTypes.SingleSelect.TriggerButton.KeyDown:
      switch (key) {
        case keyboardKey.ArrowDown:
          return {
            ...state,
            isOpen: true,
            highlightedIndex: state.selectedItem
              ? getNextWrappingIndex(
                1,
                props.items.indexOf(state.selectedItem),
                props.items.length,
                false,
              )
              : 0,
          }
        case keyboardKey.ArrowUp:
          return {
            ...state,
            isOpen: true,
            highlightedIndex: state.selectedItem
              ? getNextWrappingIndex(
                -1,
                props.items.indexOf(state.selectedItem),
                props.items.length,
                false,
              )
              : 0,
          }
        default:
          return state
      }
    case actionTypes.SingleSelect.TriggerButton.Click:
    case actionTypes.SingleSelect.Function.ToggleMenu:
      return {
        ...state,
        isOpen: !state.isOpen,
        highlightedIndex: state.selectedItem
          ? props.items.indexOf(state.selectedItem)
          : 0,
      }
    case actionTypes.SingleSelect.Function.OpenMenu:
      return {
        ...state,
        isOpen: true,
      }
    case actionTypes.SingleSelect.Function.CloseMenu:
      return {
        ...state,
        isOpen: false,
      }
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
    items,
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
  const [{ isOpen, highlightedIndex, selectedItem }, dispatch] = useReducer((state, action) => {
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
  const triggerButtonRef = useRef(null)
  const menuRef = useRef(null)
  const isInitialMount = useRef(true)

  // Effects.
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (isOpen) {
      menuRef.current.focus()
    } else {
      triggerButtonRef.current.focus()
    }
  }, [isOpen])

  // Event handlers.
  const menuHandleKeyDown = (event) => {
    dispatch({
      type: actionTypes.SingleSelect.Menu.KeyDown,
      props,
      key: keyboardKey.getCode(event),
      shiftKey: event.shiftKey,
    })
  }
  const menuHandleBlur = (event) => {
    if (event.relatedTarget !== triggerButtonRef.current) {
      dispatch({
        type: actionTypes.SingleSelect.Menu.Blur,
        props,
      })
    }
  }
  const triggerButtonHandleClick = () => {
    dispatch({
      type: actionTypes.SingleSelect.TriggerButton.Click,
      props,
    })
  }
  const triggerButtonHandleKeyDown = (event) => {
    dispatch({
      type: actionTypes.SingleSelect.TriggerButton.KeyDown,
      props,
      key: keyboardKey.getCode(event),
    })
  }

  // returns
  const toggleMenu = () => {
    dispatch({
      type: actionTypes.SingleSelect.Function.ToggleMenu,
    })
  }
  const closeMenu = () => {
    dispatch({
      type: actionTypes.SingleSelect.Function.CloseMenu,
    })
  }
  const openMenu = () => {
    dispatch({
      type: actionTypes.SingleSelect.Function.OpenMenu,
    })
  }
  const getLabelProps = () => ({
    id: labelId,
  })
  const getMenuProps = ({
    onKeyDown,
    onBlur,
  } = {}) => ({
    id: menuId,
    'aria-labelledby': labelId,
    tabIndex: -1,
    ref: menuRef,
    onKeyDown: callAllEventHandlers(
      onKeyDown,
      menuHandleKeyDown,
    ),
    onBlur: callAllEventHandlers(
      onBlur,
      menuHandleBlur,
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
    index,
  } = {}) => {
    const itemIndex = index || items.indexOf(item)
    if (itemIndex < 0) {
      throw new Error('Pass either item or item index in getItemProps!')
    }
    return {
      role: 'option',
      id: itemId(itemIndex),
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
    selectedItem,
  }
}

export default useDownshiftSelection
