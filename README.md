# downshift-hooks
A set of hooks to build simple, flexible, WAI-ARIA compliant React dropdown components.

## The problem
You need an autocomplete/dropdown/select experience in your application and you
want it to be accessible. You also want it to be simple and flexible to account
for your use cases.

## This solution
This set of hooks is inspired by [downshift][downshift]
and aims to provide a set of hooks that will provide functionality and accessibility
to dropdown and combobox components.

At the moment, the first hook developed means to implement the [Single Selection][single-selection] ARIA design pattern. Its API is
designed to be similar to the one in old Downshift, aiming to be both flexible and powerful.

In the future a set of 3 new hooks should be implemented: Single Search, Multiple Selection
and Multiple Search. These 4 cases have different patterns specified by ARIA and users will
only use each one at a time, so it makes sense to have separate hooks for each. Their API
will be as similar as their design pattern allows them to be.

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```
npm install --save downshift
```

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

## Documentation

TODO

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[downshift]: https://github.com/downshift-js/downshift
[single-selection]: https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
