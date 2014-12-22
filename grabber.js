var ObservGrid = require('./')

module.exports = function ObservGridGrabber(grid){
  var grabs = []

  grab.remove = grid(function(value){
    if (value._diff){
      update(value._diff)
    }
  })

  return grab

  function update(diffs, fromIndex){
    var assigned = []
    var length = grid.shape()[0] * grid.shape()[1]
    grabs.forEach(function(obj, i){
      if (!fromIndex || i >= fromIndex){
        var changes = []
        diffs.forEach(function(change){
          var index = getIndex(change)
          if (!~assigned.indexOf(index) && includesIndex(obj, index)){
            changes.push(change)
            assigned.push(index)
          }
        })
        if (changes.length){
          obj.grid.transaction(function(val){
            changes.forEach(function(change){
              val.set(change[0], change[1], change[2])
            })
          })
        }
      }
    })
  }

  function getChanges(obj){
    var changes = []
    obj.grid.data.forEach(function(val, i){
      if (includesIndex(obj, i)){
        var coords = grid.coordsAt(i)
        changes.push([coords[0], coords[1], val])
      }
    })
    return changes
  }

  function getIndex(coords){
    if (Array.isArray(coords)){
      return grid.index(coords[0], coords[1])
    } else {
      return coords
    }
  }

  function doGrab(obj){
    var current = grid()
    var values = []

    if (obj.indexes || obj.exclude){
      for (var i=0;i<current.data.length;i++){
        if (includesIndex(obj, i)){
          values[i] = current[i]
        }
      }
    } else {
      values = grid.data()
    }

    obj.grid = ObservGrid(values, grid.shape(), grid.stride())
    var releaseGrabHandler = obj.grid(obj.handler)

    grabs.unshift(obj)

    obj.handler(obj.grid())

    return function release(){
      releaseGrabHandler()
      var index = grabs.indexOf(obj)
      if (~index){
        grabs.splice(index, 1)
        var changes = getChanges(obj)
        update(changes, index)
      }
    }
  }

  function grab(obj, handler){
    if (!arguments.length){
      return grid()
    } else if (typeof obj == 'function' && !handler){
      handler = obj
      return doGrab({handler: handler})
    } else if (Array.isArray(obj)){
      return doGrab({
        indexes: obj,
        handler: handler
      })
    } else if (obj.indexes) {
      return doGrab({
        indexes: obj.indexes, 
        handler: handler
      })
    } else if (obj.exclude){
      return doGrab({
        exclude: obj.exclude, 
        handler: handler
      })
    } else {
      return doGrab({handler: handler})
    }
  }
}

function includesIndex(obj, index){
  return (!obj.indexes && !obj.exclude) || 
    (obj.exclude && !~obj.exclude().indexOf(index)) ||
    (obj.indexes && ~obj.indexes().indexOf(index))
}