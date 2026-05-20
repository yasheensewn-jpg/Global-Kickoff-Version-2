const fs = require('fs');
let txt = fs.readFileSync('games/dribble-slalom/main.js', 'utf8');

function replaceLogic(txt, pVar, cat, id) {
    const regex = new RegExp(`if \\(window\\.GK_State\\.economy\\.tokens >= economyPrice\\) \\{[\\s\\S]*?purchased${pVar} = true;[\\s\\S]*?refreshLockerRoomUI.*?\\}[\\s\\S]*?\\} else \\{[\\s\\S]*?alert.*?\\}[\\s\\S]*?\\}`);
    
    return txt.replace(regex, `if (window.purchaseItem && window.purchaseItem('slalom', '${cat}', '${id}')) {
                  purchased${pVar} = true;
                  refreshLockerRoomUI();
              } else {
                  alert('Not enough Tokens!');
              }`);
}

txt = replaceLogic(txt, 'Cleats', 'gear', 'cleats');
txt = replaceLogic(txt, 'Shades', 'gear', 'shades');
txt = replaceLogic(txt, 'Muffs', 'gear', 'muffs');
txt = replaceLogic(txt, 'Zidane', 'moves', 'zidane');
txt = replaceLogic(txt, 'Neymar', 'moves', 'neymar');
txt = replaceLogic(txt, 'Kroos', 'moves', 'kroos');

fs.writeFileSync('games/dribble-slalom/main.js', txt);
