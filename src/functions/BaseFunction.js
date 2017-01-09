export default class BaseFunction {
  static _prefix = 'base'
  // Return empty string
  static _main = {
    input: [],
    output: [{
      name: 'content',
      type: 'string'
    }],
    params: [{
      name: 'text',
      type: 'string'
    }],
    link: BaseFunction.main
  }
  static main (option = {}, params = {'text': ''}) {
    return {
      content: params.text
    }
  }
  // Connect text
  static _text = {
    input: [{
      name: 'content',
      type: 'string'
    }],
    output: [{
      name: 'content',
      type: 'string'
    }],
    params: [{
      name: 'text',
      type: 'string'
    }],
    link: BaseFunction.text
  }
  static text (option = {'content': ''}, params = {'text': ''}) {
    let content = option.content + '\n'
    let text = params.text
    return {
      content: content + text
    }
  }
  // Log
  // Connect text
  static _log = {
    input: [{
      name: 'content',
      type: 'string'
    }],
    output: [],
    params: [{
      name: 'text',
      type: 'string'
    }],
    link: BaseFunction.log
  }
  static log (option = {'content': ''}, params = {'text': ''}) {
    let content = option.content + '\n' + params.text
    console.log(content)
  }
}
