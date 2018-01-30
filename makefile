
all:
	@echo Specify 'pull', 'config', 'install' or 'run'

pull:
	git pull

config:
	node ./scripts/install-config.js

install:
	npm install -g

run:
	homebridge
