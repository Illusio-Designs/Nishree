import React from 'react';
import './CookingLoader.css';

const CookingLoader = () => {
  return (
    <div className="cooking-loader-overlay">
      <div className="cooking-loader-container">
        <div className="cooking-scene">
          {/* Fire/Heat Effect */}
          <div className="fire-container">
            <div className="flame flame-1"></div>
            <div className="flame flame-2"></div>
            <div className="flame flame-3"></div>
          </div>
          
          {/* Cooking Pot */}
          <div className="pot">
            <div className="pot-handle pot-handle-left"></div>
            <div className="pot-handle pot-handle-right"></div>
            <div className="pot-body">
              <div className="pot-shine"></div>
            </div>
            <div className="pot-lid">
              <div className="pot-lid-knob"></div>
              <div className="lid-shine"></div>
            </div>
          </div>
          
          {/* Steam */}
          <div className="steam-container">
            <div className="steam steam-1"></div>
            <div className="steam steam-2"></div>
            <div className="steam steam-3"></div>
            <div className="steam steam-4"></div>
          </div>
          
          {/* Bubbles */}
          <div className="bubbles">
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>
            <div className="bubble bubble-4"></div>
          </div>
          
          {/* Spices falling */}
          <div className="spices-container">
            <div className="spice spice-1">✦</div>
            <div className="spice spice-2">✧</div>
            <div className="spice spice-3">✦</div>
            <div className="spice spice-4">✧</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookingLoader;
