import _ from 'lodash'
import StoryFunctions from '../functions'

export default class Interpreter {
  constructor (actions = []) {
    this.actions = _(actions).keyBy('id').mapValues((v) => JSON.parse(JSON.stringify(v))).value()
    this.story_maps = (new StoryFunctions()).map()
    // console.log(this.actions)
  }
  // Run
  run () {
    // Run
    let main = this.actions[0]
    if (_.isUndefined(main)) return
    this._innerRun(main)
    // console.log(this.story_maps['base.main'].apply(this))
  }
  // inner runner
  _innerRun (story, option = {}) {
    // 123
    // console.log(story)
    let func = this.story_maps[story.type]
    if (_.isUndefined(func)) return
    // ports
    let outPorts = story.ports.out
    let selfParams = story.params
    let runResult = func(option, selfParams)
    let self = this
    _.each(outPorts, function (v, k) {
      let links = v.links
      if (links.length > 0) {
        let selected = links[Math.floor(Math.random() * links.length)]
        // console.log(selected)
        let outputData = runResult[k]
        let inputData = { }
        inputData[selected.port] = outputData
        self._innerRun(self.actions[selected.id], inputData)
      }
    })
  }
}
