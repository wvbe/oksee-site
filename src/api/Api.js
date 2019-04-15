import Console from './Console';
import Logger from './Logger';
import Store from './Store';
import EventEmitter from '../util/EventEmitter';
import debounce from '../util/debounce';

function turnIntoMysteriousString (str) {
	return new Buffer(str)
		.toString('base64')
		.split('')
		.slice(0,16)
		.reduce((str, letter, i) => {
			if(i && i % 4 === 0) str += '-';
			str += letter;
			return str;
		}, '')
		.toUpperCase();
}

const CONFIG = Symbol('config');
const QUEUE = Symbol('submit queue');


const debounced = {
	fakeExceptionReport: debounce(60000, (index, logger) => {
		logger.log(`Send ExceptionReport (${index})`, `debug`);

		setTimeout(() => {
			logger.log(`Send ExceptionReport OK`, `debug`);
		}, 500 + Math.random() * 500)
	})
};


// EVENTS:
// busy - Emits an updated list of reasons why the UI is simulated to be busy. If length is 0 the system is not busy.
// window:new - A new window was opened. Two arguments for name and contents resp.
// window:destroy - A window of given name was closed

export default class Api extends EventEmitter {
	constructor (config) {
		super();

		this[CONFIG] = config;
		this[QUEUE] = [];

		this.busyReasons = [];

		this.console = new Console();
		this.store = new Store();

		this.primaryLogger = new Logger();
		this.secondaryLogger = new Logger();

		this.store.setDefault('history', []);

		this.on('api:submit:success', command => {
			this.track('Executed a commaned', command);
		});

		this.on('api:submit:error', (command, error) => {
			this.track('Encountered an error during a command', command, error.message);

			// @TODO track "api submit-error"
			// Format a nice error message and print something cool. Errors are, after all, the best features of
			// this site.
			let mysteriousString = turnIntoMysteriousString(error.message || error);

			this.primaryLogger.error(error.message || error);

			error.stack && error.stack.split('\n')
				.slice(1)
				.forEach(msg => this.primaryLogger.log('    ' + msg.trim()));

			this.primaryLogger.log(mysteriousString, 'Log ID');
			setTimeout(() => {
				this.secondaryLogger.log([
					'Exception',
					mysteriousString,
					new Date().toString()
				].join(' '), `debug`);
			}, 250);

			debounced.fakeExceptionReport(this.secondaryLogger);
		});
	}

	config (name, value) {
		if (value === undefined)
			return this[CONFIG][name];

		this[CONFIG][name] = value;
	}

	emit (...args) {
		super.emit(...args);
	}

	submit (content) {
		if(!content || !content.trim())
			return;

		if(this.busyReasons.length) {
			// @TODO: Track "api submit-busy"
			this[QUEUE].push(content);
			return;
		}

		window.history.pushState({
				input: content
			},
			content,
			'#!/' + (content.indexOf(' ') >= 0 ? '~' + new Buffer(content).toString('base64') : content));

		this.store.set('last-submit', new Date().getTime());

		let history = this.store.get('history');
		if(!history.length || history[history.length - 1] !== content) {
			this.store.push('history', content);
		}

		this.primaryLogger.input(content);

		var unsetBusy = this.setBusyReason(`executing: ${content}`);

		this.console.input(content, this.primaryLogger)
			.then(() => {
				this.emit('api:submit:success', content);
			})
			.catch(error => {
				this.emit('api:submit:error', content, error);
			})
			.then(() => {
				unsetBusy();
				if(this[QUEUE].length)
					this.submit(this[QUEUE].shift());
			});
	}

	setBusyReason (reason) {
		if(this.busyReasons.indexOf(reason) >= 0)
			throw new Error('Already in this busy state');

		this.busyReasons.push(reason);

		this.emit('busy', this.busyReasons);

		return () => {
			this.busyReasons.splice(this.busyReasons.indexOf(reason), 1);
			this.emit('busy', this.busyReasons);
		}
	}

	track (description, label, value) {
		// @TODO deprecate function
	}
}
