import ReactDOM from 'react-dom'
import React from 'react'
import useDownshiftSelection from './downshiftSelection'

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

const Dropdown = () => {
  const {
    isOpen,
    selectedItem,
    getTriggerButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useDownshiftSelection({ items: options })
  return (
    <>
      <div id="exp_wrapper">
        <label {...getLabelProps()}>
          Choose an element:
      </label>
        <button
          {...getTriggerButtonProps()}>
          {selectedItem || 'Elements'}
        </button>
        <ul {...getMenuProps()}>
          {isOpen && options.map((option, index) => (
            <li
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

ReactDOM.render(
  <Dropdown />,
  document.getElementById('app'),
)

module.hot.accept();
