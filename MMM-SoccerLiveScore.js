Module.register("MMM-SoccerLiveScore", {

	defaults: {
		bla: 'blub'
	},

	getScripts: function () {
		return ["moment.js"];
	},

	getStyles: function () {
		return ["MMM-SoccerLiveScore.css"]
	},

	start: function () {
		this.test(this)
	},

	test: function (self) {
		console.log('test');
		self.sendSocketNotification('TEST', 'Test');
	},

	getDom: function () {
		var wrapper = document.createElement("img");
		wrapper.id='blub';
		wrapper.src='https://www.ta4-images.de/ta/images/teams/4908/64';
		return wrapper;
	},

	socketNotificationReceived: function (notification, payload) {
		Log.info(notification);
		if (notification === 'IMG') {
			var bla = document.getElementById('blub');
			bla.src = 'data:image/png;base64, '+ payload;
			bla.width=32;
			bla.height=32;
			console.log(payload);
		}
	}
});
