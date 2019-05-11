const actionTypes = {
  KeyDownArrowDown: 'KeyDownArrowDown',
  KeyDownArrowUp: 'KeyDownArrowUp',
  TriggerClick: 'TriggerClick',
}

const id = 'downshift'

const defaultIds = {
  label: `${id}-label`,
  item: `${id}-item`,
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

export {
  actionTypes,
  id,
  defaultIds,
  callAllEventHandlers,
}
