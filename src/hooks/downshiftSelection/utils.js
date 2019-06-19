import {
  getNextWrappingIndex,
} from '../../utils'

const actionTypes = {
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
}

function getA11yStatusMessage({
  isOpen,
  selectedItem,
  items,
  itemToString,
}) {
  if (selectedItem) {
    return `${itemToString(selectedItem)} has been selected.`
  }
  if (!items) {
    return ''
  }
  const resultCount = items.length
  if (isOpen) {
    if (resultCount === 0) {
      return 'No results are available'
    }
    return `${resultCount} result${resultCount === 1
      ? ' is'
      : 's are'}
       available, use up and down arrow keys to navigate. Press Enter key to select.`
  }
  return ''
}

const getHighlightedIndexOnOpen = (props, state, offset) => {
  const { items, initialHighlightedIndex, defaultHighlightedIndex } = props
  const { selectedItem, highlightedIndex } = state

  if (initialHighlightedIndex && highlightedIndex > -1) {
    return initialHighlightedIndex
  }
  if (defaultHighlightedIndex) {
    return defaultHighlightedIndex
  }
  if (selectedItem) {
    if (offset === 0) {
      return items.indexOf(selectedItem)
    }
    return getNextWrappingIndex(offset, items.indexOf(selectedItem), items.length, false)
  }
  if (offset === 0) {
    return -1
  }
  return offset < 0 ? items.length - 1 : 0
}

export {
  getHighlightedIndexOnOpen,
  getA11yStatusMessage,
  actionTypes,
}
