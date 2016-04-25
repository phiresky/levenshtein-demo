all: bin/.git bin/screenshot.png bin/index.html bin/main.js  bin/bundle.js

bin/index.html: index.html
	cp $< $@
	patch bin/index.html < src/index-dist.patch

bin/screenshot.png: screenshot.png
	cp $< $@

bin/main.js: src/main.tsx
	tsc

bin/bundle.js: bin/main.js
	jspm bundle-sfx bin/main bin/bundle.js --minify

bin/.git:
	[ -f bin/.git ] || git worktree add bin/ gh-pages

gh-pages: all
	cd bin; git add -A; git commit -m'update binaries'; git push

.PHONY: gh-pages

