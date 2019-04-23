import React from 'react'
import { inject, observer } from 'mobx-react'
import InfiniteScroll from 'react-infinite-scroller'
import { List } from 'antd'
import AddonItem from './AddonItem/AddonItem'
import { ScrollViewFooter } from '../../components'
import {TIME_OUT_KEY} from "../../conf";
import myAddon from '../../utils/myAddon'

@inject('store')
@observer
class TabItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      pageSize: 20,
      total: 0,
      list: [],
      hasMore: false,
      cacheAddonList: [],
    };
  }

  getData = async (first=true) => {
    const { path } = this.props;
    const { getAddonsList }  = this.props.store;
    let nowPage = first ? this.state.page : this.state.page + 1;
    const data = await getAddonsList(path, nowPage);
    if (data === TIME_OUT_KEY) { // 获取超时
    } else {
      const {addonsList, total, page, pageSize, maxPage} = data;
      this.setState({ list: [...this.state.list, ...addonsList], total, page, pageSize, hasMore: nowPage !== maxPage })
    }
  };

  setCacheAddonList = () => {// 获取我的插件列表
    this.setState({ cacheAddonList: myAddon.getAddonList() })
  };

  componentDidMount() {
    this.setCacheAddonList();
    this.getData()
  }

  render() {
    const { loading } = this.props.store;
    const { list, hasMore, cacheAddonList } = this.state;
    const { path, myAddonDrawerInfo } = this.props;

    return(
      <InfiniteScroll
        key={path}
        loadMore={() => this.getData(false)}
        initialLoad={false}
        useWindow={false}
        hasMore={!loading && hasMore}
        pageStart={0}>
        <List>
          {list.map((item, index) => {
            const findArr = cacheAddonList.filter(addon => addon.path === item.path);

            return(
              <AddonItem myAddonDrawerInfo={myAddonDrawerInfo}
                         onSuccess={() => this.setCacheAddonList()}
                         cacheAddonItem={findArr.length === 0 ? {} : findArr[0]}
                         rowData={item}
                         key={index} />
            )
          })}
        </List>
        {!loading && hasMore ? <ScrollViewFooter /> : null}
      </InfiniteScroll>
    )
  }
}

export default TabItem;
