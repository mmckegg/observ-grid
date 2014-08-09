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
    self.data.put(self.index(row, col), value)
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

  self.place = function(originRow, originCol, array){
    var grid = ArrayGrid(self.data().concat(), self.shape(), self.stride())
    grid.place(originRow, originCol, array)
    self.data.set(grid.data)
  }

  var releases = [
    self.data(update),
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