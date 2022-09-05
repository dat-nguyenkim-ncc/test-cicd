export enum EnumInvestorManagementScreen {
  management = 'management',
  create = 'create',
  edit = 'edit',
  merge = 'merge',
  unMerge = 'unMerge',
  delete = 'delete',
}
export type ScreenType = keyof typeof EnumInvestorManagementScreen
