import Group from './group.js'
import GroupType from './groupType.js'

/**
 * A group within this stage of the competition.  There is no implied league table or team order, just match winners and losers
 */
class Crossover extends Group {
  /**
   * Contains the group data of a stage, creating any metadata needed
   *
   * @param {Stage} stage A link back to the Stage this Group is in
   * @param {string} id The unique ID of this Group
   * @param {MatchType} matchType Whether matches are continuous or played to sets
   */
  constructor (stage, id, matchType) {
    super(stage, id, matchType)
    this._type = GroupType.CROSSOVER
    this._drawsAllowed = false
  }
}

export default Crossover
