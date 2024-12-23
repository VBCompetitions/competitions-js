import Contact from './contact.js'
import Club from './club.js'
import ClubContactRole from './clubContactRole.js'

/**
 * A single contact for a club
 */
class ClubContact extends Contact {
  /**
   * The club this contact belongs to
   * @type {Club}
   * @private
   */
  #club

  /**
   * Defines a Club Contact
   * @param {Club} club The club this contact belongs to
   * @param {string} id The unique ID for this contact
   * @param {Array<string>} roles The roles of this contact within the club
   */
  constructor (club, id, roles) {
    if (!(club instanceof Club)) {
      throw new Error(`club contacts can only be attached to clubs, ${club.constructor.name} given`)
    }

    if (club.hasContact(id)) {
      throw new Error(`Contact with ID "${id}" already exists in the club`)
    }

    super(id, roles, ClubContactRole._validRoles)
    this.#club = club
  }

  /**
   * Get the club this contact belongs to
   * @returns {Club} The club this contact belongs to
   */
  getClub () {
    return this.#club
  }
}

export default ClubContact
