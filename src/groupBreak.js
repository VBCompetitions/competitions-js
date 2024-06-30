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
   * @returns {GroupBreak} This GroupBreak instance
   */
  loadFromData (breakData) {
    if (Object.hasOwn(breakData, 'start')) {
      this.setStart(breakData.start)
    }
    if (Object.hasOwn(breakData, 'date')) {
      this.setDate(breakData.date)
    }
    if (Object.hasOwn(breakData, 'duration')) {
      this.setDuration(breakData.duration)
    }
    if (Object.hasOwn(breakData, 'name')) {
      this.setName(breakData.name)
    }
    return this
  }

  /**
   * Return the match break data in a form suitable for serializing
   *
   * @returns {object} The match break data
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
   * @returns {Group} The group this break is in
   */
  getGroup () {
    return this.#group
  }

  /**
   * Set the start time for this break
   * @param {string|null} start The start time for this break
   * @returns {GroupBreak} This GroupBreak instance
   */
  setStart (start) {
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(start)) {
      throw new Error(`Invalid start time "${start}": must contain a value of the form "HH:mm" using a 24 hour clock`)
    }
    this.#start = start
    return this
  }

  /**
   * Get the start time for this break
   * @returns {string|null} The start time for this break
   */
  getStart () {
    return this.#start
  }

  /**
   * Set the date for this break
   * @param {string|null} date The date for this break
   * @returns {GroupBreak} This GroupBreak instance
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
   * Get the date for this break
   * @returns {string|null} The date for this break
   */
  getDate () {
    return this.#date
  }

  /**
   * Set the duration for this break
   * @param {string|null} duration The duration for this break
   * @returns {GroupBreak} This GroupBreak instance
   */
  setDuration (duration) {
    if (!/^[0-9]+:[0-5][0-9]$/.test(duration)) {
      throw new Error(`Invalid duration "${duration}": must contain a value of the form "HH:mm"`)
    }
    this.#duration = duration
    return this
  }

  /**
   * Get the duration for this break
   * @returns {string|null} The duration for this break
   */
  getDuration () {
    return this.#duration
  }

  /**
   * Set the name for this break
   * @param {string|null} name The name for this break
   * @returns {GroupBreak} This GroupBreak instance
   */
  setName (name) {
    if (name.length > 1000 || name.length < 1) {
      throw new Error('Invalid break name: must be between 1 and 1000 characters long')
    }
    this.#name = name
    return this
  }

  /**
   * Get the name for this break
   * @returns {string|null} The name for this break
   */
  getName () {
    return this.#name
  }
}

export default GroupBreak
