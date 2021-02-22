// config.forge.js
const path = require('path');

module.exports = {
    electronPackagerConfig: {
        icon: path.resolve(__dirname, 'src/assets/app/icon/icon.ico')
    },
    publishers: [{
        name: "@electron-forge/publisher-github",
        config: {
            repository: {
                owner: "UltimatumGamer",
                name: "P-DashboardDesktopApp"
            }
        }
    }],
    packagerConfig: {
        "icon": "./src/assets/app/icon/icon.ico",
        "iconUrl": "https://raw.githubusercontent.com/UltimatumGamer/P-DashboardDesktopApp/master/src/assets/app/icon/icon.ico"
    },
    makers: [{
        name: "@electron-forge/maker-squirrel",
        config: {
            name: "p-dashboard-app",
            setupIcon: "./src/assets/app/icon/icon.ico",
            iconUrl: "https://raw.githubusercontent.com/UltimatumGamer/P-DashboardDesktopApp/master/src/assets/app/icon/icon.ico"
        }
    },
    {
        name: "@electron-forge/maker-zip",
        platforms: [
            "darwin"
        ]
    },
    {
        name: "@electron-forge/maker-deb",
        config: {}
    },
    {
        name: "@electron-forge/maker-rpm",
        config: {}
    }
    ]
}