import * as _ from 'lodash'

const singleSelectActionTypes = {
  MenuKeyDownArrowDown: 'KeyDownArrowDown',
  MenuKeyDownArrowUp: 'KeyDownArrowUp',
  MenuKeyDownEnd: 'keyDownEnd',
  MenuKeyDownHome: 'keyDownHome',
  MenuKeyDownEscape: 'keyDownEscape',
  TriggerButtonClick: 'TriggerButtonClick',
  TriggerButtonKeyDownArrowDown: 'TriggerButtonKeyDownArrowDown',
  TriggerButtonKeyDownArrowUp: 'TriggerButtonKeyDownArrowUp',
  FunctionToggleMenu: 'ToggleMenu',
  FunctionOpenMenu: 'OpenMenu',
  FunctionCloseMenu: 'CloseMenu',
}

const id = 'downshift'

const defaultIds = {
  label: `${id}-label`,
  menu: `${id}-menu`,
  item: index => `${id}-item-${index}`,
  triggerButton: `${id}-triggerButton`,
}

/**
 * This is intended to be used to compose event handlers.
 * They are executed in order until one of them sets
 * `event.preventDownshiftDefault = true`.
 * @param {...Function} fns the event handler functions
 * @return {Function} the event handler to add to an element
 */
function callAllEventHandlers(...fns) {
  return (event, ...args) => fns.some((fn) => {
    if (fn) {
      fn(event, ...args)
    }
    return (
      event.preventDownshiftDefault
      || (
        Object.prototype.hasOwnProperty.call(event, 'nativeEvent')
        && event.nativeEvent.preventDownshiftDefault
      )
    )
  })
}

function getNextWrappingIndex(moveAmount, baseIndex, itemsLength) {
  if (baseIndex === -1) {
    return moveAmount > 0 ? 0 : itemsLength - 1
  }
  const nextIndex = baseIndex + moveAmount

  if (nextIndex < 0) {
    return itemsLength - 1
  }
  if (nextIndex >= itemsLength) {
    return 0
  }

  return nextIndex
}

export {
  singleSelectActionTypes,
  id,
  defaultIds,
  callAllEventHandlers,
  getNextWrappingIndex,
}
