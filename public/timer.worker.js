let intervalId;

function startTimer({ interval = 1000 }) {
	if (intervalId) {
		stopTimer();
	} else {
		postMessage("TICK");
		intervalId = setInterval(() => {
			postMessage("TICK");
		}, interval);
	}
}

function stopTimer() {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = undefined;
	}
}

function handleMainThreadMessage({ data }) {
	const { type, payload } = data;
	switch (type) {
		case "START_TIMER":
			startTimer(payload);
			break;
		case "STOP_TIMER":
			stopTimer();
			break;
		default:
			break;
	}
}

self.onmessage = handleMainThreadMessage;
