# downshift-hooks

A set of hooks to build simple, flexible, WAI-ARIA compliant React dropdown components.

[![Build Status](https://travis-ci.org/silviuavram/downshift-hooks.svg?branch=master)](https://travis-ci.org/silviuavram/downshift-hooks)

## The problem

You need an autocomplete/dropdown/select experience in your application and you
want it to be accessible. You also want it to be simple and flexible to account
for your use cases.

## This solution

This set of hooks is inspired by [downshift][downshift] and aims to provide functionality and accessibility to dropdown and combobox components.

At the moment, the first hook developed is `Selection` means to implement the [collapsible dropdown][collapsible-dropdown] ARIA design pattern.

In the future a set of 3 new hooks should be implemented: `Search`, `Multiple Selection` and `Multiple Search`. These 4 cases have different patterns 
specified by ARIA and users will only use each one at a time, so it makes sense to have separate hooks for each.

The API will be as similar as possible for each of these hooks and will follow the one already present in Downshift. Differences will appear only when
the design pattern requires for them to do so.

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```
npm install --save downshift-hooks
```

## Hooks

### Selection

For collapsible dropdown with a single selection, [click here][selection-readme].

## Documentation

TODO

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[downshift]: https://github.com/downshift-js/downshift
[collapsible-dropdown]: https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
[selection-readme]: https://github.com/silviuavram/downshift-hooks/blob/master/src/hooks/downshiftSelection/README.md
