import React, { useState,useEffect,useCallback } from "react";
//主页面
export function TwilightCounterMainPanel() {
    return (
    <Panel className="display-slot" style={{ width: '100%', height: '100%'}}>
        <Image id="RightSideHeroBlur" src='file://{images}/guitaijiemian.png' hittest={false} 
        style={{ width: '80%', height: '80%', margin: '4px', border: '2px dashed #666', 
        borderRadius: '4px', backgroundColor:'#1a1a1a' }}/>
    </Panel>
  );
}
