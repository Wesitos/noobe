import React from "react";
import _ from "lodash";

function defaultTileset(tileCoords, hostNum){
    const d = tileCoords
    if (d[0] == null || d[1] == null)
        return "";
    
    return ('http://' + ["a", "b", "c"][hostNum % 3] +
            ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + '.png');
};

// Esto devuelve un array de numeros reales. La parte decimal de cada
// numero representa la posicion del punto respecto a los bordes del
// tile (0 -> Norte/Oeste, 1 -> Sur/Este)
function deg2Tile(latDeg, lonDeg, zoom){
    const PI = Math.PI;
    const latRad = latDeg * PI /180;
    const n = 1 << zoom; // Potencia de 2
    const xTile = (lonDeg + 180) / 360 * n;
    const yTile = (1 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / PI) / 2 * n;

    return [xTile, yTile];
};

//This returns the NW-corner of the square.
function tile2Deg(xTile, yTile, zoom){
    const PI = Math.PI;
    const n = 1 << zoom; // Potencia de 2
    const lonDeg = xTile / n * 360 - 180;
    const latRad = Math.atan(Math.sinh(PI * (1 - 2 * yTile / n)));
    const latDeg = latRad * 180/PI;

    return [latDeg, lonDeg];
};

const Map = React.createClass({
    getDefaultProps: function(){
        return {
            width: 960,
            height: 600,
            showTiles: true,
            tileset: defaultTileset,
            tileSize: 256,
            center: [-12.052751, -77.027893],
            zoom: 16,
        }
    },
    getTiles: function(){
        const width = this.props.width;
        const height = this.props.height;
        const tileSize = this.props.tileSize;

        const center = this.props.center;
        const zoom = this.props.zoom;

        // Primero hay que calcular cuantas tiles necesitamos agregar a
        // cada lado del centro
        const sideRows = Math.ceil((height-tileSize)/(tileSize*2));
        const sideCols = Math.ceil((width-tileSize)/(tileSize*2));

        // La posicion en Tiles del centro de la vista
        const centerTile = deg2Tile(center[0], center[1], zoom);

        const minX = Math.floor(centerTile[0]) - sideCols;
        const minY = Math.floor(centerTile[1]) - sideRows;

        const tiles = [];

        for (var j=0; j<2*sideRows+1; j++){
            const row = [];
            if ((minY+j < 0) || minY+j >= (1 << zoom)){
                row.push([null, null, zoom]);
                continue;
            }
            for (var i=0; i<2*sideCols+1; i++){
                row.push([((minX +(1 << (zoom+2))+i)%(1 << zoom)),
                          minY+j, zoom]);
            }
            tiles.push(row);
        }
        return {
            tiles: tiles,
            // Vector desplazamiento del centro del mapa respecto
            // al centro del tile central
            position: [tileSize*(centerTile[0]-Math.floor(centerTile[0])-0.5),
                       tileSize*(centerTile[1]-Math.floor(centerTile[1])-0.5)],
        }
    },
    getProjection: function(){
        const deg2View = this.deg2View;
        const view2Deg = this.view2Deg;
        
        return {
            deg2View,
            view2Deg
        };
    },
    deg2View: function(coords){
        const width = this.props.width;
        const height = this.props.height;

        const tileSize = this.props.tileSize;
        const zoom = this.props.zoom;
        const center = this.props.center;
        
        const centerTile = deg2Tile(center[0], center[1], zoom);

        const posTile = deg2Tile(coords[0], coords[1], zoom);

        return [(width/2 + (posTile[0]-centerTile[0])*tileSize),
                (height/2 + (posTile[1]-centerTile[1])*tileSize)];
    },
    view2Deg: function(coords){
        const width = this.props.width;
        const height = this.props.height;

        const tileSize = this.props.tileSize;
        const zoom = this.props.zoom;
        const center = this.props.center;

        const centerTile = deg2Tile(center[0], center[1], zoom);
        const posTile = [(centerTile[0] + (coords[0] - width/2)/tileSize),
                         (centerTile[1] + (coords[1] - height/2)/tileSize)];

        const posDeg = tile2Deg(posTile[0], posTile[1], zoom);
        
        return posDeg
    },
    render: function(){
        if (this.props.showTiles){
            var tileSize = this.props.tileSize;
            var tiles = this.getTiles();
            var tilesDims = [tiles.tiles[0].length,tiles.tiles.length]
            
            var mapContStyle = {
                position: "relative",
                overflow: "hidden",
                height: this.props.height,
                width: this.props.width,
            };
            var imgStyle = {
                display: "inline",
                margin:0,
            };

            var tileLayerStyle = {
                width: tileSize*(tiles.tiles[0].length),
                position: "absolute",
                left: -tiles.position[0]-(tileSize*tilesDims[0]-this.props.width)/2,
                top:  -tiles.position[1]-(tileSize*tilesDims[1]-this.props.height)/2,
                zIndex: 0,
            };
            var self = this;
            var rows = _.map(tiles["tiles"], function(row, i){
                const rowImages = _.map(row, function(tile, j){
                    return (<img src={self.props.tileset(tile, i)}
                                 draggable={false}
                                 style={imgStyle}
                                 width={tileSize}
                                 height={tileSize}
                                 key={"img-"+i+"-"+j}/>);
                });
                return (<div style={{height:tileSize}}
                             key={"row-"+i}>
                             {rowImages}
                </div>);
            });
        }

        // Capas
        var i = 0;
        const layers = React.Children.map(this.props.children, function(child){
            return (<div style={{zIndex: ++i,
                                 width: "100%",
                                 height: "100%",
                                 position: "absolute"}}>
                    {React.cloneElement(child, {projection: this.getProjection(),
                                                center: this.props.center,
                                                width: this.props.width,
                                                height: this.props.height,
                                                zoom: this.props.zoom,
                     })}
            </div>);
        }, this);

        return (<div id="map-container"
                     ref={(ref) => this.node = ref}
                     style={mapContStyle}>
                <div id="tile-layer"
                     style={tileLayerStyle}>
                    {rows}
                </div>
                {layers}
        </div>);
    }
});

export {Map};
