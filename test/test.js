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
      t.same(value._diff, [1, 1, 'A'])
      t.same(value, [0,'A',2,3,4,5])
    }),
    grid(function(value){
      t.ok(value instanceof ArrayGrid, 'emits fresh instance of array grid')
      t.same(value._diff, [[0, 1, 'A']])
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
      t.same(value._diff, [ 0, 1, 'A' ])
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
      t.same(value._diff, [ 0, 1, 'B' ])
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
    [1,1, 'Z'], //TODO: should not be emitted as this is not a change
    [1,2, 3]
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
    t.set(0, 1, 'A')
    t.set(1, 1, 'B')
    t.place(0, 2, ArrayGrid(['C','D'], [2,1]))
  })

  t.equal(changes.length, 1, 'change count')
  t.same(changes[0].data, [
    0, 'A', 'C',
    0, 'B', 'D'
  ])

  t.same(changes[0]._diff, [
    [0,1, 'A'],
    [1,1, 'B'],
    [0,2, 'C'],
    [1,2, 'D']
  ])

  t.end()

})

function invoke(f){
  return f()
}