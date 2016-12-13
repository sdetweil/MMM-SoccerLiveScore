/* global Module */

/* Magic Mirror
 * Module: MMM-SoccerLiveScore
 *
 * By Luke Scheffler https://github.com/LukeSkywalker92
 * MIT Licensed.
 */

Module.register("MMM-SoccerLiveScore", {

    defaults: {
        leagues: [35, 1, 9],
        showNames: true,
        showLogos: true,
        displayTime: 60 * 1000
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
            wrapper.innerHTML = '';
            return wrapper;
        }

        var matches = document.createElement('table');
        matches.className = 'xsmall';
        var title = document.createElement('header');
        title.innerHTML = this.leagueIds[this.activeId];
        wrapper.appendChild(title);


        var activeLeagueStandings = this.standings[this.activeId];
        for (var i = 0; i < activeLeagueStandings.length; i++) {
            if (activeLeagueStandings[i].matches !== undefined) {

                var time_row = document.createElement('tr');
                var time = document.createElement('td');
                time.innerHTML = moment(activeLeagueStandings[i].time * 1000).format('DD.MM - HH:mm');
                time.className = 'MMM-SoccerLiveScore-time';
                time.setAttribute('colspan', '7');
                time_row.appendChild(time);
                matches.appendChild(time_row);

                for (var j = 0; j < activeLeagueStandings[i].matches.length; j++) {

                    var match = document.createElement('tr');

                    if (this.config.showNames) {
                        var team1_name = document.createElement('td');
                        team1_name.setAttribute('align', 'left');
                        team1_name.innerHTML = activeLeagueStandings[i].matches[j].team1_name;
                        match.appendChild(team1_name);
                    }

                    if (this.config.showLogos) {
                        var team1_logo_cell = document.createElement('td');
                        var team1_logo_image = document.createElement('img');
                        team1_logo_image.className = 'MMM-SoccerLiveScore-team1_logo';
                        team1_logo_image.src = 'data:image/png;base64, ' + this.logos[activeLeagueStandings[i].matches[j].team1_id];
                        team1_logo_image.width = 20;
                        team1_logo_image.height = 20;
                        team1_logo_cell.appendChild(team1_logo_image);
                        match.appendChild(team1_logo_cell);
                    }

                    var team1_score = document.createElement('td');
                    team1_score.setAttribute('width', '15px');
                    team1_score.setAttribute('align', 'center');
                    team1_score.innerHTML = activeLeagueStandings[i].matches[j].team1_goals;
                    var collon = document.createElement('td');
                    collon.innerHTML = ':';
                    var team2_score = document.createElement('td');
                    team2_score.setAttribute('width', '15px');
                    team2_score.setAttribute('align', 'center');
                    team2_score.innerHTML = activeLeagueStandings[i].matches[j].team2_goals;
                    match.appendChild(team1_score);
                    match.appendChild(collon);
                    match.appendChild(team2_score);

                    if (activeLeagueStandings[i].matches[j].status != 0 && activeLeagueStandings[i].matches[j].status != 100) {
                        team1_score.classList.add('MMM-SoccerLiveScore-red');
                        collon.classList.add('MMM-SoccerLiveScore-red');
                        team2_score.classList.add('MMM-SoccerLiveScore-red');
                    }

                    if (this.config.showLogos) {
                        var team2_logo_cell = document.createElement('td');
                        var team2_logo_image = document.createElement('img');
                        team2_logo_image.className = 'MMM-SoccerLiveScore-team2_logo';
                        team2_logo_image.src = 'data:image/png;base64, ' + this.logos[activeLeagueStandings[i].matches[j].team2_id];
                        team2_logo_image.width = 20;
                        team2_logo_image.height = 20;
                        team2_logo_cell.appendChild(team2_logo_image);
                        match.appendChild(team2_logo_cell);
                    }

                    if (this.config.showNames) {
                        var team2_name = document.createElement('td');
                        team2_name.setAttribute('align', 'right');
                        team2_name.innerHTML = activeLeagueStandings[i].matches[j].team2_name;
                        match.appendChild(team2_name);
                    }

                    matches.appendChild(match);

                }
            }
        }

        wrapper.appendChild(matches);
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'LOGO') {
            this.logos[payload.teamId] = payload.image;
        } else if (notification === 'STANDINGS') {
            this.standings[payload.leagueId] = payload.standings;
            this.updateDom();
        } else if (notification === 'LEAGUES') {
            this.idList.push(payload.id);
            this.leagueIds[payload.id] = payload.name;
        }
    }
});
