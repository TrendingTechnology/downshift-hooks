import React from 'react'
import * as keyboardKey from 'keyboard-key'
import { render, fireEvent, cleanup } from '@testing-library/react'
import useDownshiftSelection from '../hooks/downshiftSelection'
import {
  defaultIds,
} from '../utils'

const options = [
  'Neptunium',
  'Plutonium',
  'Americium',
  'Curium',
  'Berkelium',
  'Californium',
  'Einsteinium',
  'Fermium',
  'Mendelevium',
  'Nobelium',
  'Lawrencium',
  'Rutherfordium',
  'Dubnium',
  'Seaborgium',
  'Bohrium',
  'Hassium',
  'Meitnerium',
  'Darmstadtium',
  'Roentgenium',
  'Copernicium',
  'Nihonium',
  'Flerovium',
  'Moscovium',
  'Livermorium',
  'Tennessine',
  'Oganesson',
]

const dataTestIds = {
  triggerButton: 'trigger-button-id',
  menu: 'menu-id',
  item: index => `item-id-${index}`,
}

const DropdownSelection = (props) => {
  const {
    isOpen,
    selectedItem,
    getTriggerButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useDownshiftSelection({ items: options, ...props })
  return (
    <>
      <div>
        <label {...getLabelProps()}>
          Choose an element:
      </label>
        <button
          data-testid={dataTestIds.triggerButton}
          {...getTriggerButtonProps()}
        >
          {selectedItem || 'Elements'}

        </button>
        <ul
          data-testid={dataTestIds.menu}
          {...getMenuProps()}
        >
          {isOpen && options.map((option, index) => (
            <li
              data-testid={dataTestIds.item(index)}
              style={highlightedIndex === index ? { backgroundColor: 'blue' } : {}}
              key={`${option}${index}`}
              {...getItemProps({ item: option, index })}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
      <button>Give Focus!</button>
    </>
  )
}

const setup = props => render(<DropdownSelection {...props} />)

describe('downshiftSelection', () => {
  afterEach(cleanup)

  describe('menu', () => {
    describe('on key down', () => {
      describe('arrow up', () => {
        test(`it highlights the last option number if none is highlighted`, () => {
          const wrapper = setup({ isOpen: true })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp })

          expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
        })

        test(`it highlights the previous item`, () => {
          const initialHighlightedIndex = 2
          const wrapper = setup({ isOpen: true, initialHighlightedIndex })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp })

          expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex - 1))
        })

        test(`with shift it highlights the 5th previous item`, () => {
          const initialHighlightedIndex = 6
          const wrapper = setup({ isOpen: true, initialHighlightedIndex })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp, shiftKey: true })

          expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex - 5))
        })

        test(`with shift it highlights the first item if not enough items remaining`, () => {
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
            circularNavigation: true
          })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowUp })

          expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
        })
      })

      describe('arrow down', () => {
        test(`it highlights option number '0' if none is highlighted`, () => {
          const wrapper = setup({ isOpen: true })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown })

          expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
        })
        test(`it highlights the next item`, () => {
          const initialHighlightedIndex = 2
          const wrapper = setup({ isOpen: true, initialHighlightedIndex })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown })

          expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex + 1))
        })

        test(`with shift it highlights the next 5th item`, () => {
          const initialHighlightedIndex = 2
          const wrapper = setup({ isOpen: true, initialHighlightedIndex })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown, shiftKey: true })

          expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex + 5))
        })

        test(`with shift it highlights last item if not enough next items remaining`, () => {
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
            circularNavigation: true
          })
          const menu = wrapper.getByTestId(dataTestIds.menu)

          fireEvent.keyDown(menu, { keyCode: keyboardKey.ArrowDown })

          expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
        })
      })

      test(`end it highlights the last option number`, () => {
        const wrapper = setup({ isOpen: true, initialHighlightedIndex: 2 })
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.keyDown(menu, { keyCode: keyboardKey.End })

        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
      })

      test(`home it highlights the first option number`, () => {
        const wrapper = setup({ isOpen: true, initialHighlightedIndex: 2 })
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Home })

        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
      })

      test('escape it has the menu closed', () => {
        const wrapper = setup({ initialIsOpen: true, initialHighlightedIndex: 2 })
        const menu = wrapper.getByTestId(dataTestIds.menu)

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })

        expect(menu.childNodes.length).toBe(0)
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
        expect(menu.childNodes.length).toBe(0)
        expect(onSelectedItemChange).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedItem: options[initialHighlightedIndex],
          })
        )
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
        expect(menu.childNodes.length).toBe(0)
        expect(onSelectedItemChange).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedItem: options[initialHighlightedIndex],
          })
        )
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
        expect(menu.childNodes.length).toBe(0)
        expect(onSelectedItemChange).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedItem: options[initialHighlightedIndex],
          })
        )
      })
    })
  })

  describe('triggerButton', () => {
    describe('on click', () => {
      test('opens the closed menu', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.childNodes.length).toBe(options.length)
      })

      test('closes the open menu', () => {
        const wrapper = setup({ initialIsOpen: true })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.childNodes.length).toBe(0)
      })

      test('opens the closed menu without any option highlighted', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBeNull()
      })

      test('opens the closed menu with selected option highlighted', () => {
        const selectedIndex = 3
        const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex))
      })

      test('opens the closed menu at initialHighlightedIndex, but on first click only', () => {
        const initialHighlightedIndex = 3
        const wrapper = setup({ initialHighlightedIndex })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)
        expect(menu.getAttribute('aria-activedescendant')).toBeNull()
      })

      test('opens the closed menu at defaultHighlightedIndex, on every click', () => {
        const defaultHighlightedIndex = 3
        const wrapper = setup({ defaultHighlightedIndex })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
      })

      test('opens the closed menu at highlightedIndex from props, on every click', () => {
        const highlightedIndex = 3
        const wrapper = setup({ highlightedIndex })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))
      })
    })

    describe('on keydown', () => {
      test('arrow down opens the closed menu with first option highlighted', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
      })

      test('arrow up opens the closed menu with last option highlighted', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
      })

      test('arrow down opens the closed menu with selected option + 1 highlighted', () => {
        const selectedIndex = 3
        const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex + 1))
      })

      test('arrow up opens the closed menu with selected option - 1 highlighted', () => {
        const selectedIndex = 3
        const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex - 1))
      })

      test('arrow down opens the closed menu at initialHighlightedIndex, but on first arrow down only', () => {
        const initialHighlightedIndex = 3
        const wrapper = setup({ initialHighlightedIndex })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
      })

      test('arrow up opens the closed menu at initialHighlightedIndex, but on first arrow up only', () => {
        const initialHighlightedIndex = 3
        const wrapper = setup({ initialHighlightedIndex })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
      })

      test('arrow down opens the closed menu at defaultHighlightedIndex, on every arrow down', () => {
        const defaultHighlightedIndex = 3
        const wrapper = setup({ defaultHighlightedIndex })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
      })

      test('arrow up opens the closed menu at defaultHighlightedIndex, on every arrow up', () => {
        const defaultHighlightedIndex = 3
        const wrapper = setup({ defaultHighlightedIndex })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
      })

      test('opens the closed menu at highlightedIndex from props, on every click', () => {
        const highlightedIndex = 3
        const wrapper = setup({ highlightedIndex })
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId(dataTestIds.menu)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))
      })

      test.skip('arrow up prevents event default', () => {
        const wrapper = setup()
        const preventDefault = jest.fn()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp, preventDefault })
        expect(preventDefault).toHaveBeenCalledTimes(1)
      })

      test.skip('arrow down prevents event default', () => {
        const wrapper = setup()
        const preventDefault = jest.fn()
        const triggerButton = wrapper.getByTestId(dataTestIds.triggerButton)

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown, preventDefault })
        expect(preventDefault).toHaveBeenCalledTimes(1)
      })
    })
  })
})
