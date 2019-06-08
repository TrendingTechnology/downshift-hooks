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
    shiftKey,
  } = action

  switch (type) {
    case actionTypes.SingleSelect.ItemHover:
      return {
        ...state,
        highlightedIndex: action.index,
      }
    case actionTypes.SingleSelect.ItemClick:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        selectedItem: props.items[action.index],
      }
    case actionTypes.SingleSelect.MenuBlur:
      return {
        ...state,
        isOpen: false,
        ...(state.highlightedIndex >= 0 && {
          selectedItem: props.items[state.highlightedIndex],
        }),
      }
    case actionTypes.SingleSelect.MenuKeyDownArrowDown:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? 5 : 1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      }
    case actionTypes.SingleSelect.MenuKeyDownArrowUp:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? -5 : -1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      }
    case actionTypes.SingleSelect.MenuKeyDownHome:
      return {
        ...state,
        highlightedIndex: 0,
      }
    case actionTypes.SingleSelect.MenuKeyDownEnd:
      return {
        ...state,
        highlightedIndex: props.items.length - 1,
      }
    case actionTypes.SingleSelect.MenuKeyDownEscape:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
      }
    case actionTypes.SingleSelect.MenuKeyDownEnter:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        selectedItem: props.items[state.highlightedIndex],
      }
    case actionTypes.SingleSelect.TriggerButtonKeyDownArrowDown:
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
    case actionTypes.SingleSelect.TriggerButtonKeyDownArrowUp:
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
    case actionTypes.SingleSelect.TriggerButtonClick:
    case actionTypes.SingleSelect.FunctionToggleMenu:
      return {
        ...state,
        isOpen: !state.isOpen,
        highlightedIndex: state.selectedItem
          ? props.items.indexOf(state.selectedItem)
          : 0,
      }
    case actionTypes.SingleSelect.FunctionOpenMenu:
      return {
        ...state,
        isOpen: true,
      }
    case actionTypes.SingleSelect.FunctionCloseMenu:
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
    } else if (document.activeElement === menuRef.current) {
      triggerButtonRef.current.focus()
    }
  }, [isOpen])

  // Event handler functions
  const menuKeyDownHandlers = {
    ArrowDown(event) {
      dispatch({
        type: actionTypes.SingleSelect.MenuKeyDownArrowDown,
        props,
        shiftKey: event.shiftKey,
      })
    },
    ArrowUp(event) {
      dispatch({
        type: actionTypes.SingleSelect.MenuKeyDownArrowUp,
        props,
        shiftKey: event.shiftKey,
      })
    },
    Home() {
      dispatch({
        type: actionTypes.SingleSelect.MenuKeyDownHome,
        props,
      })
    },
    End() {
      dispatch({
        type: actionTypes.SingleSelect.MenuKeyDownEnd,
        props,
      })
    },
    Escape() {
      dispatch({
        type: actionTypes.SingleSelect.MenuKeyDownEscape,
        props,
      })
    },
    Enter() {
      dispatch({
        type: actionTypes.SingleSelect.MenuKeyDownEnter,
        props,
      })
    },
    Tab(event) {
      if (event.shiftKey) {
        dispatch({
          type: actionTypes.SingleSelect.MenuBlur,
          props,
        })
      }
    },
  }
  const triggerButtonKeyDownHandlers = {
    ArrowDown() {
      dispatch({
        type: actionTypes.SingleSelect.TriggerButtonKeyDownArrowDown,
        props,
      })
    },
    ArrowUp() {
      dispatch({
        type: actionTypes.SingleSelect.TriggerButtonKeyDownArrowUp,
        props,
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
  const menuHandleBlur = (event) => {
    // Shift Tab and Click are two blur cases that are handled separately.
    if (event.relatedTarget !== triggerButtonRef.current) {
      dispatch({
        type: actionTypes.SingleSelect.MenuBlur,
        props,
      })
    }
  }
  const triggerButtonHandleClick = () => {
    dispatch({
      type: actionTypes.SingleSelect.TriggerButtonClick,
      props,
    })
  }
  const triggerButtonHandleKeyDown = (event) => {
    const key = keyboardKey.getKey(event)
    if (key && triggerButtonKeyDownHandlers[key]) {
      triggerButtonKeyDownHandlers[key].call(this, event)
    }
  }
  const itemHandleMouseOver = (index) => {
    dispatch({
      type: actionTypes.SingleSelect.ItemHover,
      props,
      index,
    })
  }
  const itemHandleClick = (index) => {
    dispatch({
      type: actionTypes.SingleSelect.ItemClick,
      props,
      index,
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
    onMouseOver,
    onClick,
  } = {}) => {
    const itemIndex = index || items.indexOf(item)
    if (itemIndex < 0) {
      throw new Error('Pass either item or item index in getItemProps!')
    }
    return {
      role: 'option',
      id: itemId(itemIndex),
      onMouseOver: callAllEventHandlers(
        onMouseOver,
        () => itemHandleMouseOver(itemIndex),
      ),
      onClick: callAllEventHandlers(
        onClick,
        () => itemHandleClick(itemIndex),
      ),
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
