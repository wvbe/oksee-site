import React, {Component} from 'react';

import MenuComponent from './menu/MenuComponent';
import BigBadAccordeon from './console/BigBadAccordeon';
import FlagComponent from './components/FlagComponent';
import ConsoleInputComponent from './console/ConsoleInputComponent';
import WindowContainerComponent from './window/WindowContainerComponent';

import api from './api';
import * as styles from './styles';

const primaryLogger = api.primaryLogger;
const secondaryLogger = api.secondaryLogger;

window.addEventListener('hashchange', event => {
	const hashbang = (window.location.hash || '').trim();
	const content = hashbang && hashbang.substr(0,3) === '#!/'
			? hashbang.substr(3,1) === '~'
				? new Buffer(hashbang.substr(4), 'base64').toString()
				: hashbang.substr(3)
			: '';

	api.secondaryLogger.log('Submit "' + content + '"', 'hash');
	api.submit(content);
});

window.addEventListener('click', event => {
	if(event.target.getAttribute('no-capture'))
		return;

	const command = event.target.getAttribute('data-command'),
		href = event.target.getAttribute('href');

	if(command) {
		api.emit('anchor:click:command', command);

		event.preventDefault();
	}
	else if(href) {
		api.emit('anchor:click:href', href);
	}
});

api.on('menu-item:click', command => {
	api.track('navigation', 'menu-item:click', command);
	api.secondaryLogger.log('Click: ' + command, 'menu');
});
api.on('window:new:success', name => {
	api.track('navigation', 'window:new:success', name);
	api.secondaryLogger.log('New: ' + name, 'window');
});
api.on('anchor:click:command', command => {
	api.track('navigation', 'anchor:click:command', command);
	api.secondaryLogger.log('Click: ' + command, 'anchor');
	api.submit(command);
});

api.on('anchor:click:href', href => {
	api.track('navigation', 'anchor:click:href', href);
	api.secondaryLogger.log('Redir "' + href + '"', 'href');
	api.submit('redir ' + href);
});
api.on('app:init:hashbang', (decoded, hashbang) => {
	api.track('entry', 'init:hashbang', decoded);
	primaryLogger.log('OK, opening request: ' + hashbang, 'init');
	api.submit(decoded);
});
api.on('app:init:pristine', () => {
	api.track('entry', 'init:pristine');
	primaryLogger.log('OK, opening default request: #!/motd', 'init');
	api.submit('motd');
});

const versionNumber = 'v5-rc1';
function playBootSequence () {
	let bootTimeLength = api.config('bootTimeLength'),
		unsetBusyReason = api.setBusyReason('console offline');

	// Bunch of rubarb
	secondaryLogger.log('', '$');
	secondaryLogger.log('', 'Request URL');
	secondaryLogger.log('GET', 'Method');
	secondaryLogger.log('', 'Status code');
	secondaryLogger.log('', 'Connection');

	setTimeout(() => {
		secondaryLogger.log('', 'SWS-Ext.');
		secondaryLogger.log('', 'SWS-Key');
		secondaryLogger.log('', 'SWS-Accept');
		secondaryLogger.log(' ' + versionNumber + ')', 'New client');
		secondaryLogger.log('', 'init');
	}, bootTimeLength/2);

	primaryLogger.log('wyb.be ' + versionNumber + ', waiting for OK...', 'init');

	// Start running the initial command: something from the URL hash or 'motd'
	setTimeout(() => {
		const lastVisit = api.store.get('last-submit'),
			history = api.store.get('history');

		if(lastVisit) {
			primaryLogger.log(`Welcome back, last visited on: ${new Date(parseInt(lastVisit, 10))}`);
			primaryLogger.log(`  found ${history.length} commands in your history`);
			primaryLogger.log(<div>Type <a data-command="tracking clear">tracking clear</a> to wipe your data or <a data-command="tracking history">tracking history</a> to view.</div>);
		}
		else {
			primaryLogger.log(`Looks like you haven't visited before, welcome!`);
		}
	}, bootTimeLength * 0.7);

	setTimeout(() => {
		// More rubarb
		secondaryLogger.log('OK', 'init');

		unsetBusyReason();

		const hashbang = (window.location.hash || '').trim();
		if(hashbang.length > 3 && hashbang.substr(0,3) === '#!/') {
			let trimmedHashbang = hashbang.length <= 48
				? hashbang
				: (hashbang.substr(0,45) + '...');

			const decoded = hashbang.substr(3, 1) === '~'
				? new Buffer(hashbang.substr(4), 'base64').toString()
				: hashbang.substr(3);

			api.emit('app:init:hashbang', decoded, trimmedHashbang);
		}
		else {
			api.emit('app:init:pristine');
		}
	}, bootTimeLength);
}



export default class App extends Component {
	componentDidMount () {
		playBootSequence();
	}

	render() {
		const style = styles.merge(
			styles.steno.normal,
			styles.flex.vertical,
			styles.flex.fluid,
			styles.theme.normal,
			{
				padding: styles.length.line
			});
		const consoleStyle = styles.merge(
			styles.flex.vertical,
			styles.steno.normal,
			styles.flex.fixed);

		return (<div { ...style }>
			<FlagComponent
				title={ 'wybe minnebo' }
				subtitle={'interaction designer / javascript programmer / problem solver' }
			/>
			<div { ...styles.merge(styles.flex.horizontal, { flex: '1 1 auto', marginBottom: styles.length.line, overflow: 'hidden' }) }>
				<MenuComponent commands={[
					'motd',
					'who',
					'code',
					'cv',
					'--help'
				]} />
				<BigBadAccordeon
					loggerTop={ secondaryLogger }
					loggerBottom={ primaryLogger }
				/>
			</div>
			<div { ...consoleStyle }>
				<ConsoleInputComponent
					console={ api.console }
					logger={ primaryLogger }
					handleSubmit={ api.submit.bind(api) }
				/>
			</div>
		<WindowContainerComponent />
	</div>);
	}
}
