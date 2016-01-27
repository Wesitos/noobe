import React from "react";
import _ from "lodash";

function coroutine(f, thisArg){
    // inicializa el generador
    var co = f();
    // ejecuta hasta el primer yield
    co.next();
    return function(e){
        co.next(e);
    };
};

const MapNav = React.createClass({
    mousePosViewFromEvent: function(event){
        var rect = this.node.getBoundingClientRect();
        var posView = [event.pageX-rect.left,event.pageY-rect.top];
        return posView;
    },
    mouseEventHandler: function* (_){
        // el parametro es solo para no tener que
        // hacer "const _ = undefined"
        // "yield" siempre recibe un valor de retorno
        var event;
        var pos;
        var newPos;
        // Espera un evento
        while(event = yield _){
            while (event.type == "mousedown"){
                pos = [event.pageX, event.pageY];
                // Espera otro evento
                while(event = yield _){
                    if(event.type == "mousemove"){
                        newPos = [event.pageX, event.pageY]
                        this.translate(pos, newPos);
                        pos = newPos;
                    }
                    if(event.type == "mouseup"
                                  || event.type == "mouseleave")
                        break;
                }
            }
        }
    },
    mouseWheelHandler: function(event){
        const projection = this.props.projection
        const deltaY = event.deltaY;
        this.props.onZoom(deltaY<0?1:-1,
                          projection.view2Deg(this.mousePosViewFromEvent(event)));
    },
    componentWillMount: function(){
        this.mouseEventHandler = coroutine(this.mouseEventHandler, this);
    },
    translate: function(initialPosView, finalPosView){
        const width = this.props.width;
        const height = this.props.height;
        const projection = this.props.projection;
        const deltaPosView = [finalPosView[0] - initialPosView[0],
                              finalPosView[1] - initialPosView[1]];
        const newCenterView = [width/2 - deltaPosView[0],
                               height/2 - deltaPosView[1]]

        const newCenterDeg =  projection.view2Deg(newCenterView);
        
        this.props.onTranslate(newCenterDeg);
    },
    render: function(){
        return(
            <div ref={(ref) => this.node = ref}
                 style={{height:this.props.height,
                         width:this.props.width,
                         cursor: "move"}}
                 onClick={this.mouseEventHandler}
                 onDoubleclick={this.mouseEventHandler}
                 onMouseLeave={this.mouseEventHandler}
                 onMouseMove={this.mouseEventHandler}
                 onMouseDown={this.mouseEventHandler}
                 onMouseUp={this.mouseEventHandler}
                 onWheel={this.mouseWheelHandler}/>
        )
    }
})

    export {MapNav};
