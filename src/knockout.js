import Group from './group.js'
import GroupType from './groupType.js'

/**
 * A group within this stage of the competition.  A knockout expects to generate an order of teams based on team elimination
 */
class Knockout extends Group {
  /**
   * Contains the group data of a stage, creating any metadata needed
   *
   * @param {Stage} stage A link back to the Stage this Group is in
   * @param {string} id The unique ID of this Group
   * @param {MatchType} matchType Whether matches are continuous or played to sets
   */
  constructor (stage, id, matchType) {
    super(stage, id, matchType)
    this._type = GroupType.KNOCKOUT
    this._drawsAllowed = false
  }

  /**
   * Get the knockout config for this group
   *
   * @returns {KnockoutConfig|null} the knockout config for this group
   */
  getKnockoutConfig () {
    return this._knockoutConfig
  }
}

export default Knockout
