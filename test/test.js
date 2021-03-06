var test = require('tape')
var Observ = require('observ')
var ObservGrid = require('../')
var ArrayGrid = require('array-grid')

test(function(t){

  t.plan(18)

  var grid = ObservGrid([0,1,2,3,4,5], [2,3])
  // 0 1 2
  // 3 4 5
  t.equal(grid.get(0,1), 1)
  t.equal(grid.get(1,0), 3)
  t.equal(grid.get(1,1), 4)

  // set
  var removeListeners = [
    grid.data(function(value){
      t.same(value._diff, [ [1, 1, 'A'] ])
      t.same(value, [0,'A',2,3,4,5])
    }),
    grid(function(value){
      t.ok(value instanceof ArrayGrid, 'emits fresh instance of array grid')
      t.same(value._diff, [ [0, 1, 'A'] ])
      t.same(value.data, [0,'A',2,3,4,5])
      t.equal(value.get(0,1), 'A')
      t.same(value.lookup('A'), [0,1])
    })
  ]
  grid.set(0,1, 'A')
  removeListeners.forEach(invoke)

  t.same(grid.lookup('A'), [0,1])
  t.same(grid.index(1,0), 3)

  // place
  var removeListeners = [
    grid.data(function(value){
      t.same(value, [0,'A','B',3,4,'C'])
    }),
    grid(function(value){
      t.same(value.data, [0,'A','B',3,4,'C'])
      t.equal(value.get(0,2), 'B')
      t.equal(value.get(1,2), 'C')
    })
  ]
  grid.place(0,2, ArrayGrid(['B', 'C'], [2,1]))
  removeListeners.forEach(invoke)

  // direct data update
  var removeListeners = [
    grid.data(function(value){
      t.same(value, [0,'A','B','Z',4,'C'])
    }),
    grid(function(value){
      t.equal(value.get(1,0), 'Z')
    })
  ]
  grid.data.put(3, 'Z')
  removeListeners.forEach(invoke)

  t.end()
})

test('nested observ', function(t){
  t.plan(10)
  var inner = Observ(0)
  var grid = ObservGrid([inner,1,2,3,4,5], [2,3])

  // set inner
  var removeListeners = [
    inner(function(value){
      t.equal(value, 'A')
    }),
    grid.data(function(value){
      t.same(value._diff, [ [ 0, 1, 'A' ] ])
      t.same(value, ['A',1,2,3,4,5])
    }),
    grid(function(value){
      t.same(value._diff, [ [ 0,0, 'A' ] ])
      t.equal(value.get(0,0), 'A')
    })
  ]
  inner.set('A')
  t.equal(grid.get(0,0), inner)
  removeListeners.forEach(invoke)

  // override with put
  var removeListeners = [
    inner(function(value){
      t.ok(false, 'this should not get called')
    }),
    grid.data(function(value){
      t.same(value._diff, [ [ 0, 1, 'B' ] ])
      t.same(value, ['B',1,2,3,4,5])
    }),
    grid(function(value){
      t.equal(value.get(0,0), 'B')
    })
  ]
  grid.set(0,0, 'B')
  t.equal(grid.get(0,0), 'B')
  removeListeners.forEach(invoke)
  t.end()
})

test('set beyond internal data.length', function(t){
  var grid = ObservGrid([0], [2,3])
  grid.set(1,2, 'Z')
  t.equal(grid.get(1,2), 'Z')
  t.same(grid.data(), [0,,,,,'Z'])
  t.end()
})

test('batch changes on `place`', function(t){
  var grid = ObservGrid([0,0,0,0,'Z',0], [2,3])
  var inner = ArrayGrid([1,2,'Z',3], [2,2])

  var changes = []
  grid(function(change){
    changes.push(change)
  })

  grid.place(0, 1, inner)


  t.equal(changes.length, 1, 'change count')
  t.same(changes[0].data, [
    0,  1,  2,
    0, 'Z', 3
  ])

  t.same(changes[0]._diff, [
    [0,1, 1],
    [0,2, 2],
    [1,2, 3]
  ])

  t.end()

})

test('data.splice emits multiple changes on value._diff', function(t){
  var grid = ObservGrid([1,2,3,4,5,6], [2,3])
  // 1 2 3
  // 4 5 6

  var changes = []
  grid(function(change){
    changes.push(change)
  })

  grid.data.splice(1,3, 'A')

  t.equal(changes.length, 1, 'change count')
  t.same(changes[0].data, [
    1, 'A', 5,
    6
  ])

  t.same(changes[0]._diff, [
    [0,1, 'A'],
    [0,2, 5],
    [1,0, 6],
    [1,1, undefined],
    [1,2, undefined]
  ])

  t.end()

})

test('transaction batch changes', function(t){
  var grid = ObservGrid([0,0,0,0,0,0], [2,3])
  var changes = []
  grid(function(change){
    changes.push(change)
  })

  grid.transaction(function(t){
    t.data[0] = 'X'
    t.set(0, 1, 'A')
    t.set(1, 1, 'B')
    t.place(0, 2, ArrayGrid(['C','D'], [2,1]))
  })

  t.equal(changes.length, 1, 'change count')
  t.same(changes[0].data, [
    'X', 'A', 'C',
    0, 'B', 'D'
  ])

  t.same(changes[0]._diff, [
    [0,0, 'X'],
    [0,1, 'A'],
    [0,2, 'C'],
    [1,1, 'B'],
    [1,2, 'D']
  ])

  t.end()

})

test('splice grid data diff', function(t){
  var grid = ObservGrid([0,1,2,3,4,5], [3,2])
  var changes = []
  grid(function(change){
    changes.push(change)
  })

  grid.transaction(function(raw){
    raw.data.splice(1,1)
    raw.data.splice(3,0, 'test')
  })

  t.equal(changes.length, 1, 'change count')
  t.same(changes[0].data, [0,2, 3, 'test', 4, 5])

  t.same(changes[0]._diff, [
    [0,1, 2],
    [1,0, 3],
    [1,1, 'test']
  ])

  t.end()

})

test('set beyond internal data array then transact back', function(t){
  var grid = ObservGrid([,,,], [2,2])

  var changes = []
  grid(function(change){
    changes.push(change)
  })

  grid.set(0,1, 'hello')
  grid.transaction(function(raw){
    raw.data[0] = 'data'
    raw.set(1,0, 'test')  
    raw.set(1,1, 'test2') 
  })

  t.equal(changes.length, 2, 'change count')
  t.same(changes[1].data, ['data', 'hello', 'test', 'test2'])

  t.same(changes[1]._diff, [
    [0,0, 'data'],
    [1,0, 'test'],
    [1,1, 'test2']
  ])

  t.end()
})


function invoke(f){
  return f()
}