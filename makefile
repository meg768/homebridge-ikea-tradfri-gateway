

config:
	node ./scripts/install-config.js

run:
	git pull
	node ./scripts/install-config.js
	homebridge
