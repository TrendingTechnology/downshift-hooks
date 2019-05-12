import * as _ from 'lodash'

const actionTypes = {
  KeyDownArrowDown: 'KeyDownArrowDown',
  KeyDownArrowUp: 'KeyDownArrowUp',
  keyDownEnd: 'keyDownEnd',
  keyDownHome: 'keyDownHome',
  ToggleMenu: 'ToggleMenu',
  OpenMenu: 'OpenMenu',
  CloseMenu: 'CloseMenu',
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

const getNextHighlightedIndexOnArrowDown = (highlightedIndex, itemsLength, shiftKeyModifier) => {
  if (_.isNumber(highlightedIndex)) {
    const newHighlightedIndex = highlightedIndex + (shiftKeyModifier ? 5 : 1)
    if (newHighlightedIndex >= itemsLength) {
      return 0
    }
    return newHighlightedIndex
  }
  return 0
}

const getNextHighlightedIndexOnArrowUp = (highlightedIndex, itemsLength, shiftKeyModifier) => {
  if (_.isNumber(highlightedIndex)) {
    const newHighlightedIndex = highlightedIndex - (shiftKeyModifier ? 5 : 1)
    if (newHighlightedIndex < 0) {
      return itemsLength - 1
    }
    return newHighlightedIndex
  }
  return 0
}

export {
  actionTypes,
  id,
  defaultIds,
  callAllEventHandlers,
  getNextHighlightedIndexOnArrowDown,
  getNextHighlightedIndexOnArrowUp,
}
