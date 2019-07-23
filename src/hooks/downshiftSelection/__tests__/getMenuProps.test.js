/* eslint-disable jest/no-disabled-tests */
import * as keyboardKey from 'keyboard-key'
import {act} from '@testing-library/react-hooks'
import {fireEvent, cleanup} from '@testing-library/react'
import {getDefaultIds, noop} from '../../utils'
import {setup, dataTestIds, options, setupHook, getId} from '../testUtils'

describe('getMenuProps', () => {
  let defaultIds

  beforeEach(() => {
    defaultIds = getDefaultIds(getId())
  })

  afterEach(cleanup)

  describe('hook props', () => {
    test('assign default value to aria-labelledby', () => {
      const {result} = setupHook()
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-labelledby']).toEqual(`${defaultIds.label}`)
    })

    test('assign custom value passed by user to aria-labelledby', () => {
      const props = {
        labelId: 'my-custom-label-id',
      }
      const {result} = setupHook(props)
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-labelledby']).toEqual(`${props.labelId}`)
    })

    test('assign default value to id', () => {
      const {result} = setupHook()
      const menuProps = result.current.getMenuProps()

      expect(menuProps.id).toEqual(`${defaultIds.menu}`)
    })

    test('assign custom value passed by user to id', () => {
      const props = {
        menuId: 'my-custom-menu-id',
      }
      const {result} = setupHook(props)
      const menuProps = result.current.getMenuProps()

      expect(menuProps.id).toEqual(`${props.menuId}`)
    })

    test("assign 'listbox' to role", () => {
      const {result} = setupHook()
      const menuProps = result.current.getMenuProps()

      expect(menuProps.role).toEqual('listbox')
    })

    test("assign '-1' to tabindex", () => {
      const {result} = setupHook()
      const menuProps = result.current.getMenuProps()

      expect(menuProps.tabIndex).toEqual(-1)
    })

    test('assign id of highlighted item to aria-activedescendant if item is highlighted', () => {
      const {result} = setupHook({highlightedIndex: 2})
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-activedescendant']).toEqual(defaultIds.item(2))
    })

    test('do not assign aria-activedescendant if no item is highlighted', () => {
      const {result} = setupHook()
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-activedescendant']).toBeUndefined()
    })
  })

  describe('user props', () => {
    test('are passed down', () => {
      const {result} = setupHook()

      expect(result.current.getTriggerButtonProps({foo: 'bar'})).toHaveProperty(
        'foo',
        'bar',
      )
    })

    test('custom ref passed by the user is used', () => {
      const {result} = setupHook()
      const focus = jest.fn()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        menuRef({focus})
        result.current.toggleMenu()
      })

      expect(focus).toHaveBeenCalledTimes(1)
    })

    test('custom ref with custom name passed by the user is used', () => {
      const {result} = setupHook()
      const focus = jest.fn()

      act(() => {
        const {blablaRef} = result.current.getMenuProps({refKey: 'blablaRef'})
        blablaRef({focus})
        result.current.toggleMenu()
      })

      expect(focus).toHaveBeenCalledTimes(1)
    })

    test('event handler onKeyDown is called along with downshift handler', () => {
      const userOnKeyDown = jest.fn()
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef, onKeyDown} = result.current.getMenuProps({
          onKeyDown: userOnKeyDown,
        })

        menuRef({focus: noop})
        result.current.toggleMenu()
        onKeyDown({keyCode: keyboardKey.Escape, preventDefault: noop})
      })

      expect(userOnKeyDown).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(false)
    })

    test('event handler onBlur is called along with downshift handler', () => {
      const userOnBlur = jest.fn()
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef, onBlur} = result.current.getMenuProps({
          onBlur: userOnBlur,
        })

        menuRef({focus: noop})
        result.current.toggleMenu()
        onBlur({})
      })

      expect(userOnBlur).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(false)
    })

    test("event handler onKeyDown is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnKeyDown = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef, onKeyDown} = result.current.getMenuProps({
          onKeyDown: userOnKeyDown,
        })

        menuRef({focus: noop})
        result.current.toggleMenu()
        onKeyDown({keyCode: keyboardKey.Escape, preventDefault: noop})
      })

      expect(userOnKeyDown).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(true)
    })

    test("event handler onBlur is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnBlur = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef, onBlur} = result.current.getMenuProps({
          onBlur: userOnBlur,
        })

        menuRef({focus: noop})
        result.current.toggleMenu()
        onBlur({keyCode: keyboardKey.Escape, preventDefault: noop})
      })

      expect(userOnBlur).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(true)
    })
  })

  describe('initial focus', () => {
    test('is grabbed when isOpen is passed as true', () => {
      const wrapper = setup({isOpen: true})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      expect(document.activeElement).toBe(menu)
    })

    test('is grabbed when initialIsOpen is passed as true', () => {
      const wrapper = setup({initialIsOpen: true})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      expect(document.activeElement).toBe(menu)
    })

    test('is grabbed when defaultIsOpen is passed as true', () => {
      const wrapper = setup({defaultIsOpen: true})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      expect(document.activeElement).toBe(menu)
    })

    test('is not grabbed when initial open is set to default (false)', () => {
      const wrapper = setup({})
      const menu = wrapper.getByTestId(dataTestIds.menu)

      expect(document.activeElement).not.toBe(menu)
    })
  })

  describe('event handlers', () => {
    describe('on key down', () => {
      describe('character key', () => {
        jest.useFakeTimers()

        afterEach(() => {
          jest.runAllTimers()
        })

        const startsWithCharacter = (option, character) => {
          return option.toLowerCase().startsWith(character.toLowerCase())
        }

        test('should highlight the first item that starts with that key', () => {
          const wrapper = setup({isOpen: true})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {key: 'c'})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(
              options.findIndex(option => startsWithCharacter(option, 'c')),
            ),
          )
        })

        test('should highlight the second item that starts with that key after typing it twice', () => {
          const wrapper = setup({isOpen: true})
          const menu = wrapper.getByTestId(dataTestIds.menu)
          const firstIndex = options.findIndex(option =>
            startsWithCharacter(option, 'c'),
          )

          fireEvent.keyDown(menu, {key: 'c'})
          jest.runAllTimers()
          fireEvent.keyDown(menu, {key: 'c'})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(
              firstIndex +
                1 +
                options
                  .slice(firstIndex + 1)
                  .findIndex(option => startsWithCharacter(option, 'c')),
            ),
          )
        })

        test('should highlight the first item again if the options are depleated', () => {
          const wrapper = setup({isOpen: true})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {key: 'b'})
          jest.runAllTimers()
          fireEvent.keyDown(menu, {key: 'b'})
          jest.runAllTimers()
          fireEvent.keyDown(menu, {key: 'b'})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(
              options.findIndex(option => startsWithCharacter(option, 'b')),
            ),
          )
        })

        test('should not highlight anything if no item starts with that key', () => {
          const wrapper = setup({isOpen: true})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {key: 'x'})

          expect(menu.getAttribute('aria-activedescendant')).toBeNull()
        })

        test('should highlight the first item that starts with the keys typed in rapid succession', () => {
          const wrapper = setup({isOpen: true})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {key: 'c'})
          fireEvent.keyDown(menu, {key: 'a'})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(
              options.findIndex(option => startsWithCharacter(option, 'ca')),
            ),
          )
        })

        test('should become first character after timeout passes', () => {
          const wrapper = setup({isOpen: true})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {key: 'c'})
          fireEvent.keyDown(menu, {key: 'a'})
          jest.runAllTimers()
          fireEvent.keyDown(menu, {key: 'l'})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(
              options.findIndex(option => startsWithCharacter(option, 'l')),
            ),
          )
        })
      })

      describe('arrow up', () => {
        test('it highlights the last option number if none is highlighted', () => {
          const wrapper = setup({isOpen: true})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(options.length - 1),
          )
        })

        test('it highlights the previous item', () => {
          const initialHighlightedIndex = 2
          const wrapper = setup({isOpen: true, initialHighlightedIndex})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(initialHighlightedIndex - 1),
          )
        })

        test('with shift it highlights the 5th previous item', () => {
          const initialHighlightedIndex = 6
          const wrapper = setup({isOpen: true, initialHighlightedIndex})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {
            keyCode: keyboardKey.ArrowUp,
            shiftKey: true,
          })

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(initialHighlightedIndex - 5),
          )
        })

        test('with shift it highlights the first item if not enough items remaining', () => {
          const initialHighlightedIndex = 1
          const wrapper = setup({isOpen: true, initialHighlightedIndex})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {
            keyCode: keyboardKey.ArrowUp,
            shiftKey: true,
          })

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(0),
          )
        })

        test('will stop at 0 if circularNavigatios is falsy', () => {
          const wrapper = setup({isOpen: true, initialHighlightedIndex: 0})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(0),
          )
        })

        test('will continue from 0 to last item if circularNavigatios is truthy', () => {
          const wrapper = setup({
            isOpen: true,
            initialHighlightedIndex: 0,
            circularNavigation: true,
          })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(options.length - 1),
          )
        })
      })

      describe('arrow down', () => {
        test("it highlights option number '0' if none is highlighted", () => {
          const wrapper = setup({isOpen: true})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(0),
          )
        })
        test('it highlights the next item', () => {
          const initialHighlightedIndex = 2
          const wrapper = setup({isOpen: true, initialHighlightedIndex})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(initialHighlightedIndex + 1),
          )
        })

        test('with shift it highlights the next 5th item', () => {
          const initialHighlightedIndex = 2
          const wrapper = setup({isOpen: true, initialHighlightedIndex})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {
            keyCode: keyboardKey.ArrowDown,
            shiftKey: true,
          })

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(initialHighlightedIndex + 5),
          )
        })

        test('with shift it highlights last item if not enough next items remaining', () => {
          const initialHighlightedIndex = options.length - 2
          const wrapper = setup({isOpen: true, initialHighlightedIndex})
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {
            keyCode: keyboardKey.ArrowDown,
            shiftKey: true,
          })

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(options.length - 1),
          )
        })

        test('will stop at last item if circularNavigatios is falsy', () => {
          const wrapper = setup({
            isOpen: true,
            initialHighlightedIndex: options.length - 1,
          })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(options.length - 1),
          )
        })

        test('will continue from last item to 0 if circularNavigatios is truthy', () => {
          const wrapper = setup({
            isOpen: true,
            initialHighlightedIndex: options.length - 1,
            circularNavigation: true,
          })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(0),
          )
        })
      })

      test('end it highlights the last option number', () => {
        const wrapper = setup({isOpen: true, initialHighlightedIndex: 2})
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.keyDown(menu, {keyCode: keyboardKey.End})

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.item(options.length - 1),
        )
      })

      test('home it highlights the first option number', () => {
        const wrapper = setup({isOpen: true, initialHighlightedIndex: 2})
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.keyDown(menu, {keyCode: keyboardKey.Home})

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.item(0),
        )
      })

      test('escape it has the menu closed', () => {
        const wrapper = setup({initialIsOpen: true, initialHighlightedIndex: 2})
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.keyDown(menu, {keyCode: keyboardKey.Escape})

        expect(menu.childNodes).toHaveLength(0)
      })

      test('escape it has the focus moved to triggerButton', () => {
        const wrapper = setup({initialIsOpen: true})
        const menu = wrapper.getByTestId(dataTestIds.menu)
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        menu.focus()
        fireEvent.keyDown(menu, {keyCode: keyboardKey.Escape})

        expect(document.activeElement).toBe(triggerButton)
      })

      test('enter it closes the menu and selects highlighted item', () => {
        const initialHighlightedIndex = 2
        const wrapper = setup({
          initialIsOpen: true,
          initialHighlightedIndex,
        })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(menu, {keyCode: keyboardKey.Enter})

        expect(menu.childNodes).toHaveLength(0)
        expect(triggerButton.textContent).toEqual(
          options[initialHighlightedIndex],
        )
      })

      test('enter it has the focus moved to triggerButton', () => {
        const wrapper = setup({initialIsOpen: true})
        const menu = wrapper.getByTestId(dataTestIds.menu)
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        menu.focus()
        fireEvent.keyDown(menu, {keyCode: keyboardKey.Enter})

        expect(document.activeElement).toBe(triggerButton)
      })

      // Special case test.
      test('shift+tab it closes the menu and selects highlighted item', () => {
        const initialHighlightedIndex = 2
        const wrapper = setup({
          initialIsOpen: true,
          initialHighlightedIndex,
        })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(menu, {keyCode: keyboardKey.Tab, shiftKey: true})

        expect(menu.childNodes).toHaveLength(0)
        expect(triggerButton.textContent).toEqual(
          options[initialHighlightedIndex],
        )
      })

      test('shift+tab it has the focus moved to triggerButton', () => {
        const wrapper = setup({initialIsOpen: true})
        const menu = wrapper.getByTestId(dataTestIds.menu)
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        menu.focus()
        fireEvent.keyDown(menu, {keyCode: keyboardKey.Tab, shiftKey: true})

        expect(document.activeElement).toBe(triggerButton)
      })
    })

    describe('on blur', () => {
      test('the open menu will be closed and highlighted item will be selected', () => {
        const initialHighlightedIndex = 2
        const wrapper = setup({
          initialIsOpen: true,
          initialHighlightedIndex,
        })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.blur(menu)

        expect(menu.childNodes).toHaveLength(0)
        expect(triggerButton.textContent).toEqual(
          options[initialHighlightedIndex],
        )
      })
    })
  })
})
