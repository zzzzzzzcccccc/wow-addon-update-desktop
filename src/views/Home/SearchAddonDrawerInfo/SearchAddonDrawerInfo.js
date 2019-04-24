import React from 'react'
import './index.less'
import { Input, Spin, List, Tag } from 'antd'
import { inject, observer } from 'mobx-react'
import InfiniteScroll from 'react-infinite-scroller'
import {TIME_OUT_KEY} from "../../../conf";
import helper from '../../../helper/index'
import myAddon from "../../../utils/myAddon";
import AddonItem from '../AddonItem/AddonItem'
import {debounce} from "../../../utils/index";

const TITLE_HEIGHT = 55;
const SEARCH_HEIGHT = 52 + 10;
const CACHE_KEYWORD_KEY = '__cache_keyword_key__';
const MAX_CACHE_COUNT = 10;

@inject('store')
@observer
class SearchAddonDrawerInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      keyword: '',
      page: 1,
      total: 0,
      hasMore: false,
      dataList: [],
      cacheAddonList: [],
      listHeight: document.documentElement.clientHeight - (TITLE_HEIGHT + SEARCH_HEIGHT)
    };
  };

  getData = async (first=false) => {
    let keyword = this.state.keyword;
    let page = this.state.page;

    if (!keyword) {
      return;
    }

    if (this.state.loading) {
      return;
    }

    this.setState({ loading: true });

    const { searchAddons } = this.props.store;
    if (!first) {
      page = page + 1
    }

    const data = await searchAddons(keyword, page);
    if (data === TIME_OUT_KEY) {
      helper.W('搜索超时请重新试试');
      this.setState({ loading: false })
    } else {
      const { total, list, page } = data;
      this.setState({
        dataList: [...this.state.dataList, ...list],
        total,
        page,
        hasMore: [...this.state.dataList, ...list].length !== total,
        loading: false
      });
      this.setKeywordCache(keyword)
    }
  };

  setKeywordCache = (keyword) => {
    if (!keyword) {
      return;
    }
    let list = this.getKeywordCache();
    if (list.indexOf(keyword) === -1) {
      if (list.length >= MAX_CACHE_COUNT) {
        list[0] = keyword;
      } else {
        list.unshift(keyword)
      }
      localStorage.setItem(CACHE_KEYWORD_KEY, JSON.stringify(list));
    }
  };

  getKeywordCache = () => localStorage.getItem(CACHE_KEYWORD_KEY) ? JSON.parse(localStorage.getItem(CACHE_KEYWORD_KEY)) : [];

  setCacheAddonList = () => {// 获取我的插件列表
    this.setState({ cacheAddonList: myAddon.getAddonList() })
  };

  deleteCacheAddon = (item) => localStorage.setItem(CACHE_KEYWORD_KEY, JSON.stringify(this.getKeywordCache().filter(v => v !== item)));

  componentDidMount() {
    window.onresize = debounce(() => this.setState({ listHeight: document.documentElement.clientHeight - (TITLE_HEIGHT + SEARCH_HEIGHT) }), 1000);
    this.setCacheAddonList();
  }

  render() {
    const { loading, hasMore, dataList, cacheAddonList, listHeight, keyword } = this.state;
    const { myAddonDrawerInfo } = this.props;
    return(
      <section className="search-addon-wrapper">
        <Spin spinning={loading}>
          <div className="search-addon-wrapper-info">
            <div className="search-addon-wrapper-info-header">
              <Input.Search placeholder="输入插件名称" enterButton
                            value={keyword}
                            onChange={(e) => this.setState({ keyword: e.target.value })}
                            onSearch={(keyword) => this.setState({ keyword, page: 1, hasMore: false, dataList: [] }, () => this.getData(true))} />
            </div>

            <section className={`search-addon-wrapper-info-cache ${!keyword && this.getKeywordCache().length !== 0 ? 'block' : 'none'}`}>
              {this.getKeywordCache().map(item => <Tag color="purple"
                                                       onClick={() => this.setState({ keyword: item, page: 1, hasMore: false, dataList: [] }, () => this.getData(true))}
                                                       closable
                                                       onClose={(e) => {
                                                         e.stopPropagation();
                                                         this.deleteCacheAddon(item)
                                                       }}
                                                       key={item}>{item}</Tag>)}
            </section>

            <section className={`search-addon-wrapper-info-list ${keyword ? 'block' : 'none'}`} style={{ height: `${listHeight}px` }}>
              <InfiniteScroll loadMore={() => this.getData(false)}
                              initialLoad={false}
                              useWindow={false}
                              hasMore={!loading && hasMore}
                              pageStart={0}>
                <List>
                  {dataList.map((item, index) => {
                    const findArr = cacheAddonList.filter(addon => addon.path === item.path);
                    return(
                      <AddonItem onSuccess={() => this.setCacheAddonList()}
                                 myAddonDrawerInfo={myAddonDrawerInfo}
                                 cacheAddonItem={findArr.length === 0 ? {} : findArr[0]}
                                 rowData={item}
                                 key={index} />
                    )
                  })}
                </List>
              </InfiniteScroll>
            </section>
          </div>
        </Spin>
      </section>
    )
  }
}

export default SearchAddonDrawerInfo;
