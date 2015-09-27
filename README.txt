options

{
  from: 8,                // required - plain hour
  to: 19,                 // required
  step: 1,            
  unzones: [              // unavaible zones in time
    {
      start: 17,
      duration: 1
    }
  ]
}


This is a resource

{
  id: 1,
  title: '✈ F-GGBQ',      
  color: 'blue',          // red, yellow, green, grey
  shareable: true,        // the resource can be associated with other resources
  show: true,             // display on calendar or not
  hideIfNoData: false,
  highlight: true,        // highlight avaible blocks
  unzones: []             // overide options
  data: [
    {
      start: 9.5,         // decimal hour grid (9h30)
      duration: 1,        // duration of the block
      use: 4              // associate the block to resource(id=4)
      color: 'grey'       // overide resource color
    },
    {
      start: 10.5,
      duration: 3.5
    }
  ]
}