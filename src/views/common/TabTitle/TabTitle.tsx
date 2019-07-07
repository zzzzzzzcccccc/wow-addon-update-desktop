import React from "react";
import {TabTitleProps} from './index'

const TabTitle:React.FC<TabTitleProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    <img src={props.item.thumb} alt={props.item.label} style={{ width: '1.4rem', height: '1.4rem', marginRight: '0.3rem' }} />
    <span>{props.item.label}</span>
  </div>
);

export default TabTitle;
