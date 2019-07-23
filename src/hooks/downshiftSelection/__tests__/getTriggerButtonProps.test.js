/* eslint-disable jest/no-disabled-tests */
import * as keyboardKey from 'keyboard-key'
import {fireEvent, cleanup} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import {getDefaultIds, noop} from '../../utils'
import {setup, dataTestIds, options, setupHook, getId} from '../testUtils'

describe('getTriggerButtonProps', () => {
  let defaultIds

  beforeEach(() => {
    defaultIds = getDefaultIds(getId())
  })

  afterEach(cleanup)

  describe('hook props', () => {
    test('assign default value to aria-labelledby', () => {
      const {result} = setupHook()
      const triggerButtonProps = result.current.getTriggerButtonProps()

      expect(triggerButtonProps['aria-labelledby']).toEqual(
        `${defaultIds.label} ${defaultIds.triggerButton}`,
      )
    })

    test('assign custom value passed by user to aria-labelledby', () => {
      const props = {
        labelId: 'my-custom-label-id',
        triggerButtonId: 'my-custom-trigger-button-id',
      }
      const {result} = setupHook(props)
      const triggerButtonProps = result.current.getTriggerButtonProps()

      expect(triggerButtonProps['aria-labelledby']).toEqual(
        `${props.labelId} ${props.triggerButtonId}`,
      )
    })

    test('assign default value to id', () => {
      const {result} = setupHook()
      const triggerButtonProps = result.current.getTriggerButtonProps()

      expect(triggerButtonProps.id).toEqual(defaultIds.triggerButton)
    })

    test('assign custom value passed by user to id', () => {
      const props = {
        triggerButtonId: 'my-custom-trigger-button-id',
      }
      const {result} = setupHook(props)
      const triggerButtonProps = result.current.getTriggerButtonProps()

      expect(triggerButtonProps.id).toEqual(props.triggerButtonId)
    })

    test("assign 'listbbox' to aria-haspopup", () => {
      const {result} = setupHook()
      const triggerButtonProps = result.current.getTriggerButtonProps()

      expect(triggerButtonProps['aria-haspopup']).toEqual('listbox')
    })

    test("assign 'false' value to aria-expanded when menu is closed", () => {
      const {result} = setupHook({isOpen: false})
      const triggerButtonProps = result.current.getTriggerButtonProps()

      expect(triggerButtonProps['aria-expanded']).toEqual(false)
    })

    test("assign 'true' value to aria-expanded when menu is open", () => {
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()

        menuRef({focus: noop})
        result.current.toggleMenu()
      })

      const triggerButtonProps = result.current.getTriggerButtonProps()

      expect(triggerButtonProps['aria-expanded']).toEqual(true)
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

    test('event handler onClick is called along with downshift handler', () => {
      const userOnClick = jest.fn()
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        const {
          ref: triggerButtonRef,
          onClick,
        } = result.current.getTriggerButtonProps({onClick: userOnClick})

        menuRef({focus: noop})
        triggerButtonRef({})
        onClick({})
      })

      expect(userOnClick).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(true)
    })

    test('event handler onKeyDown is called along with downshift handler', () => {
      const userOnKeyDown = jest.fn()
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        const {
          ref: triggerButtonRef,
          onKeyDown,
        } = result.current.getTriggerButtonProps({onKeyDown: userOnKeyDown})

        menuRef({focus: noop})
        triggerButtonRef({})
        onKeyDown({keyCode: keyboardKey.ArrowDown, preventDefault: noop})
      })

      expect(userOnKeyDown).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(true)
    })

    test("event handler onClick is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnClick = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        const {
          ref: triggerButtonRef,
          onClick,
        } = result.current.getTriggerButtonProps({onClick: userOnClick})

        triggerButtonRef({focus: noop})
        menuRef({focus: noop})
        onClick({})
      })

      expect(userOnClick).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(false)
    })

    test("event handler onKeyDown is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnKeyDown = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = setupHook()

      act(() => {
        const {ref: menuRef} = result.current.getMenuProps()
        const {
          ref: triggerButtonRef,
          onKeyDown,
        } = result.current.getTriggerButtonProps({onKeyDown: userOnKeyDown})

        triggerButtonRef({focus: noop})
        menuRef({focus: noop})
        onKeyDown({
          keyCode: keyboardKey.ArrowDown,
          preventDefault: noop,
        })
      })

      expect(userOnKeyDown).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('event handlers', () => {
    describe('on click', () => {
      test('opens the closed menu', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.click(triggerButton)

        expect(menu.childNodes).toHaveLength(options.length)
      })

      test('closes the open menu', () => {
        const wrapper = setup({initialIsOpen: true})
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.click(triggerButton)

        expect(menu.childNodes).toHaveLength(0)
      })

      test('opens the closed menu without any option highlighted', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.click(triggerButton)

        expect(menu.getAttribute('aria-activedescendant')).toBeNull()
      })

      test('opens the closed menu with selected option highlighted', () => {
        const selectedIndex = 3
        const wrapper = setup({initialSelectedItem: options[selectedIndex]})
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.click(triggerButton)

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.item(selectedIndex),
        )
      })

      test('opens the closed menu at initialHighlightedIndex, but on first click only', () => {
        const initialHighlightedIndex = 3
        const wrapper = setup({initialHighlightedIndex})
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.click(triggerButton)

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.item(initialHighlightedIndex),
        )

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)

        expect(menu.getAttribute('aria-activedescendant')).toBeNull()
      })

      test('opens the closed menu at defaultHighlightedIndex, on every click', () => {
        const defaultHighlightedIndex = 3
        const wrapper = setup({defaultHighlightedIndex})
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.click(triggerButton)

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.item(defaultHighlightedIndex),
        )

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.item(defaultHighlightedIndex),
        )
      })

      test('opens the closed menu at highlightedIndex from props, on every click', () => {
        const highlightedIndex = 3
        const wrapper = setup({highlightedIndex})
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.click(triggerButton)

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.item(highlightedIndex),
        )

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)

        expect(menu.getAttribute('aria-activedescendant')).toBe(
          defaultIds.item(highlightedIndex),
        )
      })

      test('opens the closed menu and sets focus on the menu', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.click(triggerButton)

        expect(document.activeElement).toBe(menu)
      })

      test('closes the open menu and sets focus on the trigger button', () => {
        const wrapper = setup({initialIsOpen: true})
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)

        expect(document.activeElement).toBe(triggerButton)
      })
    })

    describe('on keydown', () => {
      describe('arrow up', () => {
        test('opens the closed menu with last option highlighted', () => {
          const wrapper = setup()
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(options.length - 1),
          )
        })

        test('opens the closed menu with selected option - 1 highlighted', () => {
          const selectedIndex = 3
          const wrapper = setup({initialSelectedItem: options[selectedIndex]})
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(selectedIndex - 1),
          )
        })

        test('opens the closed menu at initialHighlightedIndex, but on first arrow up only', () => {
          const initialHighlightedIndex = 3
          const wrapper = setup({initialHighlightedIndex})
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(initialHighlightedIndex),
          )

          fireEvent.keyDown(menu, {keyCode: keyboardKey.Escape})
          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(options.length - 1),
          )
        })

        test('arrow up opens the closed menu at defaultHighlightedIndex, on every arrow up', () => {
          const defaultHighlightedIndex = 3
          const wrapper = setup({defaultHighlightedIndex})
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(defaultHighlightedIndex),
          )

          fireEvent.keyDown(menu, {keyCode: keyboardKey.Escape})
          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowUp})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(defaultHighlightedIndex),
          )
        })

        test.skip('prevents event default', () => {
          const wrapper = setup()
          const preventDefault = jest.fn()
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

          fireEvent.keyDown(triggerButton, {
            keyCode: keyboardKey.ArrowUp,
            preventDefault,
          })

          expect(preventDefault).toHaveBeenCalledTimes(1)
        })

        test('opens the closed menu and focuses the list', () => {
          const wrapper = setup()
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowUp})

          expect(document.activeElement).toBe(menu)
        })
      })

      describe('arrow down', () => {
        test('opens the closed menu with first option highlighted', () => {
          const wrapper = setup()
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(0),
          )
        })

        test('opens the closed menu with selected option + 1 highlighted', () => {
          const selectedIndex = 3
          const wrapper = setup({initialSelectedItem: options[selectedIndex]})
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(selectedIndex + 1),
          )
        })

        test('opens the closed menu at initialHighlightedIndex, but on first arrow down only', () => {
          const initialHighlightedIndex = 3
          const wrapper = setup({initialHighlightedIndex})
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(initialHighlightedIndex),
          )

          fireEvent.keyDown(menu, {keyCode: keyboardKey.Escape})
          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(0),
          )
        })

        test('opens the closed menu at defaultHighlightedIndex, on every arrow down', () => {
          const defaultHighlightedIndex = 3
          const wrapper = setup({defaultHighlightedIndex})
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(defaultHighlightedIndex),
          )

          fireEvent.keyDown(menu, {keyCode: keyboardKey.Escape})
          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowDown})

          expect(menu.getAttribute('aria-activedescendant')).toBe(
            defaultIds.item(defaultHighlightedIndex),
          )
        })

        // also add for menu when this test works.
        test.skip('arrow down prevents event default', () => {
          const wrapper = setup()
          const preventDefault = jest.fn()
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

          fireEvent.keyDown(triggerButton, {
            keyCode: keyboardKey.ArrowDown,
            preventDefault,
          })

          expect(preventDefault).toHaveBeenCalledTimes(1)
        })

        test('opens the closed menu and focuses the list', () => {
          const wrapper = setup()
          const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(triggerButton, {keyCode: keyboardKey.ArrowDown})

          expect(document.activeElement).toBe(menu)
        })
      })
    })
  })
})
