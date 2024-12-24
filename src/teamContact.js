import CompetitionTeam from './competitionTeam.js'
import Contact from './contact.js'
import TeamContactRole from './teamContactRole.js'

/**
 * A single contact for a team
 */
class TeamContact extends Contact {
  /**
   * The team this contact belongs to
   * @type {CompetitionTeam}
   * @private
   */
  #team

  /**
   * Defines a Team Contact
   * @param {CompetitionTeam} team The team this contact belongs to
   * @param {string} id The unique ID for this contact
   * @param {Array<string>} roles The roles of this contact within the team
   */
  constructor (team, id, roles) {
    if (!(team instanceof CompetitionTeam)) {
      throw new Error(`team contacts can only be attached to competition teams, ${team.constructor.name} given`)
    }

    if (team.hasContact(id)) {
      throw new Error(`Contact with ID "${id}" already exists in the team`)
    }

    super(id, roles, TeamContactRole._validRoles)
    this.#team = team
  }

  /**
   * Get the team this contact belongs to
   * @returns {CompetitionTeam} The team this contact belongs to
   */
  getTeam () {
    return this.#team
  }
}

export default TeamContact
