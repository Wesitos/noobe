import React from "react";
import ReactDOM from "react-dom";

const onResizeMixin = {
    _runningResize: false,
    _onResizeHandler: function() {
        if (!this._runningResize) {
            this._runningResize = true;

            var cb = function() {
                this.onResizeHandler();
                this._runningResize = false;
            }.bind(this);

            if (window.requestAnimationFrame) 
                window.requestAnimationFrame(cb);
            else 
                setTimeout(cb, 66);
        }
    },
    componentDidMount: function(){
        window.addEventListener("resize", this._onResizeHandler);
    },
    componentWillUnmount: function(){
        window.removeEventListener("resize", this._onResizeHandler);
    },
};
;

export {onResizeMixin};
