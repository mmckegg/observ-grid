var ArrayGrid = require('array-grid')
var computed = require('observ/computed')

module.exports = mapGridValues
function mapGridValues(grid, trueValue){

  function mapColor(value){
    if (value){
      return trueValue
    }
  }

  return computed([grid], function computeMapGridValues(source){
    if (source){
      return ArrayGrid(source.data.map(mapColor), source.shape, source.stride)
    }
  })
}