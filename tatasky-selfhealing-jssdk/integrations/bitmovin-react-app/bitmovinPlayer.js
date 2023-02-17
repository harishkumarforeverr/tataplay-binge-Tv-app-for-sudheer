import React from 'react';
import { Player } from 'bitmovin-player';
import { UIFactory } from 'bitmovin-player/bitmovinplayer-ui';
import 'bitmovin-player/bitmovinplayer-ui.css';
import { TSAnalyticsMitigtionSDK } from 'tatasky-analytics-mitigation';


class BitmovinPlayer extends React.Component {
    //Step 1: Integration Starts >>
    sdk = new TSAnalyticsMitigtionSDK()
    //Step 1: Integration Ends <<
    state = {
        player: null,
    };

    playerConfig = {
        key: 'A7ACFA3C-C4C0-4847-A593-792CA02D24A7',
        playback: {
            muted: true,
            autoplay: true,
        },
    };

    playerSource = {
        dash: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
        hls: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
        poster: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/poster.jpg'
    };

    constructor(props) {
        super(props);
        this.playerDiv = React.createRef();
    }

    componentDidMount() {
        //Step 2: Integration Starts >>
        console.log("componentDidMount In ---")
        var appProperties = {
            ApplicationName : "bitmovin_based_react_app",
            PlayerName : "bitmovin player",
            UEID: "guest@gmail.com"
        }
        this.sdk.registerApplication(appProperties);
        //Step 2: Integration Ends >>
        this.setupPlayer();
    }

    componentWillUnmount() {
        //Step 4: Integration Starts >>
        this.sdk.unregisterApplication()
        //Step 4: Integration Ends <<
        this.destroyPlayer();
    }

    setupPlayer() {
        //Step 3a): Integration Starts >>
        const player = new Player(this.playerDiv.current, this.sdk.getMitigationConfiguration(this.playerConfig));
        //Integration Ends <<
        //Step 3b): Integration Starts >>
        console.log("Here is the bitmovin player created ---")
        var assetInfo = {
            AssetID : "1235",
            Provider : "Hotstar",
            CDN: "AKAMAI"
        }
        this.sdk.registerPlaybackSession(assetInfo, player);
        //Integration Ends <<
        UIFactory.buildDefaultUI(player);
        player.load(this.playerSource).then(() => {
            this.setState({
                ...this.state,
                player
            });
            console.log('Successfully loaded source');
        }, () => {
            console.log('Error while loading source');
        });
    }

    destroyPlayer() {
        if (this.state.player != null) {
            this.state.player.destroy();
            this.setState({
                ...this.state,
                player: null
            });
        }
    }

    render() {
        return <div id='player' ref={this.playerDiv}/>;
    }
}

export default BitmovinPlayer;
