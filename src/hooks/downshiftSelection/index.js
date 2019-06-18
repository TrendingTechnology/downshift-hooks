import { useReducer, useRef, useEffect } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import * as keyboardKey from 'keyboard-key'
import * as _ from 'lodash'

import {
  actionTypes,
  defaultIds,
  callAllEventHandlers,
  setAriaLiveMessage,
  getState,
} from '../../utils'
import downshiftSelectionReducer from './reducer'
import getA11yStatusMessage from './utils'

let keyClear = null

function useDownshiftSelection(userProps = {}) {
  // Props defaults and destructuring.
  const props = {
    itemToString: item => (item ? String(item) : ''),
    stateReducer: (s, a) => a.changes,
    getA11yStatusMessage,
    ...userProps,
  }
  const {
    items,
    itemToString,
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
    stateReducer,
  } = props

  // Initial state.
  const initialState = {
    highlightedIndex: highlightedIndexFromProps || initialHighlightedIndex || defaultHighlightedIndex || -1,
    isOpen: isOpenFromProps || initialIsOpen || defaultIsOpen || false,
    selectedItem: selectedItemFromProps || initialSelectedItem || defaultSelectedItem || null,
  }

  // Reducer init.
  const [{
    isOpen,
    highlightedIndex,
    selectedItem,
    keysSoFar,
  }, dispatch] = useReducer((state, action) => {
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
    setAriaLiveMessage(
      getA11yStatusMessage({
        isOpen,
        items,
      }),
    )
  }, [isOpen])
  useEffect(() => {
    setAriaLiveMessage(
      getA11yStatusMessage({
        selectedItem,
        itemToString,
      }),
    )
  }, [selectedItem])
  useEffect(() => {
    if (keyClear) {
      clearTimeout(keyClear)
      keyClear = null
    }
    keyClear = setTimeout(() => {
      dispatch({
        type: actionTypes.SingleSelect.FunctionClearKeysSoFar,
      })
    }, 500)
  }, [keysSoFar])
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
    if (highlightedIndex < 0 || isInitialMount) {
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
    ArrowDown(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.SingleSelect.TriggerButtonKeyDownArrowDown,
        props,
      })
    },
    ArrowUp(event) {
      event.preventDefault()
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
    } else if (/^\S{1}$/.test(key)) {
      dispatch({
        type: actionTypes.SingleSelect.MenuKeyDownCharacter,
        key,
        props,
      })
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
    id: triggerButtonId,
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
