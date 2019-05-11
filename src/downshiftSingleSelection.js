import { useRef, useEffect } from 'react'
import useDownshiftAbstract from './downshiftAbstract'
import { defaultIds, callAllEventHandlers } from './utils'

const useDownshiftSingleSelection = (props) => {
  const {
    labelId,
    triggerButtonId,
  } = props
  const {
    toggleMenu,
    isOpen,
    getLabelProps,
    getMenuProps: baseGetMenuProps,
    menuRef,
    highlightedIndex,
    getItemNavigationKeyDownHandler,
    getItemProps,
  } = useDownshiftAbstract(props)
  const isInitialMount = useRef(true);

  const handleTriggerButtonClick = () => {
    toggleMenu()
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else if (isOpen) {
      menuRef.current.focus()
    }
  }, [isOpen])

  const getTriggerButtonProps = ({
    onClick,
  } = {}) => {
    const triggerButtonEventHandlers = {
      onClick: callAllEventHandlers(onClick, handleTriggerButtonClick),
    }
    return {
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
      onKeyDown: callAllEventHandlers(onKeyDown, getItemNavigationKeyDownHandler),
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
