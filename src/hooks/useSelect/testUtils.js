import React from 'react'
import {useId} from '@reach/auto-id'
import {render} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import {getDefaultIds} from '../utils'
import useSelect from '.'

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

jest.mock('@reach/auto-id', () => {
  return {
    useId: () => 'test-id',
  }
})

const defaultIds = getDefaultIds(useId())

const dataTestIds = {
  toggleButton: 'toggle-button-id',
  menu: 'menu-id',
  item: index => `item-id-${index}`,
}

const setupHook = props => {
  return renderHook(() => useSelect({items: options, ...props}))
}

const DropdownSelect = props => {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    items,
  } = useSelect({items: options, ...props})
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label {...getLabelProps()}>Choose an element:</label>
      <button
        data-testid={dataTestIds.toggleButton}
        {...getToggleButtonProps()}
      >
        {(selectedItem && selectedItem instanceof Object
          ? props.itemToString(selectedItem)
          : selectedItem) || 'Elements'}
      </button>
      <ul data-testid={dataTestIds.menu} {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => {
            const stringItem =
              item instanceof Object ? props.itemToString(item) : item
            return (
              <li
                data-testid={dataTestIds.item(index)}
                style={
                  highlightedIndex === index ? {backgroundColor: 'blue'} : {}
                }
                key={`${stringItem}${index}`}
                {...getItemProps({item, index})}
              >
                {stringItem}
              </li>
            )
          })}
      </ul>
    </div>
  )
}

const setup = props => render(<DropdownSelect {...props} />)

export {dataTestIds, setup, options, setupHook, defaultIds}
