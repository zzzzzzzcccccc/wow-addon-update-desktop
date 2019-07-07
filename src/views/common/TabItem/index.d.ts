import {IStore} from "../../../interface";

interface TabItemProps {
  addonLabel: string,
  path: string,
  store?: IStore
}

interface TabItemState {
  page: number;
  pageSize: number;
  total: number;
  list: Array<any>;
  hasMore: boolean;
  loading: boolean;
}

export {
  TabItemProps,
  TabItemState
}
