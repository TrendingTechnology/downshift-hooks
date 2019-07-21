import * as keyboardKey from 'keyboard-key'
import {fireEvent, cleanup} from '@testing-library/react'
import {setup, dataTestIds, options, setupHook} from '../testUtils'
import {getDefaultIds} from '../../utils'
import {actionTypes} from '../utils'

describe('props', () => {
  let defaultIds

  beforeEach(() => {
    defaultIds = getDefaultIds(false)
  })

  afterEach(cleanup)

  describe('items', () => {
    test('if not passed an error will be thrown', () => {
      const {result} = setupHook({items: undefined})
      expect(result.error.message).toEqual(
        'Pass dropdown items as hook parameter!',
      )
    })

    test('if passed as empty then menu will not open', () => {
      const wrapper = setup({items: [], isOpen: true})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      expect(menu.childNodes).toHaveLength(0)
    })
  })

  describe('itemToString', () => {
    jest.useFakeTimers()

    afterEach(() => {
      jest.runAllTimers()
    })

    test('should provide string version to a11y status message', () => {
      const wrapper = setup({
        itemToString: () => 'custom-item',
        initialIsOpen: true,
      })
      const item = wrapper.getByTestId(dataTestIds.item(0))

      fireEvent.click(item)

      expect(document.getElementById('a11y-status-message').textContent).toBe(
        'custom-item has been selected.',
      )
    })
  })

  describe('highlightedIndex', () => {
    test('controls the state property if passed', () => {
      const highlightedIndex = 1
      const wrapper = setup({isOpen: true, highlightedIndex})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      expect(menu.getAttribute('aria-activedescendant')).toBe(
        defaultIds.item(highlightedIndex),
      )

      fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowDown})
      expect(menu.getAttribute('aria-activedescendant')).toBe(
        defaultIds.item(highlightedIndex),
      )

      fireEvent.keyDown(menu, {keyCode: keyboardKey.End})
      expect(menu.getAttribute('aria-activedescendant')).toBe(
        defaultIds.item(highlightedIndex),
      )

      fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowUp})
      expect(menu.getAttribute('aria-activedescendant')).toBe(
        defaultIds.item(highlightedIndex),
      )

      fireEvent.keyDown(menu, {key: 'c'})
      expect(menu.getAttribute('aria-activedescendant')).toBe(
        defaultIds.item(highlightedIndex),
      )
    })
  })

  describe('isOpen', () => {
    test('controls the state property if passed', () => {
      const wrapper = setup({isOpen: true})
      const menu = wrapper.getByTestId(dataTestIds.menu)
      const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

      expect(menu.childNodes).toHaveLength(options.length)

      fireEvent.click(triggerButton)
      expect(menu.childNodes).toHaveLength(options.length)

      expect(menu.childNodes).toHaveLength(options.length)

      fireEvent.blur(menu)
      expect(menu.childNodes).toHaveLength(options.length)
    })
  })

  describe('selectedItem', () => {
    test('controls the state property if passed', () => {
      const selectedItem = options[2]
      const wrapper = setup({selectedItem, initialIsOpen: true})
      const menu = wrapper.getByTestId(dataTestIds.menu)
      const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
      const item = wrapper.getByTestId(dataTestIds.item(3))

      expect(triggerButton.textContent).toEqual(options[2])

      fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowDown})
      fireEvent.keyDown(menu, {keyCode: keyboardKey.Enter})

      expect(triggerButton.textContent).toEqual(options[2])

      fireEvent.click(triggerButton)
      fireEvent.click(item)
      expect(triggerButton.textContent).toEqual(options[2])
    })
  })

  describe('stateReducer', () => {
    test('is called at each state change', () => {
      const stateReducer = jest.fn((s, a) => a.changes)
      const wrapper = setup({stateReducer})
      const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
      const menu = wrapper.getByTestId(dataTestIds.menu)

      expect(stateReducer).not.toHaveBeenCalled()

      fireEvent.click(triggerButton)
      expect(stateReducer).toHaveBeenCalledTimes(2)

      fireEvent.keyDown(menu, {key: 'c'})
      expect(stateReducer).toHaveBeenCalledTimes(3)

      fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowUp})
      expect(stateReducer).toHaveBeenCalledTimes(4)

      fireEvent.click(triggerButton)
      expect(stateReducer).toHaveBeenCalledTimes(5)
    })

    test('replaces prop values with user defined', () => {
      const highlightedIndex = 2
      const stateReducer = jest.fn((s, a) => {
        const changes = a.changes
        changes.highlightedIndex = highlightedIndex
        return changes
      })
      const wrapper = setup({stateReducer})
      const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
      const menu = wrapper.getByTestId(dataTestIds.menu)

      fireEvent.click(triggerButton)
      expect(menu.getAttribute('aria-activedescendant')).toBe(
        defaultIds.item(highlightedIndex),
      )
    })

    test('receives a downshift action type', () => {
      const stateReducer = jest.fn((s, a) => {
        expect(actionTypes).toHaveProperty(a.type)
        return a.changes
      })
      const wrapper = setup({stateReducer})
      const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

      fireEvent.click(triggerButton)
    })

    test('receives state, changes and type', () => {
      const stateReducer = jest.fn((s, a) => {
        expect(a.type).not.toBeUndefined()
        expect(a.type).not.toBeNull()

        expect(s).not.toBeUndefined()
        expect(s).not.toBeNull()

        expect(a.changes).not.toBeUndefined()
        expect(a.changes).not.toBeNull()

        return a.changes
      })
      const wrapper = setup({stateReducer})
      const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

      fireEvent.click(triggerButton)
    })
  })

  describe('onSelectedItemChange', () => {
    test('is called at each selectedItem change', () => {
      const onSelectedItemChange = jest.fn()
      const wrapper = setup({initialIsOpen: true, onSelectedItemChange})
      const item = wrapper.getByTestId(dataTestIds.item(0))

      fireEvent.click(item)
      expect(onSelectedItemChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedItem: options[0],
        }),
      )
    })
  })

  describe('onHighlightedIndexChange', () => {
    test('is called at each highlightedIndex change', () => {
      const onHighlightedIndexChange = jest.fn()
      const wrapper = setup({initialIsOpen: true, onHighlightedIndexChange})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowDown})
      expect(onHighlightedIndexChange).toHaveBeenCalledWith(
        expect.objectContaining({
          highlightedIndex: 0,
        }),
      )
    })
  })

  describe('onIsOpenChange', () => {
    test('is called at each isOpen change', () => {
      const onIsOpenChange = jest.fn()
      const wrapper = setup({initialIsOpen: true, onIsOpenChange})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      fireEvent.keyDown(menu, {keyCode: keyboardKey.Escape})
      expect(onIsOpenChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: false,
        }),
      )
    })
  })

  describe('onStateChange', () => {
    test('is called at each state property change', () => {
      const onStateChange = jest.fn()
      const wrapper = setup({onStateChange})
      const menu = wrapper.getByTestId(dataTestIds.menu)
      const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

      fireEvent.click(triggerButton)
      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
        }),
      )

      fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowDown})
      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          highlightedIndex: 0,
        }),
      )

      const item = wrapper.getByTestId(dataTestIds.item(0))
      fireEvent.click(item)
      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedItem: options[0],
        }),
      )
    })
  })
})
