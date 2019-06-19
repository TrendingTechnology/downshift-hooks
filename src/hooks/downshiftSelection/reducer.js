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

  switch (type) {
    case actionTypes.ItemHover:
      return {
        ...state,
        highlightedIndex: action.index,
      }
    case actionTypes.ItemClick:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        selectedItem: props.items[action.index],
      }
    case actionTypes.MenuBlur:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        ...(state.highlightedIndex >= 0 && {
          selectedItem: props.items[state.highlightedIndex],
        }),
      }
    case actionTypes.MenuKeyDownArrowDown:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? 5 : 1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      }
    case actionTypes.MenuKeyDownArrowUp:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? -5 : -1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      }
    case actionTypes.MenuKeyDownHome:
      return {
        ...state,
        highlightedIndex: 0,
      }
    case actionTypes.MenuKeyDownEnd:
      return {
        ...state,
        highlightedIndex: props.items.length - 1,
      }
    case actionTypes.MenuKeyDownEscape:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
      }
    case actionTypes.MenuKeyDownEnter:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        selectedItem: props.items[state.highlightedIndex],
      }
    case actionTypes.MenuKeyDownCharacter: {
      const lowercasedKey = action.key
      const keysSoFar = `${state.keysSoFar}${lowercasedKey}`
      const highlightedIndex = getItemIndexByCharacterKey(
        keysSoFar,
        state.highlightedIndex,
        props.items,
        props.itemToString,
      )
      return {
        ...state,
        keysSoFar,
        ...(highlightedIndex >= 0 && {
          highlightedIndex,
        }),
      }
    }
    case actionTypes.TriggerButtonKeyDownArrowDown: {
      return {
        ...state,
        isOpen: true,
        highlightedIndex: getHighlightedIndexOnOpen(props, state, 1),
      }
    }
    case actionTypes.TriggerButtonKeyDownArrowUp:
      return {
        ...state,
        isOpen: true,
        highlightedIndex: getHighlightedIndexOnOpen(props, state, -1),
      }
    case actionTypes.TriggerButtonClick:
    case actionTypes.FunctionToggleMenu:
      return {
        ...state,
        isOpen: !state.isOpen,
        highlightedIndex: !state.isOpen ? getHighlightedIndexOnOpen(props, state, 0) : -1,
      }
    case actionTypes.FunctionOpenMenu:
      return {
        ...state,
        isOpen: true,
      }
    case actionTypes.FunctionCloseMenu:
      return {
        ...state,
        isOpen: false,
      }
    case actionTypes.FunctionSetHighlightedIndex:
      return {
        ...state,
        highlightedIndex: action.highlightedIndex,
      }
    case actionTypes.FunctionSetSelectedItem:
      return {
        ...state,
        selectedItem: action.selectedItem,
      }
    case actionTypes.FunctionClearKeysSoFar:
      return {
        ...state,
        keysSoFar: '',
      }
    default:
      throw new Error();
  }
}
