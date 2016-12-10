Module.register("MMM-SoccerLiveScore", {

    defaults: {
        leagues: ['1. Liga', 'CL'],
        showNames: true,
        showLogos: true,
        liveOnly: false,
        displayTime: 5000


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

        if (this.config.leagues.length > 1) {
            this.changeLeague(this, 0);
        } else {
            this.setLeague(this);
        }
    },

    setLeague: function (self) {

        if (self.idList.length == 0) {

            setTimeout(function () {
                self.setLeague(self);
            }, 1000);
        } else {

            self.activeId = self.idList[0];
            self.updateDom(1000);
        }
    },


    changeLeague: function (self, count) {
        if (self.idList.length > 0) {
        if (count < self.idList.length) {

            self.activeId = self.idList[count];
            this.updateDom(1000);
            setTimeout(function () {
                self.changeLeague(self, count + 1);
            }, self.config.displayTime);
        } else {

            self.activeId = this.idList[0];
            this.updateDom(1000);
            setTimeout(function () {
                self.changeLeague(self, 1);
            }, self.config.displayTime);
        }
            } else {
                setTimeout(function () {
                self.changeLeague(self, 0);
            }, 1000);
            }


    },

    sendConfigs: function (self) {

        self.sendSocketNotification('CONFIG', {
            leagues: self.config.leagues,
            showLogos: self.config.showLogos
        });
    },


    getDom: function () {
        var wrapper = document.createElement("div");

        if (Object.getOwnPropertyNames(this.standings).length === 0) {
            wrapper.innerHTML = 'lade...'
            return wrapper;
        }
        wrapper.innerHTML = this.activeId;

        var activeLeagueStandings = this.standings[this.activeId];
        for (var i = 0; i<activeLeagueStandings.length; i++) {
            if (activeLeagueStandings[i].matches !== undefined){
            for (var j = 0; j<activeLeagueStandings[i].matches.length; j++) {
                console.log(activeLeagueStandings[i].matches[j].team1_name)
            }
                }
        }

        /* var wrapper = document.createElement("img");
         wrapper.id = 'blub';
         wrapper.src = 'https://www.ta4-images.de/ta/images/teams/4908/64';
         console.log('updated');*/
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
            this.updateDom();

        } else if (notification === 'LEAGUES') {
            this.idList.push(payload.id);
            this.leagueIds[payload.id] = payload.name;

        }
    }
});
