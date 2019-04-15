export default function (app) {
	app.console
		.addCommand('echo')
		.setDescription('write arguments to the standard output')
		.addParameter('text')
		.setController((req, res) => {
			res.log(req.parameters.text || '');
		});
}
