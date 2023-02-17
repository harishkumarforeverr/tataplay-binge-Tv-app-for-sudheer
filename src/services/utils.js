import { buildKeyGenerator } from "axios-cache-interceptor";

const SLASHES_REGEX = /^\/|\/$/g;

export const axiosGenerateCacheKey = buildKeyGenerator(
    ({ baseURL = '', url = '', method = 'get', params, data, headers = {} }) => {
    const {   
        dthStatus,
        anonymousId,
        platform,
        profileId,
        authorization,
        deviceId,
        locale,
        rule,
        bingeProduct,
        baId,
        id,
        subscriberId,
        deviceToken,
        ip,
        rmn,
        subPage,
        subGenre,
        filterLanguage,
        freeToggle,
        pageType,
        subscribed,
        unsubscribed,
        packName,
            } = headers;  
      // Remove trailing slashes to avoid generating different keys for the "same" final url.
      baseURL && (baseURL = baseURL.replace(SLASHES_REGEX, ''));
      url && (url = url.replace(SLASHES_REGEX, ''));
  
      // lowercase method
      method && (method = method.toLowerCase());
  
      return {
        url: baseURL + (baseURL && url ? '/' : '') + url,
        params: params,
        method,
        data,
        headers: { 
            dthStatus,
            anonymousId,
            platform,
            profileId,
            authorization,
            deviceId,
            locale,
            rule,
            baId,
            bingeProduct,
            subPage,
            subGenre,
            filterLanguage,
            id,
            subscriberId,
            deviceToken,
            ip,
            rmn,
            freeToggle,
            pageType,
            unsubscribed,
            subscribed,
            packName,
        }
      };
    }
  );