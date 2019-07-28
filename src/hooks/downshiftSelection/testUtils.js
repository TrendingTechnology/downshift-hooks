import React from 'react'
import {useId} from '@reach/auto-id'
import {render} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import {getDefaultIds} from '../utils'
import useDownshiftSelection from '.'

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
  return renderHook(() => useDownshiftSelection({items: options, ...props}))
}

const DropdownSelection = props => {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    items,
  } = useDownshiftSelection({items: options, ...props})
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label {...getLabelProps()}>Choose an element:</label>
      <button
        data-testid={dataTestIds.toggleButton}
        {...getToggleButtonProps()}
      >
        {selectedItem || 'Elements'}
      </button>
      <ul data-testid={dataTestIds.menu} {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => (
            <li
              data-testid={dataTestIds.item(index)}
              style={
                highlightedIndex === index ? {backgroundColor: 'blue'} : {}
              }
              key={`${item}${index}`}
              {...getItemProps({item, index})}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  )
}

const setup = props => render(<DropdownSelection {...props} />)

export {dataTestIds, setup, options, setupHook, defaultIds}
