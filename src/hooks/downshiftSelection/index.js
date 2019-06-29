import { useReducer, useRef, useEffect } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import * as keyboardKey from 'keyboard-key'

import {
  defaultIds,
  callAllEventHandlers,
  setAriaLiveMessage,
  getState,
} from '../../utils'
import downshiftSelectionReducer from './reducer'
import {
  getA11yStatusMessage,
  actionTypes,
  getInitialState,
} from './utils'

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
    // isOpen
    // selectedItem
    // ids
    labelId: labelIdFromProps,
    menuId: menuIdFromProps,
    itemId: itemIdFromProps,
    triggerButtonId: triggerButtonIdFromProps,
    // reducer
    stateReducer,
    // onChange props
    // onSelectedItemChange,
    // onOpenChange,
    // onHighlightedIndexChange,
    // onStateChange,
  } = props

  // Initial state depending on controlled props.
  const initialState = getInitialState(props)

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
  // Status message on open.
  useEffect(() => {
    setAriaLiveMessage(
      getA11yStatusMessage({
        isOpen,
        items,
      }),
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
  // Status message on selection.
  useEffect(() => {
    setAriaLiveMessage(
      getA11yStatusMessage({
        selectedItem,
        itemToString,
      }),
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem])
  // Concatenates keysSoFar and schedules the cleanup.
  useEffect(() => {
    if (keyClear) {
      clearTimeout(keyClear)
      keyClear = null
    }
    keyClear = setTimeout(() => {
      dispatch({
        type: actionTypes.FunctionClearKeysSoFar,
        props,
      })
    }, 500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSoFar])
  // Focuses menu on open but not on first mount.
  // Focuses triggerButton on close.
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
  // Scrolls highlighted index into view.
  useEffect(() => {
    if (highlightedIndex < 0 || !isOpen) {
      return
    }
    scrollIntoView(itemRefs.current[highlightedIndex], {
      scrollMode: 'if-needed',
      block: 'nearest',
      inline: 'nearest',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedIndex])

  // Event handler functions
  const menuKeyDownHandlers = {
    ArrowDown(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.MenuKeyDownArrowDown,
        props,
        shiftKey: event.shiftKey,
      })
    },
    ArrowUp(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.MenuKeyDownArrowUp,
        props,
        shiftKey: event.shiftKey,
      })
    },
    Home() {
      dispatch({
        type: actionTypes.MenuKeyDownHome,
        props,
      })
    },
    End() {
      dispatch({
        type: actionTypes.MenuKeyDownEnd,
        props,
      })
    },
    Escape() {
      dispatch({
        type: actionTypes.MenuKeyDownEscape,
        props,
      })
    },
    Enter() {
      dispatch({
        type: actionTypes.MenuKeyDownEnter,
        props,
      })
    },
    Tab(event) {
      if (event.shiftKey) {
        dispatch({
          type: actionTypes.MenuBlur,
          props,
        })
      }
    },
  }
  const triggerButtonKeyDownHandlers = {
    ArrowDown(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.TriggerButtonKeyDownArrowDown,
        props,
      })
    },
    ArrowUp(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.TriggerButtonKeyDownArrowUp,
        props,
      })
    },
  }

  // Event handlers.
  const menuHandleKeyDown = (event) => {
    const key = keyboardKey.getKey(event)
    if (key && menuKeyDownHandlers[key]) {
      menuKeyDownHandlers[key](event)
    } else if (/^\S{1}$/.test(key)) {
      dispatch({
        type: actionTypes.MenuKeyDownCharacter,
        key,
        props,
      })
    }
  }
  // Focus going back to the triggerButton is something we control (Escape, Enter, Click).
  // We are triggering special actions for these cases in reducer, not MenuBlur.
  // Since Shift-Tab also lands focus on triggerButton, we will handle it as exception and call MenuBlur.
  const menuHandleBlur = (event) => {
    if (event.relatedTarget !== triggerButtonRef.current) {
      dispatch({
        type: actionTypes.MenuBlur,
        props,
      })
    }
  }
  const triggerButtonHandleClick = () => {
    dispatch({
      type: actionTypes.TriggerButtonClick,
      props,
    })
  }
  const triggerButtonHandleKeyDown = (event) => {
    const key = keyboardKey.getKey(event)
    if (key && triggerButtonKeyDownHandlers[key]) {
      triggerButtonKeyDownHandlers[key](event)
    }
  }
  const itemHandleMouseOver = (index) => {
    dispatch({
      type: actionTypes.ItemHover,
      props,
      index,
    })
  }
  const itemHandleClick = (index) => {
    dispatch({
      type: actionTypes.ItemClick,
      props,
      index,
    })
  }

  // returns
  const toggleMenu = () => {
    dispatch({
      type: actionTypes.FunctionToggleMenu,
    })
  }
  const closeMenu = () => {
    dispatch({
      type: actionTypes.FunctionCloseMenu,
    })
  }
  const openMenu = () => {
    dispatch({
      type: actionTypes.FunctionOpenMenu,
    })
  }
  const setHighlightedIndex = (newHighlightedIndex) => {
    dispatch({
      type: actionTypes.FunctionSetHighlightedIndex,
      highlightedIndex: newHighlightedIndex,
    })
  }
  const setSelectedItem = (newSelectedItem) => {
    dispatch({
      type: actionTypes.FunctionSetSelectedItem,
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
