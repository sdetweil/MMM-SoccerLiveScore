var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
			start: function () {
				console.log('MMM-SoccerLiveScore helper started...')
			},

			getTeamLogo: function (teamId) {
				var self = this;
				var imageOptions = {
					method: 'GET',
					url: 'https://www.ta4-images.de/ta/images/teams/4908/64',
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

				request(imageOptions, function (error, response, body) {
					if (error) throw new Error(error);
					var image = new Buffer(body).toString('base64');
					self.sendSocketNotification('IMG', image);
					console.log(image);
				});


			},


	socketNotificationReceived: function (notification, payload) {
		if (notification === 'TEST') {
			console.log('test');
			this.getTeamLogo();
		}
	}

});
