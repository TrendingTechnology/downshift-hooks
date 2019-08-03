import useDownshiftSelection from './hooks/downshiftSelection'
import {stateChangeTypes as selectionStateChangeTypes} from './hooks/downshiftSelection/utils'

const stateChangeTypes = {
  selection: selectionStateChangeTypes,
}

export {useDownshiftSelection, stateChangeTypes}
