import _ from 'lodash'
import StoryFunctions from '../functions'

export default class Interpreter {
  constructor (actions = []) {
    this.actions = _(actions).keyBy('id').value()
    this.story_maps = (new StoryFunctions()).map()
  }
  // Run
  run () {
    // Run
    let main = this.actions[0]
    if (_.isUndefined(main)) return
    console.log('> Player start')
    this._runCount = 0
    this._final_result = ''
    this._innerRun(main)
    console.log(`> ${this._runCount} line(s)`)
    return this._final_result
  }
  // inner runner
  _innerRun (story, option = {}) {
    let func = this.story_maps[story.type]
    if (_.isUndefined(func)) return
    // ports
    let outPorts = story.ports.out
    let selfParams = story.params
    let runResult = func(option, selfParams)
    this._runCount++
    if (story.type === 'base.log') this._final_result = runResult
    _.each(outPorts, (v, k) => {
      let links = v.links
      if (links.length > 0) {
        let selected = links[Math.floor(Math.random() * links.length)]
        // console.log(selected)
        let outputData = runResult[k]
        let inputData = { }
        inputData[selected.port] = outputData
        this._innerRun(this.actions[selected.id], inputData)
      }
    })
    return runResult
  }
}
