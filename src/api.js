import Api from './api/Api';

import colophonCommand from './command/colophonCommand';
import cvCommand from './command/cvCommand';
import echoCommand from './command/echoCommand';
import helpCommand from './command/helpCommand';
import listCommand from './command/listCommand';
import motdCommand from './command/motdCommand';
import profileCommand from './command/trackingCommand';
import redirCommand from './command/redirCommand';
import rootCommand from './command/rootCommand';
import testCommand from './command/testCommand';
import viewCommand from './command/viewCommand';
import whoCommand from './command/whoCommand';

const api = new Api({
	isSkewed: false,
	bootTimeLength: 2000
});

[
	colophonCommand,
	cvCommand,
	echoCommand,
	helpCommand,
	listCommand,
	motdCommand,
	profileCommand,
	redirCommand,
	rootCommand,
	testCommand,
	viewCommand,
	whoCommand
].forEach(mod => mod(api));


export default api;
