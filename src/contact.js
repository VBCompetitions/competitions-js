import ContactRole from './contactRole.js'

/**
 * A single contact for a team
 */
class Contact {
  /**
   * A unique ID for this contact, e.g. 'TM1Contact1'. This must be unique within the team
   * @type {string}
   * @private
   */
  #id

  /**
   * The name of this contact
   * @type {string|null}
   * @private
   */
  #name = null

  /**
   * The roles of this contact within the team
   * @type {array}
   * @private
   */
  #roles

  /**
   * The email addresses for this contact
   * @type {array}
   * @private
   */
  #emails

  /**
   * A telephone number for this contact. If a contact has multiple phone numbers then add them as another contact
   * @type {array}
   * @private
   */
  #phones

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
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid contact ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    if (team.hasContact(id)) {
      throw new Error(`Contact with ID "${id}" already exists in the team`)
    }

    this.#team = team
    this.#id = id
    this.#roles = []
    roles.forEach(role => {
      switch (role) {
        case ContactRole.TREASURER:
          this.addRole(ContactRole.TREASURER)
          break
        case ContactRole.SECRETARY:
          this.addRole(ContactRole.SECRETARY)
          break
        case ContactRole.MANAGER:
          this.addRole(ContactRole.MANAGER)
          break
        case ContactRole.CAPTAIN:
          this.addRole(ContactRole.CAPTAIN)
          break
        case ContactRole.COACH:
          this.addRole(ContactRole.COACH)
          break
        case ContactRole.ASSISTANT_COACH:
          this.addRole(ContactRole.ASSISTANT_COACH)
          break
        case ContactRole.MEDIC:
          this.addRole(ContactRole.MEDIC)
          break
      }
    })
    this.#name = null
    this.#emails = []
    this.#phones = []
  }

  /**
   * Loads contact data from an object
   * @param {Object} contactData The data defining this Contact
   * @returns {Contact} The updated Contact instance
   */
  loadFromData (contactData) {
    if (Object.hasOwn(contactData, 'name')) {
      this.setName(contactData.name)
    }

    if (Object.hasOwn(contactData, 'emails')) {
      contactData.emails.forEach(email => {
        this.addEmail(email)
      })
    }
    if (Object.hasOwn(contactData, 'phones')) {
      contactData.phones.forEach(phone => {
        this.addPhone(phone)
      })
    }

    return this
  }

  /**
   * Return the contact definition in a form suitable for serializing
   *
   * @returns {Object}
   */
  serialize () {
    const contact = {
      id: this.#id
    }

    if (this.#name !== null) {
      contact.name = this.#name
    }

    contact.roles = []
    this.#roles.forEach(role => {
      contact.roles.push(role)
    })

    if (this.#emails.length > 0) {
      contact.emails = []
      this.#emails.forEach(email => {
        contact.emails.push(email)
      })
    }

    if (this.#phones.length > 0) {
      contact.phones = []
      this.#phones.forEach(phone => {
        contact.phones.push(phone)
      })
    }

    return contact
  }

  /**
   * Get the team this contact belongs to
   * @returns {CompetitionTeam} The team this contact belongs to
   */
  getTeam () {
    return this.#team
  }

  /**
   * Get the ID for this contact
   * @returns {string} The ID for this contact
   */
  getID () {
    return this.#id
  }

  /**
   * Set the name for this contact
   * @param {string} name The name for this contact
   * @returns {Contact} This contact
   * @throws {Error} If the name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid contact name: must be between 1 and 1000 characters long')
    }
    this.#name = name
    return this
  }

  /**
   * Get the name for this contact
   * @returns {string|null} The name for this contact
   */
  getName () {
    return this.#name
  }

  /**
   * Get the roles for this contact
   * @returns {Array<ContactRole>} The roles for this contact
   */
  getRoles () {
    return this.#roles
  }

  /**
   * Add a role to this contact
   * @param {string} role The role to add to this contact
   * @returns {Contact} Returns this contact for method chaining
   */
  addRole (role) {
    if (!this.hasRole(role)) {
      this.#roles.push(role)
    }
    return this
  }

  /**
   * Check if this contact has the specified role
   * @param {string} role The role to check for
   * @returns {boolean} Whether the contact has the specified role
   */
  hasRole (role) {
    return this.#roles.includes(role)
  }

  /**
   * Set the list of roles, overriding the previous list
   *
   * @param {array<string>} roles The list of roles for the contact
   *
   * @returns {Contact} Returns this contact for method chaining
   * @throws {Error} When the list of roles contains an invalid value
   */
  setRoles (roles) {
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error('Error setting the roles to an empty list as the Contact must have at least one role')
    }

    const newRoles = []
    for (const role of roles) {
      switch (role) {
        case ContactRole.SECRETARY:
        case ContactRole.TREASURER:
        case ContactRole.MANAGER:
        case ContactRole.CAPTAIN:
        case ContactRole.COACH:
        case ContactRole.ASSISTANT_COACH:
        case ContactRole.MEDIC:
          newRoles.push(role)
          break
        default:
          throw new Error(`Error setting the roles due to invalid role: ${role}`)
      }
    }

    this.#roles = newRoles
    return this
  }

  /**
   * Get the email addresses for this contact
   * @returns {Array<string>} The email addresses for this contact
   */
  getEmails () {
    return this.#emails
  }

  /**
   * Add an email address to this contact
   * @param {string} email The email address to add
   * @returns {Contact} Returns this contact for method chaining
   * @throws {Error} When the email address is invalid
   */
  addEmail (email) {
    if (email.length < 3) {
      throw new Error('Invalid contact email address: must be at least 3 characters long')
    }
    if (!this.#emails.includes(email)) {
      this.#emails.push(email)
    }
    return this
  }

  /**
   * Set the list of email addresses, overriding the previous list.  To delete all email addresses, pass in null
   *
   * @param {array|null} emails The list of email addresses for the contact
   *
   * @returns {Contact} Returns this contact for method chaining
   * @throws {Error} When one of the email addresses is invalid
   */
  setEmails (emails) {
    if (emails === null) {
      this.#emails = []
      return this
    }

    const newEmails = []
    for (const email of emails) {
      if (email.length < 3) {
        throw new Error('Invalid contact email address: must be at least 3 characters long')
      }
      if (!newEmails.includes(email)) {
        newEmails.push(email)
      }
    }
    this.#emails = newEmails
    return this
  }

  /**
   * Get the phone numbers for this contact
   * @returns {Array<string>} The phone numbers for this contact
   */
  getPhones () {
    return this.#phones
  }

  /**
   * Add a phone number to this contact
   * @param {string} phone The phone number to add
   * @returns {Contact} Returns this contact for method chaining
   * @throws {Error} When the phone number is invalid
   */
  addPhone (phone) {
    if (phone.length > 50 || phone.length < 1) {
      throw new Error('Invalid contact phone number: must be between 1 and 50 characters long')
    }
    if (!this.#phones.includes(phone)) {
      this.#phones.push(phone)
    }
    return this
  }

  /**
   * Set the list of phone numbers, overriding the previous list.  To delete all phone numbers, pass in null
   *
   * @param {array|null} phones The list of phone numbers for the contact
   *
   * @return {Contact} Returns this contact for method chaining
   * @throws {Error} When one of the phone numbers is invalid
   */
  setPhones (phones) {
    if (phones === null) {
      this.#phones = []
      return this
    }

    const newPhones = []
    for (const phone of phones) {
      if (phone.length > 50 || phone.length < 1) {
        throw new Error('Invalid contact phone number: must be between 1 and 50 characters long')
      }
      if (!newPhones.includes(phone)) {
        newPhones.push(phone)
      }
    }
    this.#phones = newPhones
    return this
  }
}

export default Contact
