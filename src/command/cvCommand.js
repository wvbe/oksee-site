import React from 'react';

const cv2017Content = <iframe style={{display:'flex', flex: '1 1 auto', width: '100%' }} src={ '/resume-of-wybe-minnebo--wyb.be--2017.pdf' } />;
const cv2018Content = <iframe style={{display:'flex', flex: '1 1 auto', width: '100%' }} src={ '/resume-of-wybe-minnebo--wyb.be--2018.pdf' } />;

export default function (app) {
	app.console
		.addOption('2017', null, 'Download an older version of the PDF')
		.addCommand('cv')
		.addAlias('resume')
		.setDescription('my online curriculum vitae, resume, work experience et. al.')
		.setController((req, res) => {
			res.log('Opening curriculum vitae window');
			res.log('-------------------------------');
			res.log('A PDF copy of my resume is opening in a window. Use your browser\'s native PDF viewer to zoom');
			res.log(<p>or save. If your browser does not have this capability, <a href="https://www.google.com/chrome" target="_blank">download a decent browser</a></p>);

			if(req.options['2017']) {
				res.log();
				res.log(<p>You've chosen to see the 2017 version of my CV.</p>);
				res.log();
			}
			app.emit('window:new', 'curriculum vitae', req.options['2017'] ? cv2017Content : cv2018Content, {
				size: 0.6,
				ratio: 16/9
			});
		});
}
