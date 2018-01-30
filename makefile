
all:
	@echo Specify 'pull', 'config', 'install' or 'run'

pull:
	git pull

config:
	node ./scripts/install-config.js

install:
	git pull
	npm install -g

run:
	git pull
	npm install -g
	node ./scripts/install-config.js
	homebridge
