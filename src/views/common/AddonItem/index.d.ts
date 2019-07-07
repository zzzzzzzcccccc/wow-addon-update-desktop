import {IStore} from "../../../interface";

export interface AddonItemProps {
  rowData: any;
  renderSource?: 'my' | 'list';
  store?: IStore;
}

export interface AddonItemState {
  loading: boolean,
  btnTxt: string,
  installFilePath: any,
  downloadUrl: string,
  zipFile: string
}
