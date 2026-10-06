import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';
import { MainPanel } from './main';
import {TwilightCounterMainPanel} from '../hud/trade/components/twilight_counter_main';
import {TradePanel} from './trade/App';

/** 隐藏一些默认的UI元素 */
//import '../utils/hide-default-hud';
import { render } from 'react-panorama-x';
import React, { useState,useEffect,useCallback } from "react";


declare global {
    interface CDOTA_PanoramaScript_GameUI {
        global?: any;
    }
}


function GameState() {
    $.Msg('kaishiyunxing     ',Game.GetState())
    GameUI.global ={};
    if(Game.GetState() == DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS){
        render(<Root />, $('#main'));
        //render(<MainPanel />, $('#main'));
        //App()
        //render(<TwilightCounterMainPanel />, $('#twilight_counter_main'));
        return 
    }
    $.Schedule(1, GameState);
}
GameState()



function Root() {
  const [visible, setVisible] = useState(false);

  const controlFn = useCallback((force?: boolean) => {
    if (force !== undefined) {
      setVisible(force);
    } else {
      setVisible(prev => !prev);
    }
  }, []);
  
  useEffect(() => {
    GameUI.global.twilight_counter_main = controlFn;
    return () => { delete GameUI.global.twilight_counter_main };
  }, [controlFn]);

    return (
        <Panel style={{ width: '100%', height: '100%' }}>
            <MainPanel />
            <TradePanel />
            {visible && <TwilightCounterMainPanel />}
        </Panel>
    );
}



























// 注册自定义按键
// registerCustomKey('D');
// registerCustomKey('F');

// 当按下F时，会发送游戏事件到服务器，这种用法更为常用
// setKeyDownCallback('F', () => {
//     console.log(`按下了F键!!`);
//     GameEvents.SendCustomGameEventToServer('c2s_test_event', { key: 'F' });
// });

// const Root: FC = () => {
//     const url = `https://github.com/XavierCHN/x-template`;
//     const go = React.useCallback(() => {
//         // 点击只有弹出一个提示框，然后打开链接，这是一个简单的例子，用来展示如何使用sequential-actions
//         const wait = new WaitAction(0.5);
//         const showTextTooltip = new DispatchEventAction(`DOTAShowTextTooltip`, $(`#QRCode`), `正在打开链接`);
//         const hideTextTooltip = new DispatchEventAction(`DOTAHideTextTooltip`, $(`#QRCode`));
//         const playSound = new FunctionAction(() => PlayUISoundScript('DotaSOS.TestBeep'));
//         const gotoUrl = new DispatchEventAction(`ExternalBrowserGoToURL`, url);
//         RunSequentialActions([showTextTooltip, wait, hideTextTooltip, wait, playSound, gotoUrl]);
//     }, [url]);

//     // 当按下D时，会使二维码放大1.5倍，在这里作为一个在react中使用按键hook的示例
//     const dPressed = useKeyPressed(`D`);

//     return (
//         <>
//             {
//                 // 显示一个二维码作为范例
//                 <PanoramaQRCode
//                     style={{ preTransformScale2d: dPressed ? `1.5` : `1` }}
//                     id="QRCode"
//                     onactivate={go}
//                     value={url}
//                     size={128}
//                     excavate={8}
//                     className={`QRCode`}
//                 >
//                     <Image
//                         src="file://{images}/logos/dota_logo_bright.psd"
//                         style={{ width: `32px`, height: `32px`, horizontalAlign: `center`, verticalAlign: `center` }}
//                     />
//                 </PanoramaQRCode>
//             }
//         </>
//     );
// };

//render(<Root />, $.GetContextPanel());
