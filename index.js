var Observ = require('observ')
var ObservArray = require('observ-array')
var ArrayGrid = require('array-grid')

module.exports = ObservGrid

function ObservGrid(data, shape, stride){

  var self = Observ()

  self.data = typeof data == 'function' ? data : ObservArray(data)
  self.shape = ObservArray(shape)
  self.stride = ObservArray(stride || [shape[1], 1])

  // monkey patch data with transaction until native observ-array support
  self.data.transaction = require('./array-transaction.js')

  self._set = self.set

  var lastValue = ArrayGrid(self.data(), self.shape(), self.stride())

  self.set = function(row, col, value){
    if (row >= 0 && row < lastValue.shape[0] && col >= 0 && col < lastValue.shape[1]){
      self.data.put(self.index(row, col), value)
    }
  }

  self.get = function(row, col, value){
    return self.data.get(self.index(row, col))
  }

  self.index = function(row, col){
    return lastValue.index(row, col)
  }

  self.lookup = function(value){
    return lastValue.lookup(value)
  }

  self.coordsAt = function(index){
    return lastValue.coordsAt(index)
  }

  self.place = function(originRow, originCol, array){
    self.data.transaction(function(t){
      for (var r=0;r<array.shape[0];r++){
        for (var c=0;c<array.shape[1];c++){
          var index = lastValue.index(originRow + r, originCol + c)
          if (index != null){
            t.put(index, array.get(r, c))
          }
        }
      }
    })
  }

  self.transaction = function(func){
    self.data.transaction(function(data){
      var grid = ObservGrid(data, self.shape(), self.stride())
      func(grid)
    })
  }

  self._removeListeners = [
    self.data(function(value){
      var diffs = value._diff ? [value._diff] : value._diffs
      var result = ArrayGrid(value, self.shape(), self.stride())
      if (diffs){
        result._diff = diffs.map(function(diff){
          var coords = self.coordsAt(diff[0])
          return [coords[0], coords[1], diff[2]]
        })
      }
      lastValue = result
      self._set(result)
    }),
    self.shape(update),
    self.stride(update)
  ]

  update()

  return self

  /// scoped

  function update(){
    lastValue = ArrayGrid(self.data(), self.shape(), self.stride())
    self._set(lastValue)
  }
}