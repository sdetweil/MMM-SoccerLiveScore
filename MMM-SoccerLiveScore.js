Module.register("MMM-SoccerLiveScore", {

    defaults: {
        leagues: ['1. Liga', 'CL'],
        showNames: true,
        showLogos: true,
        liveOnly: false


    },

    getScripts: function () {
        return ["moment.js"];
    },

    getStyles: function () {
        return ["MMM-SoccerLiveScore.css"]
    },

    start: function () {
        this.loadet = false;
        this.logos = {};
        this.standings = {};
        this.leagueIds = {};
        this.idList = [];
        this.activeId = 0;
        this.sendConfigs(this);
        this.showStandings(this);
    },

    showStandings: function (self) {
        if (this.standings.length > 0) {
            this.loadet = true;
            this.updateDom()
        } else {
            setTimeout(function () {
                self.showStandings(self);
            }, 1000)
        }
    },

    sendConfigs: function (self) {

        self.sendSocketNotification('CONFIG', {leagues: self.config.leagues, showLogos: self.config.showLogos});
    },


    getDom: function () {
        var wrapper = document.createElement("img");
        wrapper.id = 'blub';
        wrapper.src = 'https://www.ta4-images.de/ta/images/teams/4908/64';
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        Log.info(notification);
        if (notification === 'IMG') {
            var bla = document.getElementById('blub');
            bla.src = 'data:image/png;base64, ' + payload;
            bla.width = 32;
            bla.height = 32;
            //console.log(payload);
        } else if (notification === 'LOGO') {
            this.logos[payload.teamId] = payload.image;
            //console.log(this.logos);
        } else if (notification === 'STANDINGS') {
            this.standings[payload.leagueId] = payload.standings;
            console.log(this.standings);
        } else if (notification === 'LEAGUES') {
            this.idList.push[payload.id];
            this.leagueIds[payload.id] = payload.name;
            //console.log(this.leagueIds);
        }
    }
});
