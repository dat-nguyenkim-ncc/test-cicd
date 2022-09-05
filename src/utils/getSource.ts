// order from highest priority to lowest priority
const sources = {
  CRB: 'crunchbase',
  DR: 'dealroom',
  MANUAL: 'bcg',
  APIX: 'apix',
}

export const ReverseSource: Record<string, string> = {
  crunchbase: 'CRB',
  dealroom: 'DR',
  bcg: 'MANUAL',
  apix: 'APIX',
}

export default function getSource(source: string): string {
  return sources[source as keyof typeof sources]
}

export const listValuesSources = Object.values(sources)
export const listKeysSources = Object.keys(sources)
