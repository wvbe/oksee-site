export default (app) => {
	app.console
		.addCommand('colophon')
		.setController((req, res) => {
			res.log(`This site is built on the following technologies:`);
			res.log(`- webpack`);
			res.log(`- react`);
		});
}
