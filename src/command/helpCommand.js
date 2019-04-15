import * as AskNicely from 'ask-nicely';
import React from 'react';
import * as styles from '../styles';

// Simple table
const rowStyle = styles.merge(styles.flex.horizontal);
const largeColStyle = styles.merge(styles.flex.fluid);
const smallColStyle = styles.merge(styles.flex.fixed, {
	width: '15%'
});
function HelpRow ({ small, description, short }) {
	return (
		<div { ...rowStyle }>
			{ small.map((c, i) => <div key={ i } { ...smallColStyle }>{ c }</div>) }
			<div { ...largeColStyle }>{ description }</div>
		</div>
	)
}

// Empty descriptions are dimmed
const noDescriptionMessage = 'No description';
const noDescriptionStyle = styles.merge(styles.theme.dim);
function DescriptionData ({ description, label, forceDim }) {
	return <span>
		{
			forceDim || !description ?
				<span { ...noDescriptionStyle }>{ noDescriptionMessage }</span> :
				description
		}
		{
			label ?
				' ' + label :
				null
		}
	</span>
}

function sortByName(a, b) {
	return a.name < b.name ? -1 : 1;
}

function getCommandHierarchy (command) {
	let chain = [command],
		nextCommand = command;
	while(nextCommand.parent) {
		chain.push(nextCommand.parent);
		nextCommand = nextCommand.parent;
	}
	return chain;
}

function getAllOptions (command) {
	return getCommandHierarchy(command).reduce((options, command) => options.concat(command.options), []);
}

function getAllParameters (command) {
	return getCommandHierarchy(command).reduce((options, command) => options.concat(command.parameters), []);
}

function getExecutableCommand (command) {
	return getCommandHierarchy(command)
		.reverse()
		.slice(1)
		.reduce((pieces, command) => pieces.concat([command.name]), [])
		.join(' ');
}

export default (app) => {
	app.console
		.addOption(new AskNicely.IsolatedOption('help')
			.setShort('h')
			.setDescription('Show usage information for this command')
		)
		.addPreController((req, res) => {
			// If the help flag is not set, the precontroller is exited early
			if(!req.options.help)
				return;

			let command = req.command,
				isRoot = !command.parent;

			res.log(`# ${getExecutableCommand(command)} --help`);

			if(isRoot) {
				res.log('');
				res.log(`This site is controlled through the terminal you see here. Use the listed commands and options to your advantage. For any command you can find more instructions by using the "--help" flag.`);
				res.log('');
				res.log(<div>You can always contact me if you have other questions: type "<a data-command="who --email">who --email</a>"</div>)
			} else if (command.description) {
				res.log('');
				res.log(command.description);
			}


			if(command.children.length) {
				res.log(``);
				res.log('## Child commands');
				command.children.sort(sortByName).forEach(child => {
					const cmd = getExecutableCommand(child);
					res.log(<HelpRow
						small={[
							<a data-command={ cmd }>{ child.name }</a>
						]}
						description={ <span>
							<a data-command={ cmd + ' --help' }>-h</a>
							{' '}
							<DescriptionData
								description={ child.description }
								forceDim={ !child.description }
							/>
						</span> }
					/>);
				});
			}

			var parameters = getAllParameters(command);
			if(parameters.length) {
				res.log('');
				res.log('## Parameters');
				parameters.forEach(param => {
					res.log(<HelpRow
						small={[
							param.name
						]}
						description={ <DescriptionData
							description={ param.description }
							label={ param.required ? '[required]' : null }
						/> }
					/>);
				});
			}

			var options = getAllOptions(command);
			if(options.length) {
				res.log('');
				res.log('## Options');
				options.sort(sortByName).forEach(option => {
					res.log(<HelpRow
						small={[
							option.short ? `-${option.short}` : '--',
							'--' + option.name
						]}
						description={ <DescriptionData
							description={ option.description }
							label={ option.required ? '[required]' : null }
						/> }
					/>);
				});
			}

			return false;
		});
}
