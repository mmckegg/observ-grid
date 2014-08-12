var Observ = require('observ')
var ObservArray = require('observ-array')
var ArrayGrid = require('array-grid')

module.exports = function(data, shape, stride){

  var self = Observ()

  self.data = ObservArray(data)
  self.shape = ObservArray(shape)
  self.stride = ObservArray(stride || [shape[1], 1])


  var set = self.set

  self.set = function(row, col, value){
    if (row >= 0 && row < self.shape()[0] && col >= 0 && col < self.shape()[1]){
      self.data.put(self.index(row, col), value)
    }
  }

  self.get = function(row, col, value){
    return self.data.get(self.index(row, col))
  }

  self.index = function(row, col){
    return self().index(row, col)
  }

  self.lookup = function(value){
    return self().lookup(value)
  }

  self.coordsAt = function(index){
    return self().coordsAt(index)
  }

  self.place = function(originRow, originCol, array){
    var grid = ArrayGrid(self.data().concat(), self.shape(), self.stride())
    grid.place(originRow, originCol, array)
    self.data.set(grid.data)
  }

  self._removeListeners = [
    self.data(function(value){
      var diff = value._diff
      var result = ArrayGrid(self.data(), self.shape(), self.stride())
      if (diff){
        result._diff = [self.coordsAt(diff[0]), diff[1]].concat(diff.slice(2))
      }
      set(result)
    }),
    self.shape(update),
    self.stride(update)
  ]

  update()

  return self

  /// scoped

  function update(){
    set(ArrayGrid(self.data(), self.shape(), self.stride()))
  }
}