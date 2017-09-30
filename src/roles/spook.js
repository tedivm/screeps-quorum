'use strict'

const MetaRole = require('roles_meta')
const CONTROLLER_MESSAGE = '* Self Managed Code * quorum.tedivm.com * #quorum in Slack *'

class Spook extends MetaRole {
  getBuild (room, options) {
    return [MOVE]
  }

  manageCreep (creep) {
    // Delete current target if it is currently visible.
    if (creep.memory.starget && Game.rooms[creep.memory.starget]) {
      delete creep.memory.starget
    }

    // Harass current room by signing controller and stomping contruction sites.
    if (!creep.room.controller || !creep.room.controller.my) {

      if (!creep.memory.stomproom || creep.memory.stomproom !== creep.room.name) {
        creep.memory.stomproom = creep.room.name
        creep.memory.stomptime = Game.time
      }

      if (Game.time - creep.memory.stomptime < 70) {
        // Find and destroy any hostile construction sites
        if (this.stompConstruction(creep)) {
          return
        }
        // Tag the controller
        if (this.signController(creep)) {
          return
        }
      }
    }

    // Move on to the next room
    this.migrateRooms(creep)
  }

  stompConstruction (creep) {
    const construction = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
    if (!construction) {
      return false
    }
    creep.travelTo(construction)
    return true
  }

  signController (creep) {
    if (!creep.room.controller) {
      return false
    }
    if (creep.room.controller.sign && creep.room.controller.sign.text === CONTROLLER_MESSAGE) {
      return false
    }
    if (creep.pos.isNearTo(creep.room.controller)) {
      creep.signController(creep.room.controller, CONTROLLER_MESSAGE)
    } else {
      creep.travelTo(creep.room.controller)
    }
    return true
  }

  migrateRooms (creep) {
    let target
    if (creep.memory.starget && creep.memory.starget !== creep.room.name) {
      target = creep.memory.starget
    } else {
      target = Room.getScoutTarget(creep)
    }
    creep.travelTo(new RoomPosition(25, 25, target), {range: 23})
  }
}

module.exports = Spook
