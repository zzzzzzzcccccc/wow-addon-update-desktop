export interface IStore {
  loading: boolean;
  myAddonList: any;
  optionDrawerVisible: boolean;
  myAddonDrawerVisible: boolean;
  updateAddonList: any;

  setLoading: (bool:boolean) => void;
  setMyAddonList: (list: any) => void;
  searchDrawerVisible: boolean;
  setMyAddonDrawerVisible: (myAddonDrawerVisible: boolean) => void;
  setOptionDrawerVisible: (optionDrawerVisible:boolean) => void;
  setSearchDrawerVisible: (searchDrawerVisible: boolean) => void;
  setUpdateAddonList: (list: any) => void;

  getAddonsList: (path: string, page?: number) => Promise<any>;
  getAddonDownUrl: (rowData: any) => Promise<any>;
  searchAddons: (keyword:string | number, page: number) => Promise<any>;
  getAddonDetail: (paths: string) => Promise<any>;
  checkUpdateMyAddon: () => Promise<any>;
}
