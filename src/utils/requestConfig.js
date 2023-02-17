import { DEFAULT_LOADER_DELAY_TIME } from "./constants";


class RequestConfig{
    loaderDelayTime = DEFAULT_LOADER_DELAY_TIME;
    requestsCount = 0;

    setLoaderDelayTime(time){
        this.loaderDelayTime = time
    }

    requestFired(){
        this.requestsCount++
    }

    responseReceived(){
        this.requestsCount--
    }
}

export default new RequestConfig();