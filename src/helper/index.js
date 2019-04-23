import { message } from 'antd'

const S = (msg='成功') => {
  message.success(msg);
};

const E = (msg='系统异常') => {
  message.error(msg);
};

const W = (msg='系统繁忙') => {
  message.warning(msg);
};

const I = (msg='') => {
  message.info(msg);
};

export default {
  W,
  E,
  S,
  I
}
