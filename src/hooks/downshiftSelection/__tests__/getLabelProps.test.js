import {cleanup} from '@testing-library/react'
import {setupHook} from '../testUtils'
import {getDefaultIds} from '../../utils'

describe('getLabelProps', () => {
  let defaultIds

  beforeEach(() => {
    defaultIds = getDefaultIds(false)
  })

  afterEach(cleanup)

  test('should have a default id assigned', () => {
    const {result} = setupHook()
    const labelProps = result.current.getLabelProps()

    expect(labelProps.id).toEqual(defaultIds.label)
  })

  test('should have custom id if set by the user', () => {
    const props = {
      labelId: 'my-custom-label-id',
    }
    const {result} = setupHook(props)
    const labelProps = result.current.getLabelProps()

    expect(labelProps.id).toEqual(props.labelId)
  })
})
