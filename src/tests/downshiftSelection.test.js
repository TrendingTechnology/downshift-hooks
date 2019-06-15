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
    test('opens the closed menu on click', () => {
      const wrapper = setup()
      const triggerButton = wrapper.getByTestId('trigger-button')

      fireEvent.click(triggerButton)
      const menu = wrapper.getByTestId('menu')
      expect(menu.childNodes.length).toBe(options.length)
    })

    test('closes the open menu on click', () => {
      const wrapper = setup({ initialIsOpen: true })
      const triggerButton = wrapper.getByTestId('trigger-button')

      fireEvent.click(triggerButton)
      const menu = wrapper.getByTestId('menu')
      expect(menu.childNodes.length).toBe(0)
    })

    test('opens the closed menu without any option highlighted on click', () => {
      const wrapper = setup()
      const triggerButton = wrapper.getByTestId('trigger-button')

      fireEvent.click(triggerButton)
      const menu = wrapper.getByTestId('menu')
      expect(menu.getAttribute('aria-activedescendant')).toBeNull()
    })

    test('opens the closed menu with first option highlighted on arrow down', () => {
      const wrapper = setup()
      const triggerButton = wrapper.getByTestId('trigger-button')

      fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown })
      const menu = wrapper.getByTestId('menu')
      expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(0))
    })

    test('opens the closed menu with last option highlighted on arrow up', () => {
      const wrapper = setup()
      const triggerButton = wrapper.getByTestId('trigger-button')

      fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp })
      const menu = wrapper.getByTestId('menu')
      expect(menu.getAttribute('aria-activedescendant')).toBe(defaultIds.item(options.length - 1))
    })

    test('prevents event default on arrow up', () => {
      const wrapper = setup()
      const preventDefault = jest.fn()
      const triggerButton = wrapper.getByTestId('trigger-button')

      fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowUp, preventDefault })
      expect(preventDefault).toHaveBeenCalledTimes(1)
    })

    test('prevents event default on arrow down', () => {
      const wrapper = setup()
      const preventDefault = jest.fn()
      const triggerButton = wrapper.getByTestId('trigger-button')

      fireEvent.keyDown(triggerButton, { keyCode: keyboardKey.ArrowDown, preventDefault })
      expect(preventDefault).toHaveBeenCalledTimes(1)
    })
  })
})
