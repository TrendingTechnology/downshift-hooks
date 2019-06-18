import {
  actionTypes,
  getNextWrappingIndex,
  getItemIndexByCharacterKey,
} from '../../utils'

export default function downshiftSelectionReducer(state, action) {
  const {
    type,
    props,
    shiftKey,
  } = action

  switch (type) {
    case actionTypes.SingleSelect.ItemHover:
      return {
        ...state,
        highlightedIndex: action.index,
      }
    case actionTypes.SingleSelect.ItemClick:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        selectedItem: props.items[action.index],
      }
    case actionTypes.SingleSelect.MenuBlur:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        ...(state.highlightedIndex >= 0 && {
          selectedItem: props.items[state.highlightedIndex],
        }),
      }
    case actionTypes.SingleSelect.MenuKeyDownArrowDown:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? 5 : 1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      }
    case actionTypes.SingleSelect.MenuKeyDownArrowUp:
      return {
        ...state,
        highlightedIndex: getNextWrappingIndex(
          shiftKey ? -5 : -1,
          state.highlightedIndex,
          props.items.length,
          props.circularNavigation,
        ),
      }
    case actionTypes.SingleSelect.MenuKeyDownHome:
      return {
        ...state,
        highlightedIndex: 0,
      }
    case actionTypes.SingleSelect.MenuKeyDownEnd:
      return {
        ...state,
        highlightedIndex: props.items.length - 1,
      }
    case actionTypes.SingleSelect.MenuKeyDownEscape:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
      }
    case actionTypes.SingleSelect.MenuKeyDownEnter:
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        selectedItem: props.items[state.highlightedIndex],
      }
    case actionTypes.SingleSelect.MenuKeyDownCharacter: {
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
    case actionTypes.SingleSelect.TriggerButtonKeyDownArrowDown:
      return {
        ...state,
        isOpen: true,
        highlightedIndex: state.selectedItem
          ? getNextWrappingIndex(
            1,
            props.items.indexOf(state.selectedItem),
            props.items.length,
            false,
          )
          : 0,
      }
    case actionTypes.SingleSelect.TriggerButtonKeyDownArrowUp:
      return {
        ...state,
        isOpen: true,
        highlightedIndex: state.selectedItem
          ? getNextWrappingIndex(
            -1,
            props.items.indexOf(state.selectedItem),
            props.items.length,
            false,
          )
          : props.items.length - 1,
      }
    case actionTypes.SingleSelect.TriggerButtonClick:
    case actionTypes.SingleSelect.FunctionToggleMenu:
      return {
        ...state,
        isOpen: !state.isOpen,
        highlightedIndex: (state.selectedItem && !state.isOpen)
          ? props.items.indexOf(state.selectedItem)
          : -1,
      }
    case actionTypes.SingleSelect.FunctionOpenMenu:
      return {
        ...state,
        isOpen: true,
      }
    case actionTypes.SingleSelect.FunctionCloseMenu:
      return {
        ...state,
        isOpen: false,
      }
    case actionTypes.SingleSelect.FunctionSetHighlightedIndex:
      return {
        ...state,
        highlightedIndex: action.highlightedIndex,
      }
    case actionTypes.SingleSelect.FunctionSetSelectedItem:
      return {
        ...state,
        selectedItem: action.selectedItem,
      }
    case actionTypes.SingleSelect.FunctionClearKeysSoFar:
      return {
        ...state,
        keysSoFar: '',
      }
    default:
      throw new Error();
  }
}
