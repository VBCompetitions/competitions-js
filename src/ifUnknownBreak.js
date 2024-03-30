/**
 * A break in play, possibly while other matches are going on in other competitions running in parallel
 */
class IfUnknownBreak {
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
   * The IfUnknown instance this break is associated with
   * @type {IfUnknown}
   * @private
   */
  #ifUnknown

  /**
   * Initializes the IfUnknownBreak instance
   *
   * @param {IfUnknown} ifUnknown The IfUnknown instance this break is in
   */
  constructor (ifUnknown) {
    this.#ifUnknown = ifUnknown
    this.#start = null
    this.#date = null
    this.#duration = null
    this.#name = null
  }

  /**
   * Loads data from an object into the IfUnknownBreak instance
   *
   * @param {object} ifUnknownBreakData The data defining this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   */
  loadFromData (ifUnknownBreakData) {
    if (Object.hasOwn(ifUnknownBreakData, 'start')) {
      this.setStart(ifUnknownBreakData.start)
    }
    if (Object.hasOwn(ifUnknownBreakData, 'date')) {
      this.setDate(ifUnknownBreakData.date)
    }
    if (Object.hasOwn(ifUnknownBreakData, 'duration')) {
      this.setDuration(ifUnknownBreakData.duration)
    }
    if (Object.hasOwn(ifUnknownBreakData, 'name')) {
      this.setName(ifUnknownBreakData.name)
    }

    return this
  }

  /**
   * Returns the match break data in a form suitable for serializing
   *
   * @returns {object} The serialized break data
   */
  serialize () {
    const breakData = {
      type: 'break'
    }

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
   * Retrieves the IfUnknown instance this break is associated with
   *
   * @returns {IfUnknown} The IfUnknown instance this break is associated with
   */
  getIfUnknown () {
    return this.#ifUnknown
  }

  /**
   * Sets the start time for this break
   *
   * @param {string} start The start time for this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   * @throws {Error} When an invalid start time format is provided
   */
  setStart (start) {
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(start)) {
      throw new Error(`Invalid start time "${start}": must contain a value of the form "HH:mm" using a 24 hour clock`)
    }
    this.#start = start
    return this
  }

  /**
   * Retrieves the start time for this break
   *
   * @returns {string|null} The start time for this break
   */
  getStart () {
    return this.#start
  }

  /**
   * Sets the date for this break
   *
   * @param {string} date The date for this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   * @throws {Error} When an invalid date format is provided or the date does not exist
   */
  setDate (date) {
    if (!/^[0-9]{4}-(0[0-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(date)) {
      throw new Error(`Invalid date "${date}": must contain a value of the form "YYYY-MM-DD"`)
    }

    const d = new Date(date)
    if (`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}` !== date) {
      throw new Error(`Invalid date "${date}": date does not exist`)
    }

    this.#date = date
    return this
  }

  /**
   * Retrieves the date for this break
   *
   * @returns {string|null} The date for this break
   */
  getDate () {
    return this.#date
  }

  /**
   * Sets the duration for this break
   *
   * @param {string} duration The duration for this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   * @throws {Error} When an invalid duration format is provided
   */
  setDuration (duration) {
    if (!/^[0-9]+:[0-5][0-9]$/.test(duration)) {
      throw new Error(`Invalid duration "${duration}": must contain a value of the form "HH:mm"`)
    }
    this.#duration = duration
    return this
  }

  /**
   * Retrieves the duration for this break
   *
   * @returns {string|null} The duration for this break
   */
  getDuration () {
    return this.#duration
  }

  /**
   * Sets the name for this break
   *
   * @param {string} name The name for this break
   * @returns {IfUnknownBreak} The updated IfUnknownBreak instance
   * @throws {Error} When the provided name is invalid
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid break name: must be between 1 and 1000 characters long')
    }
    this.#name = name
    return this
  }

  /**
   * Retrieves the name for this break
   *
   * @returns {string|null} The name for this break
   */
  getName () {
    return this.#name
  }
}

export default IfUnknownBreak
