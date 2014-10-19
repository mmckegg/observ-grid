var Observ = require('observ')
var ObservArray = require('observ-array')
var ArrayGrid = require('array-grid')

module.exports = ObservGrid

function ObservGrid(data, shape, stride){

  var self = Observ()

  self.data = typeof data == 'function' ? data : ObservArray(data)
  self.shape = typeof shape == 'function' ? shape : ObservArray(shape)
  self.stride = typeof stride == 'function' ? stride : ObservArray(stride || [shape[1], 1])

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
    self.data.transaction(function(rawList){
      for (var r=0;r<array.shape[0];r++){
        for (var c=0;c<array.shape[1];c++){
          var index = lastValue.index(originRow + r, originCol + c)
          if (index != null){
            rawList[index] = array.get(r, c)
          }
        }
      }
    })
  }

  self.transaction = function(func){
    self.data.transaction(function(data){
      var grid = ArrayGrid(data, self.shape(), self.stride())
      func(grid)
    })
  }

  self._removeListeners = [
  
    self.data(function(value){
      var shape = self.shape()
      var result = ArrayGrid(value, shape, self.stride())
      var length = shape[0] * shape[1]
      var diffs = result._diff = []

      for (var i=0;i<length;i++){
        if (result.data[i] !== lastValue.data[i]){
          var coords = self.coordsAt(i)
          if (coords){
            diffs.push([coords[0], coords[1], result.data[i]])
          }
        }
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