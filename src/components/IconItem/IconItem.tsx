import React from 'react'
import { Icon } from 'antd'
import { IconItemProps } from './index'

const IconItem:React.FC<IconItemProps> = ({ type, txt }) => (
  <div>
    <Icon type={type} />
    <span style={{ paddingLeft: '6px' }}>{txt}</span>
  </div>
);

export default IconItem
