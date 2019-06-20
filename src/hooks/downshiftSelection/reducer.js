import {
  getNextWrappingIndex,
  getItemIndexByCharacterKey,
} from '../../utils'
import {
  actionTypes,
  getHighlightedIndexOnOpen,
} from './utils'

export default function downshiftSelectionReducer(state, action) {
  const {
    type,
    props,
    shiftKey,
  } = action
  let changes

  switch (type) {
    case actionTypes.ItemHover:
      changes = {
        highlightedIndex: action.index,
      }
      break
    case actionTypes.ItemClick:
      changes = {
        isOpen: false,
        highlightedIndex: -1,
        selectedItem: props.items[action.index],
      }
      break
    case actionTypes.MenuBlur:
      changes = {
        isOpen: false,
        highlightedIndex: -1,
        ...(state.highlightedIndex >= 0 && {
          selectedItem: props.items[state.highlightedIndex],
        }),
      }
      break
    case actionTypes.MenuKeyDownArrowDown:
      changes = {
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? 5 : 1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      }
      break
    case actionTypes.MenuKeyDownArrowUp:
      changes = {
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? -5 : -1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      }
      break
    case actionTypes.MenuKeyDownHome:
      changes = {
        highlightedIndex: 0,
      }
      break
    case actionTypes.MenuKeyDownEnd:
      changes = {
        highlightedIndex: props.items.length - 1,
      }
      break
    case actionTypes.MenuKeyDownEscape:
      changes = {
        isOpen: false,
        highlightedIndex: -1,
      }
      break
    case actionTypes.MenuKeyDownEnter:
      changes = {
        isOpen: false,
        highlightedIndex: -1,
        selectedItem: props.items[state.highlightedIndex],
      }
      break
    case actionTypes.MenuKeyDownCharacter: {
      const lowercasedKey = action.key
      const keysSoFar = `${state.keysSoFar}${lowercasedKey}`
      const highlightedIndex = getItemIndexByCharacterKey(
        keysSoFar,
        state.highlightedIndex,
        props.items,
        props.itemToString,
      )
      changes = {
        keysSoFar,
        ...(highlightedIndex >= 0 && {
          highlightedIndex,
        }),
      }
    }
      break
    case actionTypes.TriggerButtonKeyDownArrowDown: {
      changes = {
        isOpen: true,
        highlightedIndex: getHighlightedIndexOnOpen(props, state, 1),
      }
    }
      break
    case actionTypes.TriggerButtonKeyDownArrowUp:
      changes = {
        isOpen: true,
        highlightedIndex: getHighlightedIndexOnOpen(props, state, -1),
      }
      break
    case actionTypes.TriggerButtonClick:
    case actionTypes.FunctionToggleMenu:
      changes = {
        isOpen: !state.isOpen,
        highlightedIndex: !state.isOpen ? getHighlightedIndexOnOpen(props, state, 0) : -1,
      }
      break
    case actionTypes.FunctionOpenMenu:
      changes = {
        isOpen: true,
      }
      break
    case actionTypes.FunctionCloseMenu:
      changes = {
        isOpen: false,
      }
      break
    case actionTypes.FunctionSetHighlightedIndex:
      changes = {
        highlightedIndex: action.highlightedIndex,
      }
      break
    case actionTypes.FunctionSetSelectedItem:
      changes = {
        selectedItem: action.selectedItem,
      }
      break
    case actionTypes.FunctionClearKeysSoFar:
      changes = {
        keysSoFar: '',
      }
      break
    default:
      throw new Error();
  }

  if (props.onOpenChange && changes.isOpen) {
    props.onOpenChange(changes)
  }
  if (props.onHighlightedIndexChange && changes.highlightedIndex) {
    props.onHighlightedIndexChange(changes)
  }
  if (props.onSelectedItemChange && changes.selectedItem) {
    props.onSelectedItemChange(changes)
  }
  if (props.onStateChange && changes) {
    props.onStateChange(changes)
  }

  return {
    ...state,
    ...changes,
  }
}
