import React, { useState,useEffect } from "react";
import { useMemo, type FC } from 'react';
export function MainPanel() {
    const [Test, setTest] = useState<[string, string, string][]>([['显示','xianshi','lua']]);
	useEffect(() => {
		/*
        切换面板
        ui 前端  lua 后端  all 前端后端都切换
        */ 
        GameEvents.Subscribe<{value: string}>("test", data => {
            if(data.value=='yincang'){
                setTest([['显示','xianshi','lua']])
            }else if(data.value=='xianshi'){
                setTest([
                        ['主页面','twilight_counter_main','ui'],
                        ['顾客','guke','lua'],
                        ['隐藏','yincang','lua']
                         
                        

                        
                ])
            }
        });
	}, []);  

    function Hang({slot}:{slot:number}){
        function onactivate() {
            const [label, action, type]= Test[slot];
            $.Msg(label, action, type);

            if (type === 'ui') {
                GameUI.global.twilight_counter_main();
                return;
            }

            if (type === 'lua') {
                GameEvents.SendCustomGameEventToServer<object> ('test', { value: action });
                return;
            }
            // 兜底：同时执行 UI 和 Lua
            GameUI.global[action] = !GameUI.global[action];
            GameEvents.SendCustomGameEventToServer<object>('test', { value: action });
        }
        return (<Label onactivate={onactivate} style={{height:'45px',width:'120px',  color: "red", fontSize: "25px",border: '5px solid #222222',backgroundColor: '#fcf7f7dd'}} text={Test[slot][0]} />)
    }  
    return (
        <Panel id={'daojv'} style={{ flowChildren: "down", verticalAlign: "bottom", horizontalAlign: "left"}} hittest={false}>
            {[...Array(Test.length).keys()].map((key) => {return <Hang key={key.toString()} slot={key} />}) }    
            <Label id={'jiazai'} />
        </Panel>
    );
}  
