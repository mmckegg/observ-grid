var test = require('tape')
var Observ = require('observ')
var ObservGrid = require('../')
var ArrayGrid = require('array-grid')

test(function(t){

  t.plan(17)

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
  t.plan(9)
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

function invoke(f){
  return f()
}