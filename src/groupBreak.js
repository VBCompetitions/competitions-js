/**
 * A break in play, possibly while other matches are going on in other competitions running in parallel
 * @implements {JsonSerializable}
 * @implements {BreakInterface}
 */
class GroupBreak {
  /**
   * The start time for the break
   * @type {string|null}
   * @private
   */
  #start

  /**
   * The date of the break
   * @type {string|null}
   * @private
   */
  #date

  /**
   * The duration of the break
   * @type {string|null}
   * @private
   */
  #duration

  /**
   * The name for the break, e.g. 'Lunch break'
   * @type {string|null}
   * @private
   */
  #name

  /**
   * The Group this break is in
   * @type {Group}
   * @private
   */
  #group

  /**
   * Contains the match break data
   * @param {Group} group The Group this break is in
   */
  constructor (group) {
    this.#group = group
    this.#start = null
    this.#date = null
    this.#duration = null
    this.#name = null
  }

  /**
   * Load the match break data from an object
   * @param {object} breakData The data defining this Break
   * @return {GroupBreak} This GroupBreak instance
   */
  loadFromData (breakData) {
    if (breakData.start !== undefined) {
      this.setStart(breakData.start)
    }
    if (breakData.date !== undefined) {
      this.setDate(breakData.date)
    }
    if (breakData.duration !== undefined) {
      this.setDuration(breakData.duration)
    }
    if (breakData.name !== undefined) {
      this.setName(breakData.name)
    }
    return this
  }

  /**
   * Return the match break data in a form suitable for serializing
   *
   * @return {object} The match break data
   */
  serialize () {
    const breakData = { type: 'break' }
    if (this.#start !== null) {
      breakData.start = this.#start
    }
    if (this.#date !== null) {
      breakData.date = this.#date
    }
    if (this.#duration !== null) {
      breakData.duration = this.#duration
    }
    if (this.#name !== null) {
      breakData.name = this.#name
    }
    return breakData
  }

  /**
   * Get the Group this break is in
   * @return {Group} The group this break is in
   */
  getGroup () {
    return this.#group
  }

  /**
   * Set the start time for this break
   * @param {string|null} start The start time for this break
   * @return {GroupBreak} This GroupBreak instance
   */
  setStart (start) {
    this.#start = start
    return this
  }

  /**
   * Get the start time for this break
   * @return {string|null} The start time for this break
   */
  getStart () {
    return this.#start
  }

  /**
   * Set the date for this break
   * @param {string|null} date The date for this break
   * @return {GroupBreak} This GroupBreak instance
   */
  setDate (date) {
    this.#date = date
    return this
  }

  /**
   * Get the date for this break
   * @return {string|null} The date for this break
   */
  getDate () {
    return this.#date
  }

  /**
   * Set the duration for this break
   * @param {string|null} duration The duration for this break
   * @return {GroupBreak} This GroupBreak instance
   */
  setDuration (duration) {
    this.#duration = duration
    return this
  }

  /**
   * Get the duration for this break
   * @return {string|null} The duration for this break
   */
  getDuration () {
    return this.#duration
  }

  /**
   * Set the name for this break
   * @param {string|null} name The name for this break
   * @return {GroupBreak} This GroupBreak instance
   */
  setName (name) {
    this.#name = name
    return this
  }

  /**
   * Get the name for this break
   * @return {string|null} The name for this break
   */
  getName () {
    return this.#name
  }
}

export default GroupBreak
