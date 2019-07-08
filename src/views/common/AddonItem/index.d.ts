import {IStore} from "../../../interface";

export interface AddonItemProps {
  rowData: any;
  store?: IStore;
}

export interface AddonItemState {
  loading: boolean,
  btnTxt: string,
  installFilePath: any,
  downloadUrl: string,
  zipFile: string
}
