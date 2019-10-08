# acquerello

[![Package Version](https://img.shields.io/npm/v/acquerello.svg)](https://npm.im/acquerello)
[![Dependency Status](https://img.shields.io/david/ShogunPanda/acquerello)](https://david-dm.org/ShogunPanda/acquerello)
[![Build](https://img.shields.io/circleci/build/gh/ShogunPanda/acquerello?token=a721161f936393ce2826774e8b89c0785c06967b)](https://circleci.com/gh/ShogunPanda/acquerello)
[![Code Coverage](https://img.shields.io/codecov/c/gh/ShogunPanda/acquerello?token=d0ae1643f35c4c4f9714a357f796d05d)](https://codecov.io/gh/ShogunPanda/acquerello)

Template based terminal coloring made really easy.

http://sw.cowtech.it/acquerello

## Usage

Acquerello allows to add coloring to terminal in a really easy way.

### Colorize templates

To colorize a template using template syntax, simply use the `colorize` function.

```javascript
import { colorize } from 'acquerello'

console.log(colorize('{{red}}This is in red, {{green underline}}this in green underlined{{-}}, this in red again.'))
```

The template recognizes styles between double curly braces and the token `{{-}}` as universal closing tag (which also restores the previous style).

Acquerello supports all colors codes recognized by [ansi-style](https://npm.im/ansi-styles) (and therefore by [chalk](https://npm.im/chalk)).

The closing tag at the end of the string can be omitted, since acquerello will append the global reset style (`\x1b[0m`) if any style was set.

If you want to discard the styles to be restored, use the `{{reset}}` token.

### Setting custom styles

If you want to define custom styles, use the `addCustomStyle` function.

```javascript
import { colorize, addCustomStyle } from 'acquerello'

addCustomStyle('important')
console.log(colorize('{{important}}This is in red, underlined.{{-}}'))
```

### 256 and 16 millions colors support

acquerello supports 256 ANSI codes and 16m RGB colors. Just give it a try:

```javascript
import { colorize } from 'acquerello'

console.log(colorize('{{ansi:100}}color me{{-}}'))
console.log(colorize('{{bgANSI:3,4,5}}color me{{-}}'))

console.log(colorize('{{rgb:255,0,0}}color me{{-}}'))
console.log(colorize('{{bgRGB:0,255,0}}color me{{-}}'))

console.log(colorize('{{hex:#FF0000}}color me{{-}}'))
console.log(colorize('{{bgHEX:00FF00}}color me{{-}}'))
```

ANSI, RGB, and HEX can be used in style definitions and templates as well.

### Colorize strings

To colorize strings, simply use the `applyStyle`, passing a list of styles you want to apply.

```javascript
import { applyStyle } from 'acquerello'

const inRed = applyStyle('Colorized', 'red')
const inRedWithBlueBackground = applyStyle('Colorized', 'red bgBlue')
```

## Contributing to acquerello

- Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet.
- Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it.
- Fork the project.
- Start a feature/bugfix branch.
- Commit and push until you are happy with your contribution.
- Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.

## Copyright

Copyright (C) 2019 and above Shogun (shogun@cowtech.it).

Licensed under the ISC license, which can be found at https://choosealicense.com/licenses/isc.
