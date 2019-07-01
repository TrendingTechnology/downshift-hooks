/* eslint-disable jest/no-disabled-tests */
import * as keyboardKey from 'keyboard-key'
import { fireEvent, cleanup } from '@testing-library/react'
import { defaultIds } from '../../../utils'
import { setup, dataTestIds, options } from '../testUtils'

describe('triggerButton', () => {
	afterEach(cleanup)

	describe('on click', () => {
		test('opens the closed menu', () => {
			const wrapper = setup()
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.click(triggerButton)

			expect(menu.childNodes).toHaveLength(options.length)
		})

		test('closes the open menu', () => {
			const wrapper = setup({ initialIsOpen: true })
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
			const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.click(triggerButton)

			expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex))
		})

		test('opens the closed menu at initialHighlightedIndex, but on first click only', () => {
			const initialHighlightedIndex = 3
			const wrapper = setup({ initialHighlightedIndex })
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.click(triggerButton)

			expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

			fireEvent.click(triggerButton)
			fireEvent.click(triggerButton)

			expect(menu.getAttribute('aria-activedescendant')).toBeNull()
		})

		test('opens the closed menu at defaultHighlightedIndex, on every click', () => {
			const defaultHighlightedIndex = 3
			const wrapper = setup({ defaultHighlightedIndex })
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.click(triggerButton)

			expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

			fireEvent.click(triggerButton)
			fireEvent.click(triggerButton)

			expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
		})

		test('opens the closed menu at highlightedIndex from props, on every click', () => {
			const highlightedIndex = 3
			const wrapper = setup({ highlightedIndex })
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.click(triggerButton)

			expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))

			fireEvent.click(triggerButton)
			fireEvent.click(triggerButton)

			expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))
		})

		test('opens the closed menu and sets focus on the menu', () => {
			const wrapper = setup()
			const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
			const menu = wrapper.getByTestId(dataTestIds.menu)

			fireEvent.click(triggerButton)

			expect(document.activeElement).toBe(menu)
		})

		test('closes the open menu and sets focus on the trigger button', () => {
			const wrapper = setup({ initialIsOpen: true })
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

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
			})

			test('opens the closed menu with selected option - 1 highlighted', () => {
				const selectedIndex = 3
				const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex - 1))
			})

			test('opens the closed menu at initialHighlightedIndex, but on first arrow up only', () => {
				const initialHighlightedIndex = 3
				const wrapper = setup({ initialHighlightedIndex })
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

				fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
			})

			test('arrow up opens the closed menu at defaultHighlightedIndex, on every arrow up', () => {
				const defaultHighlightedIndex = 3
				const wrapper = setup({ defaultHighlightedIndex })
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

				fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
			})

			test.skip('prevents event default', () => {
				const wrapper = setup()
				const preventDefault = jest.fn()
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp, preventDefault })

				expect(preventDefault).toHaveBeenCalledTimes(1)
			})

			test('opens the closed menu and focuses the list', () => {
				const wrapper = setup()
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })

				expect(document.activeElement).toBe(menu)
			})
		})

		describe('arrow down', () => {
			test('opens the closed menu with first option highlighted', () => {
				const wrapper = setup()
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
			})

			test('opens the closed menu with selected option + 1 highlighted', () => {
				const selectedIndex = 3
				const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex + 1))
			})

			test('opens the closed menu at initialHighlightedIndex, but on first arrow down only', () => {
				const initialHighlightedIndex = 3
				const wrapper = setup({ initialHighlightedIndex })
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

				fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
			})

			test('opens the closed menu at defaultHighlightedIndex, on every arrow down', () => {
				const defaultHighlightedIndex = 3
				const wrapper = setup({ defaultHighlightedIndex })
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

				fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })

				expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
			})

			// also add for menu when this test works.
			test.skip('arrow down prevents event default', () => {
				const wrapper = setup()
				const preventDefault = jest.fn()
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown, preventDefault })

				expect(preventDefault).toHaveBeenCalledTimes(1)
			})

			test('opens the closed menu and focuses the list', () => {
				const wrapper = setup()
				const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)
				const menu = wrapper.getByTestId(dataTestIds.menu)

				fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })

				expect(document.activeElement).toBe(menu)
			})
		})
	})
})
