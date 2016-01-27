import "babel-polyfill";

import React from "react";
import ReactDOM from "react-dom";
import {onResizeMixin} from "../component/onResizeMixin.jsx";
import {Map} from "../component/Map.jsx";
import {MapNav} from "../component/MapNav.jsx";
import {HeatLayer} from "../component/HeatLayer.jsx";

const heatData = [
    [[-12.059372, -77.044474],
     [-12.058048, -77.041597],
     [-12.062370, -77.040437],
     [-12.056759, -77.048487],
     [-12.055917, -77.038328],
     [-12.064945, -77.043399]
    ],
    [[-12.058281, -77.048079],
     [-12.056243, -77.041747],
     [-12.064452, -77.039150],
     [-12.056528, -77.045365],
     [-12.057921, -77.038135],
     [-12.065162, -77.045426]
    ],
    [[-12.057284, -77.051523],
     [-12.056053, -77.040012],
     [-12.064672, -77.041403],
     [-12.056276, -77.042007],
     [-12.059831, -77.037953],
     [-12.063682, -77.044256]
    ],
    [[-12.056759, -77.048487],
     [-12.055917, -77.038328],
     [-12.064945, -77.043399],
     [-12.057944, -77.041889],
     [-12.059978, -77.039552],
     [-12.061772, -77.042690]
    ],
    [[-12.056528, -77.045365],
     [-12.057921, -77.038135],
     [-12.065162, -77.045426],
     [-12.059372, -77.044474],
     [-12.058048, -77.041597],
     [-12.062370, -77.040437],
    ],
    [[-12.056276, -77.042007],
     [-12.059831, -77.037953],
     [-12.063682, -77.044256],
     [-12.058281, -77.048079],
     [-12.056243, -77.041747],
     [-12.064452, -77.039150],
    ],
    [[-12.057944, -77.041889],
     [-12.059978, -77.039552],
     [-12.061772, -77.042690],
     [-12.057284, -77.051523],
     [-12.056053, -77.040012],
     [-12.064672, -77.041403],
    ],
];

const dataGenerator = (function*(){
    while(true)
        for (var dataList of heatData){
            let data = _.map(dataList, function(point){
                return {
                    latitude: point[0],
                    longitude: point[1],
                    temperature: (Math.random()*3) + 24
                }
            });
            console.log(data);
            yield data; 
        }
})();
/*
const heatmapData = [
    {
        latitude: -12.06024,
        longitude: -77.04155,
        temperature: 29,
    },
    {
        latitude: -12.06150,
        longitude: -77.04185,
        temperature: 21,
    }
];
*/

const NoobeApp = React.createClass({
    mixins: [onResizeMixin],
    mounted: false,
    getInitialState: function(){
        return {
            width: this.props.width,
            height: null,
            center: [-12.06024, -77.04155],
            zoom: 16,
            maxZoom: 18,
        }
    },
    componentDidMount: function(){
        this.mounted = true;
        this.onResizeHandler();
    },
    onResizeHandler: function(){
        const clientRect = this.node.getBoundingClientRect();
        this.setState({
            width: clientRect.width,
            height: clientRect.height,
        });
    },
    onTranslate: function(newCenterDeg){        
        this.setState({center: newCenterDeg});
    },
    onZoom: function(zoomDelta, newCenterDeg){
        const maxZoom = this.props.maxZoom;
        
        const newZoom = this.state.zoom+zoomDelta;
        this.setState({
            zoom: (newZoom < maxZoom)?this.state.zoom:newZoom,
            center: newCenterDeg,
        });
    },
    render: function(){
        const wrapperStyle = {
            display: "block",
            height: this.props.height?undefined:"100%",
        };
        
        if (!this.mounted)
            return (
                <div ref={(ref) => this.node = ref}
                     style={wrapperStyle}>
                </div>
            );
        return (
            <div ref={(ref) => this.node = ref}
                 style={wrapperStyle}>
                <Map width={this.state.width}
                     height={this.state.height}
                     center={this.state.center}
                     zoom={this.state.zoom}>
                    <HeatLayer data={this.props.data}
                               max={28}
                               min={15}/>
                    <MapNav onTranslate={this.onTranslate}
                            onZoom={this.onZoom}/>
                </Map>
            </div>
        );
    }

});



ReactDOM.render(<NoobeApp data={dataGenerator.next().value}/>,
                document.getElementById("app-container"));

setInterval(function(){
    ReactDOM.render(<NoobeApp data={dataGenerator.next().value}/>,
                    document.getElementById("app-container"));
}, 3000);
