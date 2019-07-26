import {getNextWrappingIndex} from '../utils'

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
  FunctionClearKeysSoFar: 'FunctionClearKeysSoFar',
  FunctionReset: 'FunctionReset',
}

const defaultStateValues = {
  highlightedIndex: -1,
  isOpen: false,
  selectedItem: null,
}

function getA11yStatusMessage({isOpen, selectedItem, items, itemToString}) {
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
    return `${resultCount} result${
      resultCount === 1 ? ' is' : 's are'
    } available, use up and down arrow keys to navigate. Press Enter key to select.`
  }
  return ''
}

const getHighlightedIndexOnOpen = (props, state, offset) => {
  const {items, initialHighlightedIndex, defaultHighlightedIndex} = props
  const {selectedItem, highlightedIndex} = state

  // initialHighlightedIndex will give value to highlightedIndex on initial state only.
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
    return getNextWrappingIndex(
      offset,
      items.indexOf(selectedItem),
      items.length,
      false,
    )
  }
  if (offset === 0) {
    return -1
  }
  return offset < 0 ? items.length - 1 : 0
}

const getInitialValue = (props, propKey) => {
  if (props[propKey] !== undefined) {
    return props[propKey]
  }
  const initialPropKey = `initial${propKey
    .slice(0, 1)
    .toUpperCase()}${propKey.slice(1)}`
  if (props[initialPropKey] !== undefined) {
    return props[initialPropKey]
  }
  const defaultPropKey = `default${propKey
    .slice(0, 1)
    .toUpperCase()}${propKey.slice(1)}`
  if (props[defaultPropKey] !== undefined) {
    return props[defaultPropKey]
  }
  return defaultStateValues[propKey]
}

const getInitialState = props => ({
  highlightedIndex: getInitialValue(props, 'highlightedIndex'),
  isOpen: getInitialValue(props, 'isOpen'),
  selectedItem: getInitialValue(props, 'selectedItem'),
  keysSoFar: '',
})

export {
  getHighlightedIndexOnOpen,
  getA11yStatusMessage,
  getInitialState,
  actionTypes,
  defaultStateValues,
}
