var test = require('tape')
var ObservGrid = require('../')
var ObservGridGrabber = require('../grabber')

test(function(t){
  var grid = ObservGrid([], [2,2])
  var grab = ObservGridGrabber(grid)

  var changes1 = []
  var changes2 = []

  var release1 = grab(function(value){
    changes1.push(value.data)  
  })

  var release2 = grab(function(value){
    changes2.push(value.data)
  })

  t.deepEqual(changes1, [[]])
  t.deepEqual(changes2, [[]])
  changes1.length = changes2.length = 0



  grid.set(0,1, 'hello')
  grid.transaction(function(raw){
    raw.data[0] = 'data'
    raw.set(1,0, 'test')  
    raw.set(1,1, 'test2') 
  })

  t.deepEqual(changes1, [])
  t.deepEqual(changes2, [
    [undefined, 'hello'],
    ['data', 'hello', 'test', 'test2']
  ])

  changes1.length = changes2.length = 0
  t.end()
})