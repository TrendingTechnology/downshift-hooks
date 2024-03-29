import * as keyboardKey from 'keyboard-key'
import {fireEvent, cleanup} from '@testing-library/react'
import scrollIntoView from 'scroll-into-view-if-needed'
import {act} from '@testing-library/react-hooks'
import {noop} from '../../utils'
import {setup, dataTestIds, options, setupHook, defaultIds} from '../testUtils'

jest.mock('scroll-into-view-if-needed', () => {
  return jest.fn()
})

describe('getItemProps', () => {
  afterEach(cleanup)

  test('throws error if no index or item has been passed', () => {
    const {result} = setupHook()
    let called = false
    try {
      result.current.getItemProps()
    } catch (error) {
      expect(error.message).toEqual(
        'Pass either item or item index in getItemProps!',
      )
      called = true
    }

    expect(called).toBe(true)
  })

  describe('hook props', () => {
    test("assign 'option' to role", () => {
      const {result} = setupHook()
      const itemProps = result.current.getItemProps({index: 0})

      expect(itemProps.role).toEqual('option')
    })

    test('assign default value to id', () => {
      const {result} = setupHook()
      const itemProps = result.current.getItemProps({index: 0})

      expect(itemProps.id).toEqual(`${defaultIds.itemId(0)}`)
    })

    test('assign custom value passed by user to id', () => {
      const itemId = index => `my-custom-item-id-${index}`
      const {result} = setupHook({itemId})
      const itemProps = result.current.getItemProps({index: 0})

      expect(itemProps.id).toEqual(itemId(0))
    })

    test("assign 'true' to aria-selected if item is highlighted", () => {
      const {result} = setupHook({highlightedIndex: 2})
      const itemProps = result.current.getItemProps({index: 2})

      expect(itemProps['aria-selected']).toEqual(true)
    })

    test('do not assign aria-selected if item is not highlighted', () => {
      const {result} = setupHook({highlightedIndex: 1})
      const itemProps = result.current.getItemProps({index: 2})

      expect(itemProps['aria-selected']).toBeUndefined()
    })
  })

  describe('user props', () => {
    test('are passed down', () => {
      const {result} = setupHook()

      expect(
        result.current.getItemProps({index: 0, foo: 'bar'}),
      ).toHaveProperty('foo', 'bar')
    })

    test('event handler onClick is called along with downshift handler', () => {
      const userOnClick = jest.fn()
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        const {ref: itemRef, onClick} = result.current.getItemProps({
          index: 0,
          onClick: userOnClick,
        })

        menuRef({focus: noop})
        itemRef({})
        result.current.toggleMenu()
        onClick({})
      })

      expect(userOnClick).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedItem).not.toBeNull()
    })

    test('event handler onMouseOver is called along with downshift handler', () => {
      const userOnMouseOver = jest.fn()
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        const {ref: itemRef, onMouseOver} = result.current.getItemProps({
          index: 1,
          onMouseOver: userOnMouseOver,
        })

        menuRef({focus: noop})
        itemRef({})
        result.current.toggleMenu()
        onMouseOver({})
      })

      expect(userOnMouseOver).toHaveBeenCalledTimes(1)
      expect(result.current.highlightedIndex).toBe(1)
    })

    test("event handler onClick is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnClick = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        const {ref: itemRef, onClick} = result.current.getItemProps({
          index: 0,
          onClick: userOnClick,
        })

        menuRef({focus: noop})
        itemRef({})
        result.current.toggleMenu()
        onClick({})
      })

      expect(userOnClick).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedItem).toBeNull()
    })

    test("event handler onMouseOver is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnMouseOver = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        const {ref: itemRef, onMouseOver} = result.current.getItemProps({
          index: 1,
          onMouseOver: userOnMouseOver,
        })

        menuRef({focus: noop})
        itemRef({})
        result.current.toggleMenu()
        onMouseOver({})
      })

      expect(userOnMouseOver).toHaveBeenCalledTimes(1)
      expect(result.current.highlightedIndex).toBe(-1)
    })
  })

  describe('event handlers', () => {
    describe('on mouse over', () => {
      test('it highlights the item', () => {
        const index = 1
        const wrapper = setup({isOpen: true})
        const item = wrapper.getByTestId(dataTestIds.item(index))
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.mouseOver(item)

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.itemId(index),
        )
        expect(item.getAttribute('aria-selected')).toBe('true')
      })

      test('it removes highlight from the previously highlighted item', () => {
        const index = 1
        const previousIndex = 2
        const wrapper = setup({
          isOpen: true,
          initialHighlightedIndex: previousIndex,
        })
        const item = wrapper.getByTestId(dataTestIds.item(index))
        const previousItem = wrapper.getByTestId(
          dataTestIds.item(previousIndex),
        )
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.mouseOver(item)

        expect(menu.getAttribute('aria-activedescendant')).not.toBe(
          defaultIds.itemId(previousIndex),
        )
        expect(previousItem.getAttribute('aria-selected')).toBeNull()
      })
    })

    describe('on click', () => {
      test('it selects the item', () => {
        const index = 1
        const wrapper = setup({initialIsOpen: true})
        const item = wrapper.getByTestId(dataTestIds.item(index))
        const menu = wrapper.getByTestId(dataTestIds.menu)
        const toggleButton = wrapper.getByTestId(dataTestIds.toggleButton)

        fireEvent.click(item)

        expect(menu.childNodes).toHaveLength(0)
        expect(toggleButton.textContent).toEqual(options[index])
      })

      test('it selects the item and resets to user defined defaults', () => {
        const index = 1
        const wrapper = setup({defaultIsOpen: true, defaultHighlightedIndex: 2})
        const item = wrapper.getByTestId(dataTestIds.item(index))
        const menu = wrapper.getByTestId(dataTestIds.menu)
        const toggleButton = wrapper.getByTestId(dataTestIds.toggleButton)

        fireEvent.click(item)

        expect(toggleButton.textContent).toEqual(options[index])
        expect(menu.childNodes).toHaveLength(options.length)
        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.itemId(2),
        )
      })
    })
  })

  describe('scrolling', () => {
    test('is performed by the menu to the item if highlighted and not 100% visible', () => {
      scrollIntoView.mockClear()

      const wrapper = setup({initialIsOpen: true})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      fireEvent.keyDown(menu, {keyCode: keyboardKey.End})
      expect(scrollIntoView).toHaveBeenCalledTimes(1)
    })
  })
})
