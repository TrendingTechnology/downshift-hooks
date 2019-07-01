import React from 'react'
import { render } from '@testing-library/react'
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
	)
}

const setup = props => render(<DropdownSelection {...props} />)

export {
  dataTestIds,
  setup,
  options,
}
