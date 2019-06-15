import * as _ from 'lodash'

import setAriaLiveMessage from './ariaLiveMessage'

const actionTypes = {
  SingleSelect: {
    MenuKeyDownArrowDown: 'MenuKeyDownArrowDown',
    MenuKeyDownArrowUp: 'MenuKeyDownArrowUp',
    MenuKeyDownEscape: 'MenuKeyDownEscape',
    MenuKeyDownHome: 'MenuKeyDownHome',
    MenuKeyDownEnd: 'MenuKeyDownEnd',
    MenuKeyDownEnter: 'MenuKeyDownEnter',
    MenuKeyDownCharacter: 'MenuKeyDownCharacter',
    MenuBlur: 'MenuBlur',
    ItemHover: 'ItemHover',
    ItemClick: 'ItemClick',
    TriggerButtonKeyDownArrowDown: 'TriggerButtonKeyDownArrowDown',
    TriggerButtonKeyDownArrowUp: 'TriggerButtonKeyDownArrowUp',
    TriggerButtonClick: 'TriggerButtonClick',
    FunctionToggleMenu: 'FunctionToggleMenu',
    FunctionOpenMenu: 'FunctionOpenMenu',
    FunctionCloseMenu: 'FunctionCloseMenu',
    FunctionSetHighlightedIndex: 'FunctionSetHighlightedIndex',
    FunctionSetSelectedItem: 'FunctionSetSelectedItem',
    FunctionClearKeysSoFar: ' FunctionClearKeysSoFar',
  },
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

function getNextWrappingIndex(moveAmount, baseIndex, itemsLength, circular) {
  if (baseIndex === -1) {
    if (!circular) {
      return 0
    }
    return moveAmount > 0 ? 0 : itemsLength - 1
  }
  const nextIndex = baseIndex + moveAmount

  if (nextIndex < 0) {
    return circular ? itemsLength - 1 : 0
  }
  if (nextIndex >= itemsLength) {
    return circular ? 0 : itemsLength - 1
  }

  return nextIndex
}

function getItemIndexByCharacterKey(
  keysSoFar,
  highlightedIndex,
  items,
  itemToString,
) {
  let newHighlightedIndex = -1
  const itemStrings = items.map(item => itemToString(item).toLowerCase())

  if (highlightedIndex > -1) {
    newHighlightedIndex = _.findIndex(
      itemStrings,
      itemString => itemString.startsWith(keysSoFar),
      highlightedIndex + (keysSoFar > 1 ? 0 : 1),
    )
  }

  if (newHighlightedIndex === -1) {
    newHighlightedIndex = _.findIndex(
      itemStrings,
      itemString => itemString.startsWith(keysSoFar),
    )
  }

  return newHighlightedIndex
}

export {
  actionTypes,
  id,
  defaultIds,
  callAllEventHandlers,
  getNextWrappingIndex,
  getItemIndexByCharacterKey,
  setAriaLiveMessage,
}