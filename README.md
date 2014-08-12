observ-grid
===

An observable array-grid.

Allows all the same operations as [array-grid](https://github.com/mmckegg/array-grid), but is [observable](https://github.com/raynos/observ-array).

## Install via [npm](https://npmjs.org/package/observ-grid)

```bash
$ npm install observ-grid
```

## API

```js
var ObservGrid = require('observ-grid')
```

### var grid = ObservGrid(data, shape[, stride])

- `data` is a 1D array storage. It is either an instance of Array or a typed array.
- `shape` is the shape of the view (Default: `[data.length, 1]`)
- `stride` is the resulting stride of the new array. (Default: row major `[shape[1], 1]`)
- `offset` is the offset to start the view (Default: 0)

Returns a 2-dimensional array view of the underlying data.

### `grid.get(row, col)`

Get the value at the position specified.

### `grid.set(row, col, value)`

Set the value of the position specified. Notifies all observers.

### `grid.index(row, col)`

Get the interal 1d `data` index of the specified coordinates.

### `grid.lookup(value)`

Lookup the `[row,col]` coordinates of the specified `value`.

### `grid.coordsAt(index)`

Lookup the `[row,col]` coordinates of the specified 1d `index`.

### `grid.place(originRow, originCol, array)`

Stamp another ArrayGrid or two-dimensional ndarray starting at the origin specified. Batches changes then notifies all observers.

### `grid.transaction(func)`

Batch changes together. `func` will be called with a mutable ArrayGrid which can be modified. On return, the data will be diffed against original and merged into the `grid`. A single observ notification will be triggered.

## Observable Attributes

### `grid`

The grid itself is observable and will notify on all changes.

```js
var grid = ObservGrid([0,1,2,3,4,5], [2,3])
var removeListener = grid(function(value){
  // value is a new instance of ArrayGrid with the updated data
  console.log(value._diff) //= [ [0, 1, 'A'] ]
  console.log(value.get(0, 1)) //= 'A'
  console.log(value.data) //= ['A', 1, 2, 3, 4, 5]
})
grid.set(0, 1, 'A')

// clean up event handler
removeListener()
```

### `grid.data` ([ObservArray](https://github.com/raynos/observ-array))

The underlying one-dimensional array holding the data. This can be modified directly and observers will be notified.

### `grid.shape` (ObservArray)

`[rows,columns]` of the grid.

### `grid.stride` (ObservArray)