const updateObj = (ref: any, path: string, newValue: any) => {
  const branch = path.split('.')
  let i
  for (i = 0; i < branch.length - 1; i++) {
    if (!ref[branch[i]]) {
      ref[branch[i]] = {}
    }
    ref = ref[branch[i]]
  }

  ref[branch[i]] = newValue
}

export const updatedStateBranch = (source: any, path: string, newValue: any) => {
  const clone = JSON.parse(JSON.stringify(source || {}))
  updateObj(clone, path, newValue)

  return clone
}