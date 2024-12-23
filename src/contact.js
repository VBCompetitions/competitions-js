/**
 * A single contact for a team
 */
class Contact {
  /**
   * A unique ID for this contact, e.g. 'TM1Contact1'. This must be unique within the team
   * @type {string}
   * @protected
   */
  _id

  /**
   * The name of this contact
   * @type {string|null}
   * @protected
   */
  _name = null

  /**
   * Free form string to add notes about the player. This can be used for arbitrary content that various implementations can use
   * @type {string|null}
   * @protected
   */
  _notes = null

  /**
   * The roles of this contact within the team
   * @type {array}
   * @protected
   */
  _roles

  /**
   * The email addresses for this contact
   * @type {array}
   * @protected
   */
  _emails

  /**
   * A telephone number for this contact. If a contact has multiple phone numbers then add them as another contact
   * @type {array}
   * @protected
   */
  _phones

  /**
   * A list of valid roles for this contact
   * @type {array}
   * @protected
   */
  _validRoles

  /**
   * Defines a Team Contact
   * @param {CompetitionTeam} team The team this contact belongs to
   * @param {string} id The unique ID for this contact
   * @param {Array<string>} roles The roles of this contact within the team
   * @param {Array<string>} validRoles The valid roles this contact can have
   */
  constructor (id, roles, validRoles) {
    if (id.length > 100 || id.length < 1) {
      throw new Error('Invalid contact ID: must be between 1 and 100 characters long')
    }

    if (!/^((?![":{}?=])[\x20-\x7F])+$/.test(id)) {
      throw new Error('Invalid contact ID: must contain only ASCII printable characters excluding " : { } ? =')
    }

    this._validRoles = validRoles
    this._id = id
    this._roles = []
    roles.forEach(role => {
      this.addRole(role)
    })
    this._name = null
    this._emails = []
    this._phones = []
  }

  /**
   * Loads contact data from an object
   * @param {Object} contactData The data defining this Contact
   * @returns {TeamContact} The updated Contact instance
   */
  loadFromData (contactData) {
    if (Object.hasOwn(contactData, 'name')) {
      this.setName(contactData.name)
    }

    if (Object.hasOwn(contactData, 'notes')) {
      this.setNotes(contactData.notes)
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
      id: this._id
    }

    if (this._name !== null) {
      contact.name = this._name
    }

    if (this._notes !== null) {
      contact.notes = this._notes
    }

    contact.roles = []
    this._roles.forEach(role => {
      contact.roles.push(role)
    })

    if (this._emails.length > 0) {
      contact.emails = []
      this._emails.forEach(email => {
        contact.emails.push(email)
      })
    }

    if (this._phones.length > 0) {
      contact.phones = []
      this._phones.forEach(phone => {
        contact.phones.push(phone)
      })
    }

    return contact
  }

  /**
   * Get the ID for this contact
   * @returns {string} The ID for this contact
   */
  getID () {
    return this._id
  }

  /**
   * Get the name for this contact
   * @returns {string|null} The name for this contact
   */
  getName () {
    return this._name
  }

  /**
   * Set the name for this contact
   * @param {string} name The name for this contact
   * @returns {TeamContact} This contact
   * @throws {Error} If the name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid contact name: must be between 1 and 1000 characters long')
    }
    this._name = name
    return this
  }

  /**
   * Get the notes for this contact.
   *
   * @returns {string|null} The notes for this contact
   */
  getNotes () {
    return this._notes
  }

  /**
   * Set the notes for this contact.
   *
   * @param {string|null} notes The notes for this contact
   * @returns {Player} this Player
   */
  setNotes (notes) {
    this._notes = notes
    return this
  }

  /**
   * Get the roles for this contact
   * @returns {Array} The roles for this contact
   */
  getRoles () {
    return this._roles
  }

  /**
   * Add a role to this contact
   * @param {string} role The role to add to this contact
   * @returns {Contact} Returns this contact for method chaining
   */
  addRole (role) {
    if (this._validRoles.includes(role)) {
      if (!this.hasRole(role)) {
        this._roles.push(role)
      }
    } else {
      throw new Error(`Error adding the role due to invalid role: ${role}`)
    }
    return this
  }

  /**
   * Check if this contact has the specified role
   * @param {string} role The role to check for
   * @returns {boolean} Whether the contact has the specified role
   */
  hasRole (role) {
    return this._roles.includes(role)
  }

  /**
   * Set the list of roles, overriding the previous list
   *
   * @param {array<string>} roles The list of roles for the contact
   *
   * @returns {TeamContact} Returns this contact for method chaining
   * @throws {Error} When the list of roles contains an invalid value
   */
  setRoles (roles) {
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error('Error setting the roles to an empty list as the Contact must have at least one role')
    }

    const newRoles = []
    for (const role of roles) {
      if (this._validRoles.includes(role)) {
        newRoles.push(role)
      } else {
        throw new Error(`Error setting the roles due to invalid role: ${role}`)
      }
    }

    this._roles = newRoles
    return this
  }

  /**
   * Get the email addresses for this contact
   * @returns {Array<string>} The email addresses for this contact
   */
  getEmails () {
    return this._emails
  }

  /**
   * Add an email address to this contact
   * @param {string} email The email address to add
   * @returns {TeamContact} Returns this contact for method chaining
   * @throws {Error} When the email address is invalid
   */
  addEmail (email) {
    if (email.length < 3) {
      throw new Error('Invalid contact email address: must be at least 3 characters long')
    }
    if (!this._emails.includes(email)) {
      this._emails.push(email)
    }
    return this
  }

  /**
   * Set the list of email addresses, overriding the previous list.  To delete all email addresses, pass in null
   *
   * @param {array|null} emails The list of email addresses for the contact
   *
   * @returns {TeamContact} Returns this contact for method chaining
   * @throws {Error} When one of the email addresses is invalid
   */
  setEmails (emails) {
    if (emails === null) {
      this._emails = []
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
    this._emails = newEmails
    return this
  }

  /**
   * Get the phone numbers for this contact
   * @returns {Array<string>} The phone numbers for this contact
   */
  getPhones () {
    return this._phones
  }

  /**
   * Add a phone number to this contact
   * @param {string} phone The phone number to add
   * @returns {TeamContact} Returns this contact for method chaining
   * @throws {Error} When the phone number is invalid
   */
  addPhone (phone) {
    if (phone.length > 50 || phone.length < 1) {
      throw new Error('Invalid contact phone number: must be between 1 and 50 characters long')
    }
    if (!this._phones.includes(phone)) {
      this._phones.push(phone)
    }
    return this
  }

  /**
   * Set the list of phone numbers, overriding the previous list.  To delete all phone numbers, pass in null
   *
   * @param {array|null} phones The list of phone numbers for the contact
   *
   * @return {TeamContact} Returns this contact for method chaining
   * @throws {Error} When one of the phone numbers is invalid
   */
  setPhones (phones) {
    if (phones === null) {
      this._phones = []
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
    this._phones = newPhones
    return this
  }
}

export default Contact
