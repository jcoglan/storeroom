SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)

.PHONY: all clean

all:
	webpack --config webpack.config.js --display-modules --watch

clean:
	rm -rf {examples,spec}/bundles examples/.store
