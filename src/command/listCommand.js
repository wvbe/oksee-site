import React from 'react';

export default (app) => {

	(function registerCommand (ask, config, ancestry = [config.id]) {
		const command = ask.addCommand(config.id);
		command.setDescription(config.description);
		command.setController((req, res) => {
			res.log('# ' + (config.label || config.id));

			(config.items || []).forEach((item, i, all) => {
				res.log(<p>{'- '}{ item }</p>, (i + 1) + '/' + all.length);
			});

			(config.children || []).forEach(child => {
				res.log(<p>{'> '}<a data-command={ ancestry.concat(child.id).join(' ') }>{ child.id }</a></p>);
			});
		});

		(config.children || []).forEach(child => {
			registerCommand(command, child, ancestry.concat(child.id));
		});
	})(app.console, {
		id: 'list',
		label: 'list',
		description: 'lists of stuff and other lists',
		children: [
			{
				id: 'things-i-like',
				description: 'things I like to varying degrees of unicorn',
				items: [
					'my cat',
					'old fashioned English',
					'clever code'
				]
			},
			{
				id: 'smart-things-i-say',
				description: 'smart things i say, whether they are true or not',
				items: [
					'programmeren is een emotionele aangelegenheid / programming is an emotional occasion',
					'een mooie vriendin is een vloek en een zegen / a beautiful girlfriend is a blessing and a curse',
					'ontspanning is onderdeel van inspanning / to relax is part of an effort'
				]
			},
			{
				id: 'bucketlist',
				description: 'things to do before I die',
				items: [
					'go to Mars',
					'see the northpole',
					'see auralia borealis',
					'see auralia borealis on Mars after terraforming',
					'make a million bucks',
					'jump from a perfectly good airplane',
					'climb a mountain alone'
				]
			}
		]
	});
}
