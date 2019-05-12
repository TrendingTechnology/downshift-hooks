import { useRef, useEffect } from 'react'
import * as keyboardKey from 'keyboard-key'

import useDownshiftAbstract from './downshiftAbstract'
import { defaultIds, callAllEventHandlers } from './utils'

const useDownshiftSingleSelection = (props) => {
  const {
    labelId,
    triggerButtonId,
  } = props
  const {
    toggleMenu,
    closeMenu,
    isOpen,
    getLabelProps,
    getMenuProps: baseGetMenuProps,
    menuRef,
    highlightedIndex,
    getItemNavigationKeyDownHandler,
    getItemProps,
  } = useDownshiftAbstract(props)

  // refs
  const isInitialMount = useRef(true)
  const triggerButtonRef = useRef(null)

  // handlers
  const handleTriggerButtonClick = () => {
    toggleMenu()
  }

  const handleTriggerButtonKeyDown = (e) => {
    if (keyboardKey.getCode(e) === keyboardKey.Escape) {
      closeMenu()
      triggerButtonRef.current.focus()
    }
  }

  // focus list but not on firs render.
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else if (isOpen) {
      menuRef.current.focus()
    }
  }, [isOpen])

  // returns
  const getTriggerButtonProps = ({
    onClick,
  } = {}) => {
    const triggerButtonEventHandlers = {
      onClick: callAllEventHandlers(onClick, handleTriggerButtonClick),
    }
    return {
      ref: triggerButtonRef,
      'aria-haspopup': 'listbox',
      'aria-expanded': isOpen,
      'aria-labelledby': `${labelId || defaultIds.label} ${triggerButtonId || defaultIds.triggerButton}`,
      ...triggerButtonEventHandlers,
    }
  }

  const getMenuProps = ({
    onKeyDown,
  } = {}) => {
    const menuEventHandlers = {
      onKeyDown: callAllEventHandlers(
        onKeyDown,
        handleTriggerButtonKeyDown,
        getItemNavigationKeyDownHandler,
      ),
    }
    return {
      tabIndex: -1,
      ...baseGetMenuProps(),
      ...menuEventHandlers,
    }
  }

  return {
    toggleMenu,
    isOpen,
    getTriggerButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  }
}

export default useDownshiftSingleSelection
