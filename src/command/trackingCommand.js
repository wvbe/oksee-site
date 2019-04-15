import * as AskNicely from 'ask-nicely';

export default function (app) {
	let trackingCommand = app.console
		.addCommand('tracking')
		.setDescription('the usage information that is logged for your client');

	trackingCommand
		.addCommand('clear', (req, res) => {
			res.log('Wiping command history...');
			app.store.remove('history');
			app.store.remove('last-submit');

			return new Promise(resolve => setTimeout(resolve, 500))
				.then(x => res.log('All done.'));
		});

	trackingCommand
		.addCommand('history', (req, res) => {
			res.log('Dump command history...');
			res.log('-----------------------');

			let history = app.store.get('history');
			const offset = req.options.limit === '*' ? 0 : history.length - parseInt(req.options.limit, 10);
			history
				.slice(offset)
				.forEach((item, i) => {
					res.log(item, (offset + i + 1) + '/' + history.length);
				});
		})
		.addOption(new AskNicely.Option('limit')
			.setShort('l')
			.setDefault(10, true)
			.setDescription('Limit the amount of commands displayed, defaults to 10. Set to "*" to show all.')
		);

	trackingCommand
		.addCommand('policy', (req, res) => {
			res.log('# tracking policy');

			res.log();

			res.log('- You have no privacy, we have no policy.');

			res.log('- Any traffic to and from this site is subject to scary internet wiretapping laws of at least a');
			res.log('  dozen country/states.');

			res.log();
			res.log('BY VISITING OR THINKING ABOUT THIS SITE YOU HAVE ACCEPTED OUR TERMS AND CONDITIONS FOREVER.');
		});

}
