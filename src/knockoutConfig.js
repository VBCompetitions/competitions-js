/**
 * Represents a knockout configuration for a competition.
 */
class KnockoutConfig {
  /**
   * An ordered mapping from a position to a team ID
   * @type {array}
   * @private
   */
  #standing

  /**
   * The knockout group this configuration is associated with
   * @type {Group}
   * @private
   */
  #group

  /**
   * Constructs a new KnockoutConfig instance.
   *
   * @param {Group} group The group associated with this knockout configuration.
   */
  constructor (group) {
    this.#standing = []
    this.#group = group
  }

  /**
   * Loads knockout configuration data from an object.
   *
   * @param {object} knockoutData The data object containing knockout configuration information.
   * @returns {KnockoutConfig} The updated KnockoutConfig instance.
   */
  loadFromData (knockoutData) {
    this.setStanding(knockoutData.standing)
    return this
  }

  /**
   * The knockout configuration in a form suitable for serializing
   *
   * @returns {object} The serialized knockout configuration data.
   */
  serialize () {
    const knockout = {}
    knockout.standing = this.#standing
    return knockout
  }

  /**
   * Gets the group associated with this knockout configuration.
   *
   * @returns {Group} The group associated with this knockout configuration.
   */
  getGroup () {
    return this.#group
  }

  /**
   * Sets the standing array for this knockout configuration.
   *
   * @param {Array<object>} standing The array of standing maps.
   * @returns {KnockoutConfig} The KnockoutConfig instance with the updated standing array.
   */
  setStanding (standing) {
    this.#standing = standing
    return this
  }

  /**
   * Gets the standing array for this knockout configuration.
   *
   * @returns {Array<object>} The array of standing maps for this knockout configuration.
   */
  getStanding () {
    return this.#standing
  }
}

export default KnockoutConfig
