/**
 * Based on http://me.dt.in.th/page/JavaScript-override
 */

export const override = (object: any, methodName: string, callback: (object: any) => any) => {
  object[methodName] = callback(object[methodName])
}

export const before = (extraBehavior: any) => (original: any) =>
  function () {
    return original.apply(this, extraBehavior.apply(this, arguments))
  }

export const after = (extraBehavior: any) => (original: any) =>
  function () {
    return extraBehavior.call(this, original.apply(this, arguments), arguments)
  }
