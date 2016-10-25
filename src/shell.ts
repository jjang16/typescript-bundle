/*--------------------------------------------------------------------------

typescript-bundle - compiles modular typescript projects into bundle consumable with a html script tag.

The MIT License (MIT)

Copyright (c) 2016 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import {spawn}  from "child_process"
import {Log}    from "./logger"

/**
 * Shell:
 * provides a interface to execute shell commands.
 */
export class Shell {
  private encoding : string
  private windows  : boolean

  /**
   * creates a new shell object.
   * @param {Log} the logging object to receive stdout.
   * @returns {Shell} 
   */
  constructor(private log: Log) {
    this.encoding = "utf8"
    this.windows  = /^win/.test(process.platform) as boolean
  }

  /**
   * executes a shell command.
   * @param {string} the command to execute.
   * @param {number} the expected exit code.
   * @returns {Promise<{}>} promise when this process exits.
   */
  public execute(command: string, exitcode: number) : Promise<{}> {
    return new Promise<{}>((resolve, reject) => {
      let process = spawn (
        this.windows ? 'cmd' : 'sh', 
        [ this.windows ? '/c':'-c', command ]
      )
      process.stdout.setEncoding(this.encoding)
      process.stderr.setEncoding(this.encoding)
      process.stdout.on("data", data => this.log.write(data))
      process.stderr.on("data", data => this.log.write(data))
      process.on("close", e => {
        if(exitcode === e) {
          resolve()
        }else {
          reject(`unexpected exit code: expected ${exitcode} got ${e}.`)
        }
      })
    })
  }
}
