import {IStore} from "../../../interface";

export interface SearchAddonProps {
  store?:IStore
}

export interface SearchAddonState {
  keyword: string | number;
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  list: Array<any>;
  listHeight: number
}
