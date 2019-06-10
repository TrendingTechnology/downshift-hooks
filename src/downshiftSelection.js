import { useReducer, useRef, useEffect } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
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
        highlightedIndex: -1,
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
    case actionTypes.SingleSelect.FunctionSetHighlightedIndex:
      return {
        ...state,
        highlightedIndex: action.highlightedIndex,
      }
    case actionTypes.SingleSelect.FUnctionSetSelectedItem:
      return {
        ...state,
        selectedItem: action.selectedItem,
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
    // selectedItem
    selectedItem: selectedItemFromProps,
    initialSelectedItem,
    defaultSelectedItem,
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
    selectedItem: selectedItemFromProps || initialSelectedItem || defaultSelectedItem || null,
  }

  // Reducer init.
  const [{ isOpen, highlightedIndex, selectedItem }, dispatch] = useReducer((state, action) => {
    const changes = downshiftSelectionReducer(state, action)
    return getState(
      stateReducer(state, { ...action, changes }),
      props,
    )
  }, initialState)

  // IDs generation.
  const labelId = labelIdFromProps || defaultIds.label
  const itemId = itemIdFromProps || defaultIds.item
  const menuId = menuIdFromProps || defaultIds.menu
  const triggerButtonId = triggerButtonIdFromProps || defaultIds.triggerButton

  // Refs
  const triggerButtonRef = useRef(null)
  const menuRef = useRef(null)
  const itemRefs = useRef()
  itemRefs.current = []
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

  useEffect(() => {
    if (highlightedIndex < 0) {
      return
    }
    scrollIntoView(itemRefs.current[highlightedIndex], {
      scrollMode: 'if-needed',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [highlightedIndex])

  // Event handler functions
  const menuKeyDownHandlers = {
    ArrowDown(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.SingleSelect.MenuKeyDownArrowDown,
        props,
        shiftKey: event.shiftKey,
      })
    },
    ArrowUp(event) {
      event.preventDefault()
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
      type: actionTypes.SingleSelect.FunctionToggleMenu,
    })
  }
  const closeMenu = () => {
    dispatch({
      type: actionTypes.SingleSelect.FunctionCloseMenu,
    })
  }
  const openMenu = () => {
    dispatch({
      type: actionTypes.SingleSelect.FunctionOpenMenu,
    })
  }
  const setHighlightedIndex = (newHighlightedIndex) => {
    dispatch({
      type: actionTypes.SingleSelect.FunctionSetHighlightedIndex,
      highlightedIndex: newHighlightedIndex,
    })
  }
  const setSelectedItem = (newSelectedItem) => {
    dispatch({
      type: actionTypes.SingleSelect.FUnctionSetSelectedItem,
      selectedItem: newSelectedItem,
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
    role: 'listbox',
    'aria-labelledby': labelId,
    tabIndex: -1,
    ...(highlightedIndex > -1 && { 'aria-activedescendant': itemId(highlightedIndex) }),
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
      ref: (itemElement) => {
        if (itemElement) {
          itemRefs.current.push(itemElement)
        }
      },
      role: 'option',
      'aria-selected': index === highlightedIndex,
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
    setHighlightedIndex,
    setSelectedItem,
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