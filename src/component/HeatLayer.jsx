import React from "react";
import _ from "lodash";
import heatmap from "heatmap.js";

const HeatLayer = React.createClass({
    componentDidMount: function(){
        this.layer = heatmap.create({
            container: this.node,
            minOpacity: .08,
            maxOpacity: 1,
            gradient: {
                "0": "#0000ff", // Azul
                ".25": "#40b2db",
                ".5": "#44ff00",
                ".75": "#f5ce31",
                "1": "#ff0000", // Rojo
            },
        });
        this.componentDidUpdate();
    },
    componentDidUpdate: function(){
        const projection = this.props.projection;
        const zoom = this.props.zoom;
        const radius = 50;
        const data = _.map(this.props.data, function(point){
            const coords = projection.deg2View([point.latitude, point.longitude]);
            return {
                x: coords[0],
                y: coords[1],
                value: point.temperature,
                radius: radius*((1 << zoom)/(1 << 16)),
            }
        });
        this.layer._renderer.setDimensions(this.props.width, this.props.height);
        
        this.layer.setData({
            max: this.props.max,
            min: this.props.min,
            data: data,
        });
    },
    compnentWillUnmount: function(){
        delete this.layer;
    },
    render: function(){
        const height = this.props.height;
        const width = this.props.width;
        const wrapperStyle = {
            height: height,
            width: width,
        };
        return(
            <div ref={ (ref)=> this.node=ref }
                 style={wrapperStyle}>
            </div>
        )
    },
});

export {HeatLayer};
