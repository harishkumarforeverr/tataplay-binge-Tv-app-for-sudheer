# Build the SDK 
Execute the following instructions after changing your current working dir to this folder <br>

- npm install
- npm run build

Above steps will create the SDK with name **tatasky-analytics-mitigation** in the dist folder


# Integration steps for integration with reference react app from Bitmovin
**Bitmovin sample application - https://github.com/bitmovin/bitmovin-player-web-samples/tree/main/react/bundled-player**

<ol>

<li> 

- Have the node module tatasky-analytics-mitigation as dependency of the react application 
    ```
    npm install tatasky-analytics-mitigation        
    ```

- Import the package to the react component where the bitmovin player is intantiated 
    ```
    import { TSAnalyticsMitigtionSDK } from 'tatasky-analytics-mitigation';
    ```

- Create the instance of the SDK 
    ```
    sdk = new TSAnalyticsMitigtionSDK()
    ```

</li>

<li> In the method *componentDidMount()* execute the following code to register the application with the SDK <br>
    
    ```
    var appProperties = {
        ApplicationName : "bitmovin_based_react_app",
        PlayerName : "bitmovin player",
        UEID: "guest@gmail.com"
    }
    this.sdk.registerApplication(appProperties);
    ```

</li>

<li> Before creating instance of the player, you need to get the updated player config, that will be used in creating the instance of the player <br>
  Also, you need set the playback specfic metadata before instantiating the player instance <br>

    ```
    setupPlayer() {
        console.log("Here is the bitmovin player created ---")
        
        // Getting the updated mitigation configuration for player 
        const player = new Player(this.playerDiv.current, this.sdk.getMitigationConfiguration(this.playerConfig)); 

        //Setting the assset Info
        var assetInfo = {
            AssetID : "1235",
            Provider : "Hotstar",
            CDN: "AKAMAI"
        } 
        this.sdk.registerPlaybackSession(assetInfo, player); 
        ...
    }
    ```

</li>

<li> In the method *componentWillUnmount()*. Execute following code before destructing the instance of the player <br>
    
    ```
    componentWillUnmount() { 
        this.sdk.unregisterApplication()
        this.destroyPlayer(); 
    }
    ```

</li>

<li> For reporting any application error (like SSO errors), you can use the following interface API of the SDK <br>
    ```
    this.sdk.reportError("ErrorCode", "Description of the error")
    ```
</li>

</ol>
