import { deepStrictEqual, throws } from 'node:assert'
import { test } from 'node:test'
import { addCustomStyle, applyStyle, clean, colorize, deleteCustomStyle } from '../src/index.js'

test('applyStyle', async () => {
  await test('Applies known styles', () => {
    deepStrictEqual(applyStyle('ABC', 'bgBlack', 'red'), '\u001B[40m\u001B[31mABC\u001B[39m\u001B[49m\u001B[0m')
  })

  await test('Ignores unknown styles', () => {
    deepStrictEqual(applyStyle('ABC', 'whatever', 'red'), '\u001B[31mABC\u001B[39m\u001B[0m')
  })

  await test('Supports ANSI 256 colors, ignoring invalid colors', () => {
    deepStrictEqual(applyStyle('ABC', 'ANSI:232'), '\u001B[38;5;232mABC\u001B[39m\u001B[0m')
    deepStrictEqual(applyStyle('ABC', 'bgANSI:333'), 'ABC')
    deepStrictEqual(applyStyle('ABC', 'bgansi:2,4,0'), '\u001B[48;5;112mABC\u001B[49m\u001B[0m')
    deepStrictEqual(applyStyle('ABC', 'ANSI:2,4,6'), 'ABC')
  })

  await test('Supports ANSI 16m RGB colors, ignoring invalid colors', () => {
    deepStrictEqual(applyStyle('ABC', 'rgb:255,232,0'), '\u001B[38;2;255;232;0mABC\u001B[39m\u001B[0m')
    deepStrictEqual(applyStyle('ABC', 'bgRGB:33,66,99'), '\u001B[48;2;33;66;99mABC\u001B[49m\u001B[0m')
    deepStrictEqual(applyStyle('ABC', 'bgRGB:999,999,999'), 'ABC')
    deepStrictEqual(applyStyle('ABC', 'bgRGB:1,999,999'), 'ABC')
    deepStrictEqual(applyStyle('ABC', 'bgRGB:1,2,999'), 'ABC')
  })

  await test('Supports ANSI 16m HEX colors, ignoring invalid colors', () => {
    deepStrictEqual(applyStyle('ABC', 'hex:F0d030'), '\u001B[38;2;240;208;48mABC\u001B[39m\u001B[0m')
    deepStrictEqual(applyStyle('ABC', 'bgHEX:0099FF'), '\u001B[48;2;0;153;255mABC\u001B[49m\u001B[0m')
    deepStrictEqual(applyStyle('ABC', 'bgHEX:0099GG'), 'ABC')
  })
})

test('colorize', async () => {
  await test('Applies known styles and closes them in the right order', () => {
    deepStrictEqual(
      colorize('{{red}}ABC{{green}}CDE{{-}}EFG{{-}}HIJ'),
      '\u001B[31mABC\u001B[32mCDE\u001B[39m\u001B[31mEFG\u001B[39mHIJ\u001B[0m'
    )
  })

  await test('Ignores unknown styles', () => {
    deepStrictEqual(colorize('{{red}}ABC{{yolla}}CDE{{-}}EFG{{-}}HIJ'), '\u001B[31mABCCDE\u001B[39mEFGHIJ\u001B[0m')
  })

  await test('Ignores unbalanced parenthesis', () => {
    deepStrictEqual(colorize('{{red}}}}ABC{{-}}'), '\u001B[31m}}ABC\u001B[39m\u001B[0m')
  })

  await test('Ignores unbalanced tags', () => {
    deepStrictEqual(colorize('{{red}}ABC'), '\u001B[31mABC\u001B[0m')
  })

  await test('Closing tag ignores further specs', () => {
    deepStrictEqual(
      colorize('{{red}}ABC{{green}}CDE{{- yellow}}EFG{{-}}HIJ'),
      '\u001B[31mABC\u001B[32mCDE\u001B[39m\u001B[31mEFG\u001B[39mHIJ\u001B[0m'
    )
  })

  await test('Reset tag cleans the stack', () => {
    deepStrictEqual(
      colorize('{{red}}ABC{{green}}CDE{{reset red}}EFG{{-}}HIJ'),
      '\u001B[31mABC\u001B[32mCDEEFGHIJ\u001B[0m'
    )
  })

  await test('Supports ANSI, RGB and HEX colors', () => {
    deepStrictEqual(
      colorize('{{ANSI:5,0,0}}ABC{{RGB:0,255,0}}CDE{{bgHEX:#0000FF}}EFG{{hex:0000FF}}GHI'),
      '\u001B[38;5;196mABC\u001B[38;2;0;255;0mCDE\u001B[48;2;0;0;255mEFG\u001B[38;2;0;0;255mGHI\u001B[0m'
    )
  })
})

test('clean', async () => {
  await test('Removes style tags from a template', () => {
    deepStrictEqual(clean('{{red}}ABC{{green}}CDE{{-}}EFG{{-}}HIJ'), 'ABCCDEEFGHIJ')
    deepStrictEqual(clean('{{red}}ABC{{yolla}}CDE{{-}}EFG{{-}}HIJ'), 'ABCCDEEFGHIJ')
    deepStrictEqual(clean('{{red}}}ABC{{-}}'), '}ABC')
    deepStrictEqual(clean('{{red}}ABC'), 'ABC')
    deepStrictEqual(clean('{{{red}}'), '{')
    deepStrictEqual(clean('{{red}}ABC{{green}}CDE{{- yellow}}EFG{{-}}HIJ'), 'ABCCDEEFGHIJ')
    deepStrictEqual(clean('{{red}}ABC{{green}}CDE{{reset red}}EFG{{-}}HIJ'), 'ABCCDEEFGHIJ')
    deepStrictEqual(clean('{{ANSI:5,0,0}}ABC{{RGB:0,255,0}}CDE{{bgHEX:#0000FF}}EFG'), 'ABCCDEEFG')
  })
})

test('addCustomStyle / deleteCustomStyle', async () => {
  await test('Allow to define custom styles, supported both by colorize and colorize', () => {
    deepStrictEqual(applyStyle('ABC', 'customRed@@'), 'ABC')
    deepStrictEqual(colorize('{{customRed@@ green}}ABC{{-}}'), '\u001B[32mABC\u001B[39m\u001B[0m')

    addCustomStyle('customRed@@', 'red', 'underline')

    deepStrictEqual(applyStyle('ABC', 'customRed@@'), '\u001B[31m\u001B[4mABC\u001B[24m\u001B[39m\u001B[0m')
    deepStrictEqual(
      colorize('{{customRed@@ green}}ABC{{-}}'),
      '\u001B[31m\u001B[4m\u001B[32mABC\u001B[39m\u001B[24m\u001B[39m\u001B[0m'
    )

    deleteCustomStyle('customRed@@')

    deepStrictEqual(applyStyle('ABC', 'customRed@@'), 'ABC')
    deepStrictEqual(colorize('{{customRed@@ green}}ABC{{-}}'), '\u001B[32mABC\u001B[39m\u001B[0m')
  })

  await test('Should reject custom styles name which contain spaces or curly brace', () => {
    for (const s of ['{{invalid', 'invalid}}', 'no spaces']) {
      throws(() => {
        addCustomStyle(s, 'red')
      }, new Error('The custom style name cannot contain spaces or curly braces'))
    }
  })
})
