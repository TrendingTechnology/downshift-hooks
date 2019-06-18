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
      <div id="exp_wrapper">
        <label {...getLabelProps()}>
          Choose an element:
      </label>
        <button
          data-testid="trigger-button"
          {...getTriggerButtonProps()}
        >
          {selectedItem || 'Elements'}

        </button>
        <ul
          data-testid="menu"
          {...getMenuProps()}
        >
          {isOpen && options.map((option, index) => (
            <li
              data-testid={`item-${index}`}
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

  describe('triggerButton', () => {
    describe('on click', () => {
      test('opens the closed menu', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId('menu')
        expect(menu.childNodes.length).toBe(options.length)
      })

      test('closes the open menu', () => {
        const wrapper = setup({ initialIsOpen: true })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId('menu')
        expect(menu.childNodes.length).toBe(0)
      })

      test('opens the closed menu without any option highlighted', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBeNull()
      })

      test('opens the closed menu with selected option highlighted', () => {
        const selectedIndex = 3
        const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex))
      })

      test('opens the closed menu at initialHighlightedIndex, but on first click only', () => {
        const initialHighlightedIndex = 3
        const wrapper = setup({ initialHighlightedIndex })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)
        expect(menu.getAttribute('aria-activedescendant')).toBeNull()
      })

      test('opens the closed menu at defaultHighlightedIndex, on every click', () => {
        const defaultHighlightedIndex = 3
        const wrapper = setup({ defaultHighlightedIndex })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
      })

      test('opens the closed menu at highlightedIndex from props, on every click', () => {
        const highlightedIndex = 3
        const wrapper = setup({ highlightedIndex })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))
      })
    })

    describe('on keydown', () => {
      test('arrow down opens the closed menu with first option highlighted', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
      })

      test('arrow up opens the closed menu with last option highlighted', () => {
        const wrapper = setup()
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
      })

      test('arrow down opens the closed menu with selected option + 1 highlighted', () => {
        const selectedIndex = 3
        const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex + 1))
      })

      test('arrow up opens the closed menu with selected option - 1 highlighted', () => {
        const selectedIndex = 3
        const wrapper = setup({ initialSelectedItem: options[selectedIndex] })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(selectedIndex - 1))
      })

      test('arrow down opens the closed menu at initialHighlightedIndex, but on first arrow down only', () => {
        const initialHighlightedIndex = 3
        const wrapper = setup({ initialHighlightedIndex })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
      })

      test('arrow up opens the closed menu at initialHighlightedIndex, but on first arrow up only', () => {
        const initialHighlightedIndex = 3
        const wrapper = setup({ initialHighlightedIndex })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(initialHighlightedIndex))

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
      })

      test('arrow down opens the closed menu at defaultHighlightedIndex, on every arrow down', () => {
        const defaultHighlightedIndex = 3
        const wrapper = setup({ defaultHighlightedIndex })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
      })

      test('arrow up opens the closed menu at defaultHighlightedIndex, on every arrow up', () => {
        const defaultHighlightedIndex = 3
        const wrapper = setup({ defaultHighlightedIndex })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))

        fireEvent.keyDown(menu, { keyCode: keyboardKey.Escape })
        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(defaultHighlightedIndex))
      })

      test('opens the closed menu at highlightedIndex from props, on every click', () => {
        const highlightedIndex = 3
        const wrapper = setup({ highlightedIndex })
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.click(triggerButton)
        const menu = wrapper.getByTestId('menu')
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))

        fireEvent.click(triggerButton)
        fireEvent.click(triggerButton)
        expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(highlightedIndex))
      })

      test('arrow up prevents event default', () => {
        const wrapper = setup()
        const preventDefault = jest.fn()
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp, preventDefault })
        expect(preventDefault).toHaveBeenCalledTimes(1)
      })

      test('arrow down prevents event default', () => {
        const wrapper = setup()
        const preventDefault = jest.fn()
        const triggerButton = wrapper.getByTestId('trigger-button')

        fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown, preventDefault })
        expect(preventDefault).toHaveBeenCalledTimes(1)
      })
    })
  })
})
