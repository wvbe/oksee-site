import React from 'react';
import request from 'superagent';

function timeSince(date) {
	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = Math.floor(seconds / 31536000);
	if (interval > 1) {
		return interval + " years";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes";
	}
	return Math.floor(seconds) + " seconds";
}

function dateStr (str) {
	const date = new Date(str);

	return date.toISOString() + ' (' + timeSince(date) + ' ago)';
}

const pinnedRepositoryNames = [
	// 'xml-trident',
	'xml-renderer',
	'speak-softly',
	'ask-nicely',
	'knoftobor',
	// 'fotno',
	// 'interfais',
	'slimdom-sax-parser'
];

const viewFilters = {
	'all': () => true,
	'pinned': (item) => pinnedRepositoryNames.includes(item.name)
};


class ResponseCache {
	constructor (onRequest) {
		this.cache = {};
		this.onRequest = onRequest;
	}

	get (url) {
		this.cache[url] && this.onRequest(url);

		return this.cache[url] ?
			Promise.resolve(this.cache[url]) :
			request.get(url)
				.then(response => {
					this.cache[url] = response;
					return this.cache[url];
				});
	}
}


export default (app) => {
	const responseCache = new ResponseCache(url => app.secondaryLogger.log('XMLHttpRequest: ' + url));

	app.console
		.addCommand('code')
		.addOption('all', 'a', 'View all github repositories, or all commits for a repository')
		.addOption('limit', 'l', 'Limit results, defaults to 10 repositories or 3 commits')
		.addParameter('name', 'Github repository name')
		.setDescription('[placeholder] View portfolio items and code that I write')
		.setController((req, res) => {
			const limit = (req.options.limit ? parseInt(req.options.limit, 10) : 0) || //Respect limit option
				(req.options.all ? Infinity : 0) || // When viewing all, Infinity
				(req.parameters.name ? 3 : 0) || // When viewing the commit log, max 3
				3;

			res.log('CODE PROJECTS ON GITHUB');
			res.log('-------------------------');

			if (req.parameters.name) {
				res.log(<p>{ '  All: '}<a data-command={ 'code ' + req.parameters.name + ' --all' }>code {req.parameters.name} --all</a>.</p>);
				res.log(<p>{ '  Web: '}<a href={ 'https://github.com/wvbe/' + req.parameters.name } target="_blank">redir { 'https://github.com/wvbe/' + req.parameters.name }</a>.</p>);
			}
			else {
				res.log(<p>{ '  All: '}<a data-command={ 'code --all' }>code --all</a>.</p>);
				res.log(<p>{ '  Web: '}<a href="https://github.com/wvbe" target="_blank">redir https://github.com/wvbe</a>.</p>);
			}
			return responseCache.get('https://api.github.com/users/wvbe/repos')
				.then(response => {
					res.log('-------------------------');
					console.log(response.body);

					const items = response.body;

					if (!req.parameters.name) {
						res.log();
						items
							.sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
							.filter(viewFilters[req.options.all ? 'all' : 'pinned'])
							.slice(0, limit)
							.forEach((item, i) => {
								!!i && res.log();
								res.log('git clone ' + item.ssh_url);
								res.log('Updated: ' + dateStr(item.pushed_at));
								res.log(<p>{'View:    '}<a data-command={ 'code ' + item.name }>{ 'code ' + item.name }</a></p>);
								res.log();
								item.description && res.log('    ' + item.description);
								item.description && res.log();
							});

						return;
					}

					const item = items.find(item => item.name === req.parameters.name);

					if (!item) {
						throw new Error('Could not find github item "' + req.parameters.name + '"');
					}

					res.log('Downloading commit log...');
					return responseCache
						.get(item.commits_url.substr(0, item.commits_url.indexOf('{')))
						.then(response => {
							res.log(response.body.length + ' commits');
							res.log();
							response.body
								.sort((a, b) => Date.parse(b.commit.author.date) - Date.parse(a.commit.author.date))
								.slice(0, limit)
								.forEach(ci => {
									// commit e0ae6640c231714aceef4b9b47219391fa52f310
									// Author: wvbe <wybe@x-54.com>
									// Date:   Sat Oct 7 02:56:34 2017 +0200
									//
									// list command leftovers from a while ago
									res.log('commit ' + ci.sha);
									res.log('Author: ' + ci.commit.author.name + ' <' + ci.commit.author.email + '>');
									res.log('Date:   ' + dateStr(ci.commit.author.date));
									res.log();

									res.log(ci.commit.message.split('\n').map(line => '    ' + line).join('\n'));
									res.log();
								});
						});
				})
				.catch(response => {
					res.error('An error occurred: ' + response.message);
					console.log('err', response.body);
			});
		});
}
