export default (app) => {
	app.console
		.addCommand('motd')
		.setDescription('the message of the day, although it doesn\'t actually change every day')
		.setController((req, res) => {
			res.log('Retrieving message of today');
			return new Promise(resolve => {
				setTimeout(() => {
					res.log('Message of the day: ' + (new Date().toString()));
					res.log();
					(`                               _|            _|                  
 _|      _|      _|  _|    _|  _|_|_|        _|_|_|      _|_|    
 _|      _|      _|  _|    _|  _|    _|      _|    _|  _|_|_|_|  
   _|  _|  _|  _|    _|    _|  _|    _|      _|    _|  _|        
     _|      _|        _|_|_|  _|_|_|    _|  _|_|_|      _|_|_|  
                           _|                                    
                       _|_|`)
						.split('\n').forEach(line => res.log(line, 'ascii'));

					res.log('');
					res.log('-----------------------------------------------------------------------------');
					res.log(`           YOU HAVE REACHED THE PORTFOLIO SITE OF WYBE MINNEBO`);
					res.log(`       interaction designer, javascript developer and what have you`);
					res.log('-----------------------------------------------------------------------------');
					resolve();
				}, 500)
			})
		});
}
