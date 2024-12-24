import Contact from './contact.js'
import CompetitionContactRole from './competitionContactRole.js'
import Competition from './competition.js'

/**
 * A single contact for a competition
 */
class CompetitionContact extends Contact {
  /**
   * The competition this contact belongs to
   * @type {Competition}
   * @private
   */
  #competition

  /**
   * Defines a Competition Contact
   * @param {Competition} competition The competition this contact belongs to
   * @param {string} id The unique ID for this contact
   * @param {Array<string>} roles The roles of this contact within the competition
   */
  constructor (competition, id, roles) {
    if (!(competition instanceof Competition)) {
      throw new Error(`competition contacts can only be attached to competitions, ${competition.constructor.name} given`)
    }

    if (competition.hasContact(id)) {
      throw new Error(`Contact with ID "${id}" already exists in the competition`)
    }

    super(id, roles, CompetitionContactRole._validRoles)
    this.#competition = competition
  }

  /**
   * Get the competition this contact belongs to
   * @returns {Competition} The competition this contact belongs to
   */
  getCompetition () {
    return this.#competition
  }
}

export default CompetitionContact
