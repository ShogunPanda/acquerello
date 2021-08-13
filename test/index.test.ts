/* eslint-disable @typescript-eslint/no-floating-promises */

import t from 'tap'
import { addCustomStyle, applyStyle, clean, colorize, deleteCustomStyle } from '../src'

type Test = typeof t

t.test('applyStyle', (t: Test) => {
  t.test('Applies known styles', (t: Test) => {
    t.equal(applyStyle('ABC', 'bgBlack', 'red'), '\x1b[40m\x1b[31mABC\x1b[39m\x1b[49m\x1b[0m')
    t.end()
  })

  t.test('Ignores unknown styles', (t: Test) => {
    t.equal(applyStyle('ABC', 'whatever', 'red'), '\x1b[31mABC\x1b[39m\x1b[0m')

    t.end()
  })

  t.test('Supports ANSI 256 colors, ignoring invalid colors', (t: Test) => {
    t.equal(applyStyle('ABC', 'ANSI:232'), '\x1b[38;5;232mABC\x1b[39m\x1b[0m')
    t.equal(applyStyle('ABC', 'bgANSI:333'), 'ABC')
    t.equal(applyStyle('ABC', 'bgansi:2,4,0'), '\x1b[48;5;112mABC\x1b[49m\x1b[0m')
    t.equal(applyStyle('ABC', 'ANSI:2,4,6'), 'ABC')

    t.end()
  })

  t.test('Supports ANSI 16m RGB colors, ignoring invalid colors', (t: Test) => {
    t.equal(applyStyle('ABC', 'rgb:255,232,0'), '\x1b[38;2;255;232;0mABC\x1b[39m\x1b[0m')
    t.equal(applyStyle('ABC', 'bgRGB:33,66,99'), '\x1b[48;2;33;66;99mABC\x1b[49m\x1b[0m')
    t.equal(applyStyle('ABC', 'bgRGB:999,999,999'), 'ABC')
    t.equal(applyStyle('ABC', 'bgRGB:1,999,999'), 'ABC')
    t.equal(applyStyle('ABC', 'bgRGB:1,2,999'), 'ABC')

    t.end()
  })

  t.test('Supports ANSI 16m HEX colors, ignoring invalid colors', (t: Test) => {
    t.equal(applyStyle('ABC', 'hex:F0d030'), '\x1b[38;2;240;208;48mABC\x1b[39m\x1b[0m')
    t.equal(applyStyle('ABC', 'bgHEX:0099FF'), '\x1b[48;2;0;153;255mABC\x1b[49m\x1b[0m')
    t.equal(applyStyle('ABC', 'bgHEX:0099GG'), 'ABC')

    t.end()
  })

  t.end()
})

t.test('colorize', (t: Test) => {
  t.test('Applies known styles and closes them in the right order', (t: Test) => {
    t.equal(
      colorize('{{red}}ABC{{green}}CDE{{-}}EFG{{-}}HIJ'),
      '\x1b[31mABC\x1b[32mCDE\x1b[39m\x1b[31mEFG\x1b[39mHIJ\x1b[0m'
    )

    t.end()
  })

  t.test('Ignores unknown styles', (t: Test) => {
    t.equal(colorize('{{red}}ABC{{yolla}}CDE{{-}}EFG{{-}}HIJ'), '\x1b[31mABCCDE\x1b[39mEFGHIJ\x1b[0m')

    t.end()
  })

  t.test('Ignores unbalanced parenthesis', (t: Test) => {
    t.equal(colorize('{{red}}}}ABC{{-}}'), '\x1b[31m}}ABC\x1b[39m\x1b[0m')

    t.end()
  })

  t.test('Ignores unbalanced tags', (t: Test) => {
    t.equal(colorize('{{red}}ABC'), '\x1b[31mABC\x1b[0m')

    t.end()
  })

  t.test('Closing tag ignores further specs', (t: Test) => {
    t.equal(
      colorize('{{red}}ABC{{green}}CDE{{- yellow}}EFG{{-}}HIJ'),
      '\x1b[31mABC\x1b[32mCDE\x1b[39m\x1b[31mEFG\x1b[39mHIJ\x1b[0m'
    )

    t.end()
  })

  t.test('Reset tag cleans the stack', (t: Test) => {
    t.equal(colorize('{{red}}ABC{{green}}CDE{{reset red}}EFG{{-}}HIJ'), '\x1b[31mABC\x1b[32mCDEEFGHIJ\x1b[0m')

    t.end()
  })

  t.test('Supports ANSI, RGB and HEX colors', (t: Test) => {
    t.equal(
      colorize('{{ANSI:5,0,0}}ABC{{RGB:0,255,0}}CDE{{bgHEX:#0000FF}}EFG{{hex:0000FF}}GHI'),
      '\x1b[38;5;196mABC\x1b[38;2;0;255;0mCDE\x1b[48;2;0;0;255mEFG\x1b[38;2;0;0;255mGHI\x1b[0m'
    )

    t.end()
  })

  t.end()
})

t.test('clean', (t: Test) => {
  t.test('Removes style tags from a template', (t: Test) => {
    t.equal(clean('{{red}}ABC{{green}}CDE{{-}}EFG{{-}}HIJ'), 'ABCCDEEFGHIJ')
    t.equal(clean('{{red}}ABC{{yolla}}CDE{{-}}EFG{{-}}HIJ'), 'ABCCDEEFGHIJ')
    t.equal(clean('{{red}}}ABC{{-}}'), '}ABC')
    t.equal(clean('{{red}}ABC'), 'ABC')
    t.equal(clean('{{{red}}'), '{')
    t.equal(clean('{{red}}ABC{{green}}CDE{{- yellow}}EFG{{-}}HIJ'), 'ABCCDEEFGHIJ')
    t.equal(clean('{{red}}ABC{{green}}CDE{{reset red}}EFG{{-}}HIJ'), 'ABCCDEEFGHIJ')
    t.equal(clean('{{ANSI:5,0,0}}ABC{{RGB:0,255,0}}CDE{{bgHEX:#0000FF}}EFG'), 'ABCCDEEFG')

    t.end()
  })

  t.end()
})

t.test('addCustomStyle / deleteCustomStyle', (t: Test) => {
  t.test('Allow to define custom styles, supported both by colorize and colorize', (t: Test) => {
    t.equal(applyStyle('ABC', 'customRed@@'), 'ABC')
    t.equal(colorize('{{customRed@@ green}}ABC{{-}}'), '\x1b[32mABC\x1b[39m\x1b[0m')

    addCustomStyle('customRed@@', 'red', 'underline')

    t.equal(applyStyle('ABC', 'customRed@@'), '\x1b[31m\x1b[4mABC\x1b[24m\x1b[39m\x1b[0m')
    t.equal(colorize('{{customRed@@ green}}ABC{{-}}'), '\x1b[31m\x1b[4m\x1b[32mABC\x1b[39m\x1b[24m\x1b[39m\x1b[0m')

    deleteCustomStyle('customRed@@')

    t.equal(applyStyle('ABC', 'customRed@@'), 'ABC')
    t.equal(colorize('{{customRed@@ green}}ABC{{-}}'), '\x1b[32mABC\x1b[39m\x1b[0m')

    t.end()
  })

  t.test('Should reject custom styles name which contain spaces or curly brace', (t: Test) => {
    for (const s of ['{{invalid', 'invalid}}', 'no spaces']) {
      t.throws(() => addCustomStyle(s, 'red'), new Error('The custom style name cannot contain spaces or curly braces'))
    }

    t.end()
  })

  t.end()
})
