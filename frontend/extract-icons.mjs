import * as fs from 'fs';
import * as Gi from 'react-icons/gi';
import { renderToString } from 'react-dom/server';
import React from 'react';

const targets = ['Rat', 'Cat', 'Dog', 'Wolf', 'Leopard', 'Tiger', 'Lion', 'Elephant'];

const matches = {};
for (const key of Object.keys(Gi)) {
    const lowerKey = key.toLowerCase();
    for (const target of targets) {
        if (lowerKey.includes(target.toLowerCase())) {
            matches[target] = matches[target] || [];
            matches[target].push(key);
        }
    }
}

console.log('Matches:', matches);

// Let's pick the best ones manually, or just use the first one that looks like a head
const selected = {
    rat: 'GiRat',
    cat: 'GiCat',
    dog: 'GiHound', // or GiSittingDog
    wolf: 'GiWolfHead',
    leopard: 'GiLeopardHead',
    tiger: 'GiTigerHead',
    lion: 'GiLion',
    elephant: 'GiElephantHead'
};

const svgs = {};
for (const [animal, iconName] of Object.entries(selected)) {
    const IconComponent = Gi[iconName];
    if (IconComponent) {
        const svgString = renderToString(React.createElement(IconComponent));
        svgs[animal] = svgString;
    } else {
        console.log(`Warning: ${iconName} not found!`);
        // fallback search
        if (matches[animal.charAt(0).toUpperCase() + animal.slice(1)]) {
            console.log(`Try one of: ${matches[animal.charAt(0).toUpperCase() + animal.slice(1)].join(', ')}`);
        }
    }
}

fs.writeFileSync('./src/utils/animalSvgs.json', JSON.stringify(svgs, null, 2));
console.log('Saved to src/utils/animalSvgs.json');
