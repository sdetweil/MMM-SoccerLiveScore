var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
    start: function () {
        console.log('MMM-SoccerLiveScore helper started...')
    },

    getTeamLogo: function (teamId) {
        var self = this;
        var options = {
            method: 'GET',
            url: 'https://www.ta4-images.de/ta/images/teams/'+teamId+'/64',
            headers: {
                'Host': 'www.ta4-images.de',
                'Accept': '*/*',
                'Accept-Language': 'de-de',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'gzip, deflate',
                'User-Agent': 'TorAlarm/20161206 CFNetwork/808.1.4 Darwin/16.1.0'
            },
            encoding: null
        };


        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            var image = new Buffer(body).toString('base64');
            self.sendSocketNotification('LOGO', {teamId: teamId, image: image});

        });


    },

    getLeagueIds: function (leagues, showLogos) {
        var self = this;
        var options = {
            method: 'POST',
            url: 'https://www.ta4-data.de/ta/data/competitions',
            headers: {
                'Host': 'ta4-data.de',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'User-Agent': 'TorAlarm/20161202 CFNetwork/808.1.4 Darwin/16.1.0',
                'Accept-Language': 'de-de',
                'Accept-Encoding': 'gzip',
                'Content-Length': '49',
            },
            body: '{"lng":"de-DE","device_type":0,"decode":"decode"}',
            form: false
        };

        request(options, function (error, response, body) {
            var competitions = JSON.parse(body).competitions;
            var leagueIds = [];
            for (var i = 0; i < leagues.length; i++) {
                for (var j = 0; j < competitions.length; j++) {
                    if (competitions[j].name == leagues[i]) {
                        leagueIds.push(competitions[j].id)
                        self.sendSocketNotification('LEAGUES', {name: leagues[i], id: competitions[j].id});
                    }
                }
            }
            console.log(leagueIds);
            for (var i = 0; i < leagueIds.length; i++) {
                self.getScores(leagueIds[i]);
                if (showLogos) {
                    console.log('bla');
                    self.getTeams(leagueIds[i])
                }
            }

            //console.log(JSON.parse(body).competitions);
        });
    },

    getTeams: function (leagueId) {
        var self = this;
        var options = {
            method: 'POST',
            url: 'https://www.ta4-data.de/ta/data/competitions/' + leagueId.toString() + '/table',
            headers: {
                'Host': 'ta4-data.de',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'User-Agent': 'TorAlarm/20161202 CFNetwork/808.1.4 Darwin/16.1.0',
                'Accept-Language': 'de-de',
                'Accept-Encoding': 'gzip',
                'Content-Length': '49',
            },
            body: '{"lng":"de-DE","device_type":0,"decode":"decode"}',
            form: false
        };
        request(options, function (error, response, body) {
            var teamIds = [];
            var data = JSON.parse(body);
            for (var i = 0; i < data.data.length; i++) {
                for (var j = 0; j < data.data[i].table.length; j++) {
                    teamIds.push(data.data[i].table[j].team_id);
                }
            }
            self.getLogos(teamIds);
            console.log(teamIds);
        });
    },

    getLogos: function (teamIds) {
        var self = this;
        var logos = [];
        for (var i = 0; i<teamIds.length; i++) {
            self.getTeamLogo(teamIds[i]);
        }
        //console.log(logos);
    },

    getScores: function (leagueId) {
        var self = this;
        var options = {
            method: 'POST',
            url: 'https://www.ta4-data.de/ta/data/competitions/' + leagueId.toString() + '/matches/round/0',
            headers: {
                'Host': 'ta4-data.de',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'User-Agent': 'TorAlarm/20161202 CFNetwork/808.1.4 Darwin/16.1.0',
                'Accept-Language': 'de-de',
                'Accept-Encoding': 'gzip',
                'Content-Length': '49',
            },
            body: '{"lng":"de-DE","device_type":0,"decode":"decode"}',
            form: false
        }

        request(options, function (error, response, body) {
            var data = JSON.parse(body);
            var refreshTime = data.refresh_time * 1000;
            var standings = data.data;
            self.sendSocketNotification('STANDINGS', {leagueId: leagueId, standings: standings});
            setTimeout(function () {
                self.getScores(leagueId);
            }, refreshTime);
        });
    },


    socketNotificationReceived: function (notification, payload) {
        if (notification === 'CONFIG') {
            console.log(payload.leagues);
            this.getLeagueIds(payload.leagues, payload.showLogos);
            //this.getTeamLogo();
        }
    }

});
