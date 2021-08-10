import { ALERT_CHANNEL } from './alert-constants';

export const alertChannelParam = (channel?: string) => {
    return channel
        ? {
              [ALERT_CHANNEL]: channel
          }
        : undefined;
};
