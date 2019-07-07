import React from 'react'
import { notification, Icon, Button } from 'antd'

/**
 * 重新加载electron
 * @param {string} message
 * @param {string} description
 * @param {string} btnTxt
 */
export const reloadNotice = (message: string, description: string, btnTxt: string='重试'): Promise<any> => {
  return new Promise((resolve, reject) => {
    let key = `open${Date.now()}`;

    notification.open({
      message: (
        <span>
        <Icon type="close-circle" style={{ color: '#f50', marginRight: '6px' }} />
          {message}
      </span>
      ),
      description,
      key,
      btn: (
        <Button type="primary" size="small" onClick={() => {
          notification.close(key);
          resolve()
        }}>
          {btnTxt}
        </Button>
      ),
      onClose: (): void => {
        notification.close(key)
        reject()
      },
      duration: null
    })
  })
};
