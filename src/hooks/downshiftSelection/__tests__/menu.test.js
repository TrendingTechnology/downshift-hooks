/* eslint-disable jest/no-disabled-tests */
import * as keyboardKey from 'keyboard-key'
import { fireEvent, cleanup } from '@testing-library/react'
import { defaultIds } from '../../utils'
import { setup, dataTestIds, options } from '../testUtils'

describe('menu', () => {
	afterEach(cleanup)

	describe('initial focus', () => {
		test('is grabbed when isOpen is passed as true', () => {
			const wrapper = setup({ isOpen: true })
			const menu = wrapper.getByTestId(dataTestIds.menu)

			expect(document.activeElement).toBe(menu)
		})

		test('is grabbed when initialIsOpen is passed as true', () => {
			const wrapper = setup({ initialIsOpen: true })
			const menu = wrapper.getByTestId(dataTestIds.menu)

			expect(document.activeElement).toBe(menu)
		})

		test('is grabbed when defaultIsOpen is passed as true', () => {
			const wrapper = setup({ defaultIsOpen: true })
			const menu = wrapper.getByTestId(dataTestIds.menu)

			expect(document.activeElement).toBe(menu)
		})

		test('is not grabbed when initial open is set to default (false)', () => {
			const wrapper = setup({})
			const menu = wrapper.getByTestId(dataTestIds.menu)

			expect(document.activeElement).not.toBe(menu)
		})
	})

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
				const wrapper = setup({ isOpen: true })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { key: 'c' })

				expect(menu.getAttribute('aria-activedescendant')).toBe(
					defaultIds.item(options.findIndex(option => startsWithCharacter(option, 'c'))))
			})

			test('should highlight the second item that starts with that key after typing it twice', () => {
				const wrapper = setup({ isOpen: true })
				const menu = wrapper.getByTestId(dataTestIds.menu)
				const firstIndex = options.findIndex(option => startsWithCharacter(option, 'c'))

				fireEvent.keyDown(menu, { key: 'c' })
				jest.runAllTimers()
				fireEvent.keyDown(menu, { key: 'c' })

				expect(menu.getAttribute('aria-activedescendant')).toBe(
					defaultIds.item(firstIndex + 1 + options.slice(firstIndex + 1).findIndex(option => startsWithCharacter(option, 'c'))))
			})

			test('should highlight the first item again if the options are depleated', () => {
				const wrapper = setup({ isOpen: true })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { key: 'b' })
				jest.runAllTimers()
				fireEvent.keyDown(menu, { key: 'b' })
				jest.runAllTimers()
				fireEvent.keyDown(menu, { key: 'b' })

				expect(menu.getAttribute('aria-activedescendant')).toBe(
					defaultIds.item(options.findIndex(option => startsWithCharacter(option, 'b'))))
			})

			test('should not highlight anything if no item starts with that key', () => {
				const wrapper = setup({ isOpen: true })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { key: 'x' })

				expect(menu.getAttribute('aria-activedescendant')).toBeNull()
			})

			test('should highlight the first item that starts with the keys typed in rapid succession', () => {
				const wrapper = setup({ isOpen: true })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { key: 'c' })
				fireEvent.keyDown(menu, { key: 'a' })

				expect(menu.getAttribute('aria-activedescendant')).toBe(
					defaultIds.item(options.findIndex(option => startsWithCharacter(option, 'ca'))))
			})

			test('should become first character after timeout passes', () => {
				const wrapper = setup({ isOpen: true })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { key: 'c' })
				fireEvent.keyDown(menu, { key: 'a' })
				jest.runAllTimers()
				fireEvent.keyDown(menu, { key: 'l' })

				expect(menu.getAttribute('aria-activedescendant')).toBe(
					defaultIds.item(options.findIndex(option => startsWithCharacter(option, 'l'))))
			})
		})

		describe('arrow up', () => {
			test('it highlights the last option number if none is highlighted', () => {
				const wrapper = setup({ isOpen: true })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
			})

			test('it highlights the previous item', () => {
				const initialHighlightedIndex = 2
				const wrapper = setup({ isOpen: true, initialHighlightedIndex })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex - 1))
			})

			test('with shift it highlights the 5th previous item', () => {
				const initialHighlightedIndex = 6
				const wrapper = setup({ isOpen: true, initialHighlightedIndex })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp, shiftKey: true })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex - 5))
			})

			test('with shift it highlights the first item if not enough items remaining', () => {
				const initialHighlightedIndex = 1
				const wrapper = setup({ isOpen: true, initialHighlightedIndex })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp, shiftKey: true })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
			})

			test('will stop at 0 if circularNavigatios is falsy', () => {
				const wrapper = setup({ isOpen: true, initialHighlightedIndex: 0 })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
			})

			test('will continue from 0 to last item if circularNavigatios is truthy', () => {
				const wrapper = setup({
					isOpen: true,
					initialHighlightedIndex: 0,
					circularNavigation: true,
				})
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
			})
		})

		describe('arrow down', () => {
			test("it highlights option number '0' if none is highlighted", () => {
				const wrapper = setup({ isOpen: true })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
			})
			test('it highlights the next item', () => {
				const initialHighlightedIndex = 2
				const wrapper = setup({ isOpen: true, initialHighlightedIndex })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex + 1))
			})

			test('with shift it highlights the next 5th item', () => {
				const initialHighlightedIndex = 2
				const wrapper = setup({ isOpen: true, initialHighlightedIndex })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown, shiftKey: true })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex + 5))
			})

			test('with shift it highlights last item if not enough next items remaining', () => {
				const initialHighlightedIndex = options.length - 2
				const wrapper = setup({ isOpen: true, initialHighlightedIndex })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown, shiftKey: true })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
			})

			test('will stop at last item if circularNavigatios is falsy', () => {
				const wrapper = setup({ isOpen: true, initialHighlightedIndex: options.length - 1 })
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
			})

			test('will continue from last item to 0 if circularNavigatios is truthy', () => {
				const wrapper = setup({
					isOpen: true,
					initialHighlightedIndex: options.length - 1,
					circularNavigation: true,
				})
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
			})
		})

		test('end it highlights the last option number', () => {
			const wrapper = setup({ isOpen: true, initialHighlightedIndex: 2 })
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.keyDown(menu, { keyCode: keyboardKey.End })

			expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
		})

		test('home it highlights the first option number', () => {
			const wrapper = setup({ isOpen: true, initialHighlightedIndex: 2 })
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.keyDown(menu, { keyCode: keyboardKey.Home })

			expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
		})

		test('escape it has the menu closed', () => {
			const wrapper = setup({ initialIsOpen: true, initialHighlightedIndex: 2 })
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })

			expect(menu.childNodes).toHaveLength(0)
		})

		test('escape it has the focus moved to triggerButton', () => {
			const wrapper = setup({ initialIsOpen: true })
			const menu = wrapper.getByTestId(dataTestIds.menu)
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

			menu.focus()
			fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })

			expect(document.activeElement).toBe(triggerButton)
		})

		test('enter it closes the menu and selects highlighted item', () => {
			const initialHighlightedIndex = 2
			const onSelectedItemChange = jest.fn()
			const wrapper = setup({
				initialIsOpen: true,
				initialHighlightedIndex,
				onSelectedItemChange,
			})
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.keyDown(menu, { keyCode: keyboardKey.Enter })

			expect(menu.childNodes).toHaveLength(0)
			expect(onSelectedItemChange).toHaveBeenCalledWith(
				expect.objectContaining({
					selectedItem: options[initialHighlightedIndex],
				}),
			)
		})

		test('enter it has the focus moved to triggerButton', () => {
			const wrapper = setup({ initialIsOpen: true })
			const menu = wrapper.getByTestId(dataTestIds.menu)
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

			menu.focus()
			fireEvent.keyDown(menu, { keyCode: keyboardKey.Enter })

			expect(document.activeElement).toBe(triggerButton)
		})

		// Special case test.
		test('shift+tab it closes the menu and selects highlighted item', () => {
			const initialHighlightedIndex = 2
			const onSelectedItemChange = jest.fn()
			const wrapper = setup({
				initialIsOpen: true,
				initialHighlightedIndex,
				onSelectedItemChange,
			})
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.keyDown(menu, { keyCode: keyboardKey.Tab, shiftKey: true })

			expect(menu.childNodes).toHaveLength(0)
			expect(onSelectedItemChange).toHaveBeenCalledWith(
				expect.objectContaining({
					selectedItem: options[initialHighlightedIndex],
				}),
			)
		})

		test('shift+tab it has the focus moved to triggerButton', () => {
			const wrapper = setup({ initialIsOpen: true })
			const menu = wrapper.getByTestId(dataTestIds.menu)
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

			menu.focus()
			fireEvent.keyDown(menu, { keyCode: keyboardKey.Tab, shiftKey: true })

			expect(document.activeElement).toBe(triggerButton)
		})
	})

	describe('on blur', () => {
		test('the open menu will be closed and highlighted item will be selected', () => {
			const initialHighlightedIndex = 2
			const onSelectedItemChange = jest.fn()
			const wrapper = setup({
				initialIsOpen: true,
				initialHighlightedIndex,
				onSelectedItemChange,
			})
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.blur(menu)

			expect(menu.childNodes).toHaveLength(0)
			expect(onSelectedItemChange).toHaveBeenCalledWith(
				expect.objectContaining({
					selectedItem: options[initialHighlightedIndex],
				}),
			)
		})
	})
})
