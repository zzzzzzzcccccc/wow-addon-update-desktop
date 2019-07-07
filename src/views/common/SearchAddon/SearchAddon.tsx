import React from 'react'
import styles from './index.module.less'
import { Input, Spin, Tag } from 'antd'
import { inject, observer } from 'mobx-react'
import { SearchAddonProps, SearchAddonState } from './index'
import {TIME_OUT_KEY} from "../../../conf";
import InfiniteScroll from 'react-infinite-scroller'
import AddonItem from '../AddonItem/AddonItem'
import {reloadNotice} from "../../../utils";

const HEADER_HEIGHT:number = 55;
const SEARCH_HEIGHT:number = 62;
const CACHE_KEYWORD_KEY:string = '__cache_keyword_key__';
const MAX_CACHE_COUNT:number = 10;

@inject('store')
@observer
class SearchAddon extends React.Component<SearchAddonProps, SearchAddonState> {
  constructor(props:SearchAddonProps) {
    super(props);

    this.state = {
      keyword: '',
      loading: false,
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
      list: [],
      listHeight: document.documentElement.clientHeight - (HEADER_HEIGHT + SEARCH_HEIGHT)
    };
  }

  getData = async (first:boolean=false): Promise<any> => {
    let keyword = this.state.keyword;
    let page = this.state.page;
    if (!keyword) {
      return;
    }
    if (this.state.loading) {
      return;
    }
    this.setState({ loading: true });
    const {searchAddons} = this.props.store!;
    const data:any = await searchAddons(keyword, page);
    this.setState({ loading: false });
    if (data === TIME_OUT_KEY) {
      reloadNotice('搜索超时', '请重新试试').then(() => this.getData(this.state.page === 1));
      return;
    }
    const { total, list, page: dataPage } = data;
    const nowList = [...this.state.list, ...list];
    this.setState({list: nowList, total, page: dataPage, hasMore: nowList.length !== total});
    if (list.length !== 0) {
      this.setKeywordCache(keyword);
    }
  };

  getKeywordCache = (): Array<any> => {
    let sessionData = localStorage.getItem(CACHE_KEYWORD_KEY);
    if (sessionData) {
      return JSON.parse(sessionData)
    }
    return []
  };

  setKeywordCache = (keyword: string | number): void => {
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

  deleteCacheAddon = (item:any): void => localStorage.setItem(CACHE_KEYWORD_KEY, JSON.stringify(this.getKeywordCache().filter(v => v !== item)));

  componentDidMount() {
    window.onresize = () => {
      this.setState({ listHeight: document.documentElement.clientHeight - (HEADER_HEIGHT + SEARCH_HEIGHT) })
    };
  }

  render() {
    const { listHeight, loading, hasMore, list, keyword } = this.state;
    let cacheKeywordList = this.getKeywordCache();
    return(
      <div className={styles.searchAddonWrapper}>
        <section className={styles.searchAddonWrapperInfo}>
          <div className={styles.searchInfo}>
            <div style={{ padding: '15px' }}>
              <Input.Search placeholder="输入关键字..."
                            value={keyword}
                            onChange={(e:any): void => {
                              if (!loading) {
                                this.setState({ keyword: e.target.value, list: [] })
                              }
                            }}
                            onSearch={keyword => this.setState({ keyword, page: 1, hasMore: false, list: [] }, () => this.getData(true))} enterButton />
            </div>
          </div>

          <section className={`${styles.cacheWrapper} ${!loading && !keyword && cacheKeywordList.length !== 0 ? 'block' : 'none'}`}>
            {cacheKeywordList.map((item: any, index: number) =>
              <Tag key={index + ''}
                   color="volcano"
                   closable
                   onClose={(e:any) => {
                     e.stopPropagation();
                     this.deleteCacheAddon(item);
                   }}
                   onClick={():void => this.setState({ keyword: item, page: 1, hasMore: false, list: [] }, () => this.getData(true))}>
              {item}
              </Tag>)}
          </section>

          <section className={`${styles.listWrapper} ${keyword || loading ? 'block' : 'none'}`} style={{ height: `${listHeight}px` }}>
            <InfiniteScroll initialLoad={false}
                            useWindow={false}
                            loadMore={() => this.getData(false)}
                            hasMore={hasMore}
                            pageStart={0}>
              <div>
                {list.map((item:any, index: number) => <AddonItem rowData={item} key={index + ''} />)}
              </div>
              {!loading ? null :
                <div className={styles.spinWrapper}>
                  <Spin />
                </div>
              }
            </InfiniteScroll>
          </section>
        </section>
      </div>
    )
  }
}

export default SearchAddon
