import React from 'react'
import { TabItemProps, TabItemState } from './index'
import { Spin } from 'antd'
import { inject, observer } from 'mobx-react'
import styles from './index.module.less'
import InfiniteScroll from 'react-infinite-scroller'
import {TIME_OUT_KEY} from "../../../conf";
import AddonItem from '../AddonItem/AddonItem'
import ScrollViewFooter from "../../../components/ScrollViewFooter/ScrollViewFooter";
import {reloadNotice} from "../../../utils";

@inject('store')
@observer
class TabItem extends React.Component<TabItemProps, TabItemState> {
  constructor(props: TabItemProps) {
    super(props);

    this.state = {
      page: 1,
      pageSize: 20,
      total: 0,
      list: [],
      hasMore: false,
      loading: false
    };
  }

  getData = async (first: boolean=true): Promise<void> => {
    if (this.state.loading) {
      return
    }
    this.setState({ loading: true });

    const { path } = this.props;
    const { getAddonsList } = this.props.store!;
    let nowPage = first ? this.state.page : this.state.page + 1;
    const data: any = await getAddonsList(path, nowPage);

    this.setState({ loading: false });

    if (data === TIME_OUT_KEY) {
      reloadNotice(`加载${this.props.addonLabel}失败`, '请重新试试').then(() => {
        this.setState({loading: false}, () => this.getData(this.state.page === 1))
      });
      return;
    }
    const { addonsList, total, page, pageSize, maxPage } = data;
    this.setState({ list: [...this.state.list, ...addonsList], total, page, pageSize, hasMore: nowPage !== maxPage })
  };

  componentDidMount() {
    this.getData()
  }

  render() {
    const { path } = this.props;
    const { loading, hasMore, list } = this.state;
    return(
      <InfiniteScroll key={path}
                      loadMore={() => this.getData(false)}
                      initialLoad={false}
                      useWindow={false}
                      hasMore={!loading && hasMore}
                      pageStart={0}>
        <div>
          {list.map((item, index) => <AddonItem rowData={item} key={index + ''} />)}
        </div>
        <div className={styles.spinWrapper}>
          {!loading && hasMore ? <ScrollViewFooter/> : <Spin />}
        </div>
      </InfiniteScroll>
    )
  }
}

export default TabItem
