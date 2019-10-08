import { addCustomStyle, applyStyle, clean, colorize, deleteCustomStyle } from '../src'

describe('applyStyle', () => {
  it('Applies known styles', () => {
    expect(applyStyle('ABC', 'bgBlack', 'red')).toEqual('\x1b[40m\x1b[31mABC\x1b[39m\x1b[49m\x1b[0m')
  })

  it('Ignores unknown styles', () => {
    expect(applyStyle('ABC', 'whatever', 'red')).toEqual('\x1b[31mABC\x1b[39m\x1b[0m')
  })

  it('Supports ANSI 256 colors, ignoring invalid colors', () => {
    expect(applyStyle('ABC', 'ANSI:232')).toEqual('\x1b[38;5;232mABC\x1b[39m\x1b[0m')
    expect(applyStyle('ABC', 'bgANSI:333')).toEqual('ABC')
    expect(applyStyle('ABC', 'bgansi:2,4,0')).toEqual('\x1b[48;5;112mABC\x1b[49m\x1b[0m')
    expect(applyStyle('ABC', 'ANSI:2,4,6')).toEqual('ABC')
  })

  it('Supports ANSI 16m RGB colors, ignoring invalid colors', () => {
    expect(applyStyle('ABC', 'rgb:255,232,0')).toEqual('\x1b[38;2;255;232;0mABC\x1b[39m\x1b[0m')
    expect(applyStyle('ABC', 'bgRGB:33,66,99')).toEqual('\x1b[48;2;33;66;99mABC\x1b[49m\x1b[0m')
    expect(applyStyle('ABC', 'bgRGB:999,999,999')).toEqual('ABC')
    expect(applyStyle('ABC', 'bgRGB:1,999,999')).toEqual('ABC')
    expect(applyStyle('ABC', 'bgRGB:1,2,999')).toEqual('ABC')
  })

  it('Supports ANSI 16m HEX colors, ignoring invalid colors', () => {
    expect(applyStyle('ABC', 'hex:F0d030')).toEqual('\x1b[38;2;240;208;48mABC\x1b[39m\x1b[0m')
    expect(applyStyle('ABC', 'bgHEX:0099FF')).toEqual('\x1b[48;2;0;153;255mABC\x1b[49m\x1b[0m')
    expect(applyStyle('ABC', 'bgHEX:0099GG')).toEqual('ABC')
  })
})

describe('colorize', () => {
  it('Applies known styles and closes them in the right order', () => {
    expect(colorize('{{red}}ABC{{green}}CDE{{-}}EFG{{-}}HIJ')).toEqual(
      '\x1b[31mABC\x1b[32mCDE\x1b[39m\x1b[31mEFG\x1b[39mHIJ\x1b[0m'
    )
  })

  it('Ignores unknown styles', () => {
    expect(colorize('{{red}}ABC{{yolla}}CDE{{-}}EFG{{-}}HIJ')).toEqual('\x1b[31mABCCDE\x1b[39mEFGHIJ\x1b[0m')
  })

  it('Ignores unbalanced parenthesis', () => {
    expect(colorize('{{red}}}}ABC{{-}}')).toEqual('\x1b[31m}}ABC\x1b[39m\x1b[0m')
  })

  it('Ignores unbalanced tags', () => {
    expect(colorize('{{red}}ABC')).toEqual('\x1b[31mABC\x1b[0m')
  })

  it('Closing tag ignores further specs', () => {
    expect(colorize('{{red}}ABC{{green}}CDE{{- yellow}}EFG{{-}}HIJ')).toEqual(
      '\x1b[31mABC\x1b[32mCDE\x1b[39m\x1b[31mEFG\x1b[39mHIJ\x1b[0m'
    )
  })

  it('Reset tag cleans the stack', () => {
    expect(colorize('{{red}}ABC{{green}}CDE{{reset red}}EFG{{-}}HIJ')).toEqual('\x1b[31mABC\x1b[32mCDEEFGHIJ\x1b[0m')
  })

  it('Supports ANSI, RGB and HEX colors', () => {
    expect(colorize('{{ANSI:5,0,0}}ABC{{RGB:0,255,0}}CDE{{bgHEX:#0000FF}}EFG{{hex:0000FF}}GHI')).toEqual(
      '\x1b[38;5;196mABC\x1b[38;2;0;255;0mCDE\x1b[48;2;0;0;255mEFG\x1b[38;2;0;0;255mGHI\x1b[0m'
    )
  })
})

describe('clean', () => {
  it('Removes style tags from a template', () => {
    expect(clean('{{red}}ABC{{green}}CDE{{-}}EFG{{-}}HIJ')).toEqual('ABCCDEEFGHIJ')
    expect(clean('{{red}}ABC{{yolla}}CDE{{-}}EFG{{-}}HIJ')).toEqual('ABCCDEEFGHIJ')
    expect(clean('{{red}}}ABC{{-}}')).toEqual('}ABC')
    expect(clean('{{red}}ABC')).toEqual('ABC')
    expect(clean('{{{red}}')).toEqual('{')
    expect(clean('{{red}}ABC{{green}}CDE{{- yellow}}EFG{{-}}HIJ')).toEqual('ABCCDEEFGHIJ')
    expect(clean('{{red}}ABC{{green}}CDE{{reset red}}EFG{{-}}HIJ')).toEqual('ABCCDEEFGHIJ')
    expect(clean('{{ANSI:5,0,0}}ABC{{RGB:0,255,0}}CDE{{bgHEX:#0000FF}}EFG')).toEqual('ABCCDEEFG')
  })
})

describe('addCustomStyle / deleteCustomStyle', () => {
  it('Allow to define custom styles, supported both by colorize and colorize', () => {
    expect(applyStyle('ABC', 'customRed@@')).toEqual('ABC')
    expect(colorize('{{customRed@@ green}}ABC{{-}}')).toEqual('\x1b[32mABC\x1b[39m\x1b[0m')

    addCustomStyle('customRed@@', 'red', 'underline')

    expect(applyStyle('ABC', 'customRed@@')).toEqual('\x1b[31m\x1b[4mABC\x1b[24m\x1b[39m\x1b[0m')
    expect(colorize('{{customRed@@ green}}ABC{{-}}')).toEqual(
      '\x1b[31m\x1b[4m\x1b[32mABC\x1b[39m\x1b[24m\x1b[39m\x1b[0m'
    )

    deleteCustomStyle('customRed@@')

    expect(applyStyle('ABC', 'customRed@@')).toEqual('ABC')
    expect(colorize('{{customRed@@ green}}ABC{{-}}')).toEqual('\x1b[32mABC\x1b[39m\x1b[0m')
  })

  it('Should reject custom styles name which contain spaces or curly brace', () => {
    for (const s of ['{{invalid', 'invalid}}', 'no spaces']) {
      expect(() => addCustomStyle(s, 'red')).toThrow(
        new Error('The custom style name cannot contain spaces or curly braces')
      )
    }
  })
})
