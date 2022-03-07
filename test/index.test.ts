/* eslint-disable @typescript-eslint/no-floating-promises */

import t from 'tap'
import { addCustomStyle, applyStyle, clean, colorize, deleteCustomStyle } from '../src/index.js'

t.test('applyStyle', t => {
  t.test('Applies known styles', t => {
    t.equal(applyStyle('ABC', 'bgBlack', 'red'), '\u001B[40m\u001B[31mABC\u001B[39m\u001B[49m\u001B[0m')
    t.end()
  })

  t.test('Ignores unknown styles', t => {
    t.equal(applyStyle('ABC', 'whatever', 'red'), '\u001B[31mABC\u001B[39m\u001B[0m')

    t.end()
  })

  t.test('Supports ANSI 256 colors, ignoring invalid colors', t => {
    t.equal(applyStyle('ABC', 'ANSI:232'), '\u001B[38;5;232mABC\u001B[39m\u001B[0m')
    t.equal(applyStyle('ABC', 'bgANSI:333'), 'ABC')
    t.equal(applyStyle('ABC', 'bgansi:2,4,0'), '\u001B[48;5;112mABC\u001B[49m\u001B[0m')
    t.equal(applyStyle('ABC', 'ANSI:2,4,6'), 'ABC')

    t.end()
  })

  t.test('Supports ANSI 16m RGB colors, ignoring invalid colors', t => {
    t.equal(applyStyle('ABC', 'rgb:255,232,0'), '\u001B[38;2;255;232;0mABC\u001B[39m\u001B[0m')
    t.equal(applyStyle('ABC', 'bgRGB:33,66,99'), '\u001B[48;2;33;66;99mABC\u001B[49m\u001B[0m')
    t.equal(applyStyle('ABC', 'bgRGB:999,999,999'), 'ABC')
    t.equal(applyStyle('ABC', 'bgRGB:1,999,999'), 'ABC')
    t.equal(applyStyle('ABC', 'bgRGB:1,2,999'), 'ABC')

    t.end()
  })

  t.test('Supports ANSI 16m HEX colors, ignoring invalid colors', t => {
    t.equal(applyStyle('ABC', 'hex:F0d030'), '\u001B[38;2;240;208;48mABC\u001B[39m\u001B[0m')
    t.equal(applyStyle('ABC', 'bgHEX:0099FF'), '\u001B[48;2;0;153;255mABC\u001B[49m\u001B[0m')
    t.equal(applyStyle('ABC', 'bgHEX:0099GG'), 'ABC')

    t.end()
  })

  t.end()
})

t.test('colorize', t => {
  t.test('Applies known styles and closes them in the right order', t => {
    t.equal(
      colorize('{{red}}ABC{{green}}CDE{{-}}EFG{{-}}HIJ'),
      '\u001B[31mABC\u001B[32mCDE\u001B[39m\u001B[31mEFG\u001B[39mHIJ\u001B[0m'
    )

    t.end()
  })

  t.test('Ignores unknown styles', t => {
    t.equal(colorize('{{red}}ABC{{yolla}}CDE{{-}}EFG{{-}}HIJ'), '\u001B[31mABCCDE\u001B[39mEFGHIJ\u001B[0m')

    t.end()
  })

  t.test('Ignores unbalanced parenthesis', t => {
    t.equal(colorize('{{red}}}}ABC{{-}}'), '\u001B[31m}}ABC\u001B[39m\u001B[0m')

    t.end()
  })

  t.test('Ignores unbalanced tags', t => {
    t.equal(colorize('{{red}}ABC'), '\u001B[31mABC\u001B[0m')

    t.end()
  })

  t.test('Closing tag ignores further specs', t => {
    t.equal(
      colorize('{{red}}ABC{{green}}CDE{{- yellow}}EFG{{-}}HIJ'),
      '\u001B[31mABC\u001B[32mCDE\u001B[39m\u001B[31mEFG\u001B[39mHIJ\u001B[0m'
    )

    t.end()
  })

  t.test('Reset tag cleans the stack', t => {
    t.equal(colorize('{{red}}ABC{{green}}CDE{{reset red}}EFG{{-}}HIJ'), '\u001B[31mABC\u001B[32mCDEEFGHIJ\u001B[0m')

    t.end()
  })

  t.test('Supports ANSI, RGB and HEX colors', t => {
    t.equal(
      colorize('{{ANSI:5,0,0}}ABC{{RGB:0,255,0}}CDE{{bgHEX:#0000FF}}EFG{{hex:0000FF}}GHI'),
      '\u001B[38;5;196mABC\u001B[38;2;0;255;0mCDE\u001B[48;2;0;0;255mEFG\u001B[38;2;0;0;255mGHI\u001B[0m'
    )

    t.end()
  })

  t.end()
})

t.test('clean', t => {
  t.test('Removes style tags from a template', t => {
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

t.test('addCustomStyle / deleteCustomStyle', t => {
  t.test('Allow to define custom styles, supported both by colorize and colorize', t => {
    t.equal(applyStyle('ABC', 'customRed@@'), 'ABC')
    t.equal(colorize('{{customRed@@ green}}ABC{{-}}'), '\u001B[32mABC\u001B[39m\u001B[0m')

    addCustomStyle('customRed@@', 'red', 'underline')

    t.equal(applyStyle('ABC', 'customRed@@'), '\u001B[31m\u001B[4mABC\u001B[24m\u001B[39m\u001B[0m')
    t.equal(
      colorize('{{customRed@@ green}}ABC{{-}}'),
      '\u001B[31m\u001B[4m\u001B[32mABC\u001B[39m\u001B[24m\u001B[39m\u001B[0m'
    )

    deleteCustomStyle('customRed@@')

    t.equal(applyStyle('ABC', 'customRed@@'), 'ABC')
    t.equal(colorize('{{customRed@@ green}}ABC{{-}}'), '\u001B[32mABC\u001B[39m\u001B[0m')

    t.end()
  })

  t.test('Should reject custom styles name which contain spaces or curly brace', t => {
    for (const s of ['{{invalid', 'invalid}}', 'no spaces']) {
      t.throws(() => addCustomStyle(s, 'red'), new Error('The custom style name cannot contain spaces or curly braces'))
    }

    t.end()
  })

  t.end()
})
