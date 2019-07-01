# Selection

## The problem

You have a collapsible dropdown in your application and you want it to follow the [ARIA pattern][selection] in terms of accessibility and functionality. You also want this solution to be simple to use and flexible so you can tailor it further to your specific needs.

## This solution

This React hook provides a collection of functions that are applied to your dropdown's parts: the trigger button, the list, the items and the label.

These functions are destructured as a set of ARIA attributes and event listeners. Together, they create all the stateful logic needed for the dropdown to implement the corresponding ARIA pattern.

## Usage

> [Try it out in the browser](https://codesandbox.io/s/downshift-hooks-example-ew0em)

```jsx
import React from "react";
import { render } from "react-dom";
import { useDownshiftSelection } from "downshift-hooks";

const options = [
  "Neptunium",
  "Plutonium",
  "Americium",
  "Curium",
  "Berkelium",
  "Californium",
  "Einsteinium",
  "Fermium",
  "Mendelevium",
  "Nobelium",
  "Lawrencium",
  "Rutherfordium",
  "Dubnium",
  "Seaborgium",
  "Bohrium",
  "Hassium",
  "Meitnerium",
  "Darmstadtium",
  "Roentgenium",
  "Copernicium",
  "Nihonium",
  "Flerovium",
  "Moscovium",
  "Livermorium",
  "Tennessine",
  "Oganesson"
];
const menuStyles = {
  maxHeight: "200px",
  overflowY: "auto",
  width: "150px",
  position: "absolute",
  margin: 0,
  borderTop: 0,
  background: "white"
};

function DropdownSelection() {
  const {
    isOpen,
    selectedItem,
    getTriggerButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps
  } = useDownshiftSelection({ items: options });
  return (
    <div>
      <label {...getLabelProps()}>Choose an element:</label>
      <button {...getTriggerButtonProps()}>{selectedItem || "Elements"}</button>
      <ul {...getMenuProps()} style={menuStyles}>
        {isOpen &&
          options.map((option, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: "#bde4ff" } : {}
              }
              key={`${option}${index}`}
              {...getItemProps({ item: option, index })}
            >
              {option}
            </li>
          ))}
      </ul>
    </div>
  );
}

render(<DropdownSelection />, document.getElementById("root"));
```

[selection]: https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html