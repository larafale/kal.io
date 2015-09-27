var moment = require('moment')
  , faker = require('faker')

faker.locale = "fr"

var random = {
  color: function(){ return faker.helpers.randomize(['green' ,'red' ,'blue' ,'yellow' ,'orange' ,'grey']) }
}

module.exports = function(){
  return {

    'demo-foot': {

      Account: [
        { $idx: 1, namespace: 'demo-foot', config: { public: true, from: 9, to: 24, grid: 1 } } // , unzones: [{ start: 12.5, duration: 1.5 }]
      ],

      User: [
        { $idx: 100, name: 'Admin', password: 'demo', login: 'demo', role: 'admin', $ref: 'Account:1:record:namespace' },
        { $idx: 1, name: 'Team Seb C.', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 2, name: 'Team Allopneus', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 3, name: 'Team Banane', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 4, name: 'Team ParuVendu', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 5, name: 'Team Momo', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 6, name: 'Team RokkatMarseille', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 7, name: 'Team Patrick', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 8, name: 'Team Dinguo', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 9, name: 'Team LesBrasKC', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 10, name: 'Team 4Fun', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 11, name: 'Team Flinguée', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 12, name: 'Team Maurice', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 13, name: 'Team Lespotos', password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' }




      ],

      Resource: [
        { $idx: 1, title: '5v5 Indoor 1', selectable: true, color: random.color(), $ref: 'Account:1:record:namespace' },
        { $idx: 2, title: '5v5 Indoor 2', selectable: true, color: random.color(), $ref: 'Account:1:record:namespace' },
        { $idx: 3, title: '5v5 Outdoor 1', selectable: true, color: random.color(), $ref: 'Account:1:record:namespace' },
        { $idx: 4, title: '5v5 Outdoor 2', selectable: true, color: random.color(), $ref: 'Account:1:record:namespace' },
        { $idx: 5, title: '5v5 Outdoor 3', selectable: true, color: random.color(), $ref: 'Account:1:record:namespace' },
      ],

      Block: [
        { start: 10, duration: 1, end: 11, day: moment().startOf('d').toDate(), note: 'On aimerait rester plus longtemp si ya personne derriere nous', $ref: ['Resource:1:record:resource', 'User:1:record:user'] },
        { start: 11, duration: 2, end: 13, day: moment().startOf('d').toDate(), note : 'On paye en CB', $ref: ['Resource:1:record:resource', 'User:2:record:user'] },
        { start: 16, duration: 1, end: 17, day: moment().startOf('d').toDate(), $ref: ['Resource:1:record:resource', 'User:3:record:user'] },
        { start: 18, duration: 2, end: 20, day: moment().startOf('d').toDate(), $ref: ['Resource:2:record:resource', 'User:4:record:user'] },
        { start: 18, duration: 1, end: 19, day: moment().startOf('d').toDate(), $ref: ['Resource:5:record:resource', 'User:5:record:user'] },
        { start: 18, duration: 1, end: 19, day: moment().startOf('d').toDate(), note : 'on vient mater le match juste après aussi', $ref: ['Resource:3:record:resource', 'User:6:record:user'] },
        { start: 14, duration: 2, end: 16, day: moment().startOf('d').toDate(), $ref: ['Resource:4:record:resource', 'User:7:record:user'] },
        { start: 11, duration: 2, end: 13, day: moment().startOf('d').toDate(), $ref: ['Resource:3:record:resource', 'User:8:record:user'] },
        { start: 9, duration: 1, end: 10, day: moment().startOf('d').toDate(), $ref: ['Resource:4:record:resource', 'User:9:record:user'] },
        { start: 11, duration: 1, end: 12, day: moment().startOf('d').toDate(), $ref: ['Resource:5:record:resource', 'User:10:record:user'] },
        { start: 13, duration: 1, end: 14, day: moment().startOf('d').toDate(), $ref: ['Resource:2:record:resource', 'User:11:record:user'] },
        { start: 21, duration: 2, end: 23, day: moment().startOf('d').toDate(), $ref: ['Resource:4:record:resource', 'User:12:record:user'] },
        { start: 21, duration: 1, end: 22, day: moment().startOf('d').toDate(), $ref: ['Resource:1:record:resource', 'User:13:record:user'] },


      ]
    
    },

    'demo-avion': {

      Account: [
        { $idx: 1, namespace: 'demo-avion', config: { public: true, from: 9, to: 19, grid: 0.5 } } // , unzones: [{ start: 12.5, duration: 1.5 }]
      ],

      User: [
        { $idx: 100, name: 'Admin', password: 'demo', login: 'demo', role: 'admin', $ref: 'Account:1:record:namespace' },
        { $idx: 1, name: faker.name.firstName()+' '+faker.name.lastName(), password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 2, name: faker.name.firstName()+' '+faker.name.lastName(), password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' },
        { $idx: 3, name: faker.name.firstName()+' '+faker.name.lastName(), password: 'demo', login: faker.internet.userName(), role: 'user', $ref: 'Account:1:record:namespace' }
      ],

      Resource: [
        { $idx: 1, title: '✈ Piper PA28', selectable: true, color: 'orange', $ref: 'Account:1:record:namespace' },
        { $idx: 2, title: '✈ DR400', selectable: true, color: 'blue', $ref: 'Account:1:record:namespace' },
        { $idx: 3, title: '✈ Cap 10', selectable: true, color: 'blue', $ref: 'Account:1:record:namespace' },
        { $idx: 4, title: 'FI '+faker.name.lastName(), sharable: true, color: 'grey', $ref: 'Account:1:record:namespace' },
        { $idx: 5, title: 'FI '+faker.name.lastName(), sharable: true, color: random.color(), $ref: 'Account:1:record:namespace' },
        { $idx: 6, title: 'Salle Briefing', sharable: true, color: random.color(), $ref: 'Account:1:record:namespace' },
      ],

      Block: [
        { start: 10, duration: 1, end: 11, day: moment().startOf('d').toDate(), note: 'Lorem Ipsum', $ref: ['Resource:1:record:resource', 'User:1:record:user'] },
        { start: 11, duration: 1.5, end: 12.5, day: moment().startOf('d').toDate(), $ref: ['Resource:1:record:resource', 'User:2:record:user'] },
        { start: 15, duration: 1.5, end: 16.5, day: moment().startOf('d').toDate(), $ref: ['Resource:1:record:resource', 'User:3:record:user'] },
        { start: 9.5, duration: 1.5, end: 11, day: moment().startOf('d').toDate(), $ref: ['Resource:2:record:resource', 'User:2:record:user'] },
        { start: 14, duration: 2, end: 16, day: moment().startOf('d').toDate(), $ref: ['Resource:2:record:resource', 'User:100:record:user'] },
        { start: 13, duration: 4, end: 17, day: moment().startOf('d').toDate(), $ref: ['Resource:3:record:resource', 'User:1:record:user', 'Resource:4:record:sharedWith'] },
      ]
    
    }
    
  }
  

}