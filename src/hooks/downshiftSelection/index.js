/* eslint-disable max-statements */
import {useReducer, useRef, useEffect} from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import * as keyboardKey from 'keyboard-key'
import {useId} from '@reach/auto-id'
import {
  getDefaultIds,
  callAllEventHandlers,
  callAll,
  setAriaLiveMessage,
  getState,
  getItemIndex,
  getPropTypesValidator,
} from '../utils'
import downshiftSelectionReducer from './reducer'
import {
  getA11yStatusMessage as defaultGetA11yStatusMessage,
  actionTypes,
  getInitialState,
  propTypes,
} from './utils'

let keyClear = null

const validateUseLocalStorageState = getPropTypesValidator(
  useDownshiftSelection,
  propTypes,
)

function useDownshiftSelection(userProps = {}) {
  validateUseLocalStorageState(userProps)
  // Props defaults and destructuring.
  const props = {
    itemToString: item => (item ? String(item) : ''),
    stateReducer: (s, a) => a.changes,
    getA11yStatusMessage: defaultGetA11yStatusMessage,
    ...userProps,
  }
  const {
    items,
    itemToString,
    getA11yStatusMessage,
    initialIsOpen,
    defaultIsOpen,
    labelId: labelIdFromProps,
    menuId: menuIdFromProps,
    itemId: itemIdFromProps,
    toggleButtonId: toggleButtonIdFromProps,
    stateReducer,
  } = props
  const defaultIds = getDefaultIds(useId())
  // Initial state depending on controlled props.
  const initialState = getInitialState(props)

  // Reducer init.
  const [
    {isOpen, highlightedIndex, selectedItem, keysSoFar},
    dispatch,
  ] = useReducer((state, action) => {
    const changes = downshiftSelectionReducer(state, action)
    return getState(stateReducer(state, {...action, changes}), props)
  }, initialState)

  // IDs generation.
  const labelId = labelIdFromProps || defaultIds.label
  const itemId = itemIdFromProps || defaultIds.item
  const menuId = menuIdFromProps || defaultIds.menu
  const toggleButtonId = toggleButtonIdFromProps || defaultIds.toggleButton

  // Refs
  const toggleButtonRef = useRef(null)
  const menuRef = useRef(null)
  const itemRefs = useRef()
  itemRefs.current = []
  const isInitialMount = useRef(true)

  // Effects.
  // Status message on open.
  useEffect(() => {
    if (!isOpen) {
      return
    }
    setAriaLiveMessage(
      getA11yStatusMessage({
        selectedItem,
        itemToString,
        isOpen,
        items,
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
  // Status message on selection.
  useEffect(() => {
    if (!selectedItem) {
      return
    }
    setAriaLiveMessage(
      getA11yStatusMessage({
        selectedItem,
        itemToString,
        isOpen,
        items,
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem])
  // Concatenates keysSoFar and schedules the cleanup.
  useEffect(() => {
    if (!keysSoFar) {
      return
    }
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
  useEffect(() => {
    // Don't focus menu on first render, most probably is closed.
    if (isInitialMount.current) {
      isInitialMount.current = false
      // But it was initialised as open, then focus.
      if (initialIsOpen || defaultIsOpen || isOpen) {
        menuRef.current.focus()
      }
      return
    }
    // Focuses menu on open.
    if (isOpen) {
      menuRef.current.focus()
      // Focuses toggleButton on close.
    } else if (document.activeElement === menuRef.current) {
      toggleButtonRef.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
  // Scrolls highlighted index into view.
  useEffect(() => {
    if (highlightedIndex < 0 || !isOpen || !itemRefs.current.length) {
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
    Home(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.MenuKeyDownHome,
        props,
      })
    },
    End(event) {
      event.preventDefault()
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
      // The exception that calls MenuBlur.
      if (event.shiftKey) {
        dispatch({
          type: actionTypes.MenuBlur,
          props,
        })
      }
    },
  }
  const toggleButtonKeyDownHandlers = {
    ArrowDown(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.ToggleButtonKeyDownArrowDown,
        props,
      })
    },
    ArrowUp(event) {
      event.preventDefault()
      dispatch({
        type: actionTypes.ToggleButtonKeyDownArrowUp,
        props,
      })
    },
  }

  // Event handlers.
  const menuHandleKeyDown = event => {
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
  // Focus going back to the toggleButton is something we control (Escape, Enter, Click).
  // We are toggleing special actions for these cases in reducer, not MenuBlur.
  // Since Shift-Tab also lands focus on toggleButton, we will handle it as exception and call MenuBlur.
  const menuHandleBlur = event => {
    if (event.relatedTarget !== toggleButtonRef.current) {
      dispatch({
        type: actionTypes.MenuBlur,
        props,
      })
    }
  }
  const toggleButtonHandleClick = () => {
    dispatch({
      type: actionTypes.ToggleButtonClick,
      props,
    })
  }
  const toggleButtonHandleKeyDown = event => {
    const key = keyboardKey.getKey(event)
    if (key && toggleButtonKeyDownHandlers[key]) {
      toggleButtonKeyDownHandlers[key](event)
    }
  }
  const itemHandleMouseOver = index => {
    dispatch({
      type: actionTypes.ItemHover,
      props,
      index,
    })
  }
  const itemHandleClick = index => {
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
      props,
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
      props,
    })
  }
  const setHighlightedIndex = newHighlightedIndex => {
    dispatch({
      type: actionTypes.FunctionSetHighlightedIndex,
      highlightedIndex: newHighlightedIndex,
    })
  }
  const setSelectedItem = newSelectedItem => {
    dispatch({
      type: actionTypes.FunctionSetSelectedItem,
      selectedItem: newSelectedItem,
    })
  }
  const reset = () => {
    dispatch({
      type: actionTypes.FunctionReset,
      props,
    })
  }
  const getLabelProps = () => ({
    id: labelId,
  })
  const getMenuProps = ({onKeyDown, onBlur, refKey = 'ref', ref} = {}) => ({
    [refKey]: callAll(ref, menuNode => {
      menuRef.current = menuNode
    }),
    id: menuId,
    role: 'listbox',
    'aria-labelledby': labelId,
    tabIndex: -1,
    ...(highlightedIndex > -1 && {
      'aria-activedescendant': itemId(highlightedIndex),
    }),
    onKeyDown: callAllEventHandlers(onKeyDown, menuHandleKeyDown),
    onBlur: callAllEventHandlers(onBlur, menuHandleBlur),
  })
  const getToggleButtonProps = ({
    onClick,
    onKeyDown,
    refKey = 'ref',
    ref,
    ...rest
  } = {}) => ({
    [refKey]: callAll(ref, toggleButtonNode => {
      toggleButtonRef.current = toggleButtonNode
    }),
    id: toggleButtonId,
    'aria-haspopup': 'listbox',
    'aria-expanded': isOpen,
    'aria-labelledby': `${labelId} ${toggleButtonId}`,
    onClick: callAllEventHandlers(onClick, toggleButtonHandleClick),
    onKeyDown: callAllEventHandlers(onKeyDown, toggleButtonHandleKeyDown),
    ...rest,
  })
  const getItemProps = ({
    item,
    index,
    refKey = 'ref',
    ref,
    onMouseOver,
    onClick,
    ...rest
  } = {}) => {
    const itemIndex = getItemIndex(index, item, items)
    if (itemIndex < 0) {
      throw new Error('Pass either item or item index in getItemProps!')
    }
    return {
      [refKey]: callAll(ref, itemNode => {
        if (itemNode) {
          itemRefs.current.push(itemNode)
        }
      }),
      role: 'option',
      ...(itemIndex === highlightedIndex && {'aria-selected': true}),
      id: itemId(itemIndex),
      onMouseOver: callAllEventHandlers(onMouseOver, () =>
        itemHandleMouseOver(itemIndex),
      ),
      onClick: callAllEventHandlers(onClick, () => itemHandleClick(itemIndex)),
      ...rest,
    }
  }

  return {
    // prop getters.
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getItemProps,
    // actions.
    toggleMenu,
    openMenu,
    closeMenu,
    setHighlightedIndex,
    setSelectedItem,
    reset,
    // state.
    highlightedIndex,
    isOpen,
    selectedItem,
    // props.
    items,
  }
}

export default useDownshiftSelection
