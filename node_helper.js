/* global Module */

/* Magic Mirror
 * Module: MMM-SoccerLiveScore
 *
 * By Luke Scheffler https://github.com/LukeSkywalker92
 * MIT Licensed.
 */

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
            url: 'https://www.ta4-images.de/ta/images/teams/' + teamId + '/64',
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
            self.sendSocketNotification('LOGO', {
                teamId: teamId,
                image: image
            });

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
                    if (competitions[j].id == leagues[i]) {
                        if (showLogos) {
                            if (competitions[j].has_table) {
                                self.getTeams(competitions[j].id);
                                self.getTable(competitions[j].id);
                            } else {
                                self.getLogosFromScores(competitions[j].id);
                            }
                        }
                        leagueIds.push(competitions[j].id)
                        self.sendSocketNotification('LEAGUES', {
                            name: competitions[j].name,
                            id: competitions[j].id
                        });
                    }
                }
            }
            for (var i = 0; i < leagueIds.length; i++) {
                self.getScores(leagueIds[i]);
            }
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
        });
    },

    getTable: function (leagueId) {
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
            var refreshTime = data.refresh_time*1000;
            data = data.data;
            if (data.length == 1) {
                self.sendSocketNotification('TABLE', {
                    leagueId: leagueId,
                    table: data[0].table
                });
                setTimeout(function () {
                    self.getTable(leagueId);
                }, refreshTime);
            }
        });
    },

    getLogos: function (teamIds) {
        var self = this;
        var logos = [];
        for (var i = 0; i < teamIds.length; i++) {
            self.getTeamLogo(teamIds[i]);
        }
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
            self.sendSocketNotification('STANDINGS', {
                leagueId: leagueId,
                standings: standings
            });
            setTimeout(function () {
                self.getScores(leagueId);
            }, refreshTime);
        });
    },

    getLogosFromScores: function (leagueId) {
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
            var standings = data.data;
            for (var i = 0; i < standings.length; i++) {
                if (standings[i].matches !== undefined) {
                    for (var j = 0; j < standings[i].matches.length; j++) {
                        self.getTeamLogo(standings[i].matches[j].team1_id);
                        self.getTeamLogo(standings[i].matches[j].team2_id);
                    }
                }
            }
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'CONFIG') {
            this.getLeagueIds(payload.leagues, payload.showLogos);
        }
    }

});
