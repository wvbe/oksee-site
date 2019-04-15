import React, {Component} from 'react';
import * as styles from '../styles';

const style = styles.merge(
	styles.display.block,
	styles.position.absolute,
	{
		left: '50%',
	top: '50%',
	transform: 'translate(-50%, -50%)'
	});

export default class ToastComponent extends Component {
	constructor (props) {
		super();

		this.messages = [...props.messages];
		this.iterateOverTasks();
	}

	iterateOverTasks () {
		if (!this.messages.length) {
			return;
		}


		setTimeout(() => {
			this.messages.shift();

			this.forceUpdate();
			this.iterateOverTasks();
		}, 300 * Math.random() + 10);
	}

	componentWillReceiveProps (props) {
	}


	shouldComponentUpdate () {
		return false;
	}

	render() {
		const { onFinish } = this.props;

		if (this.messages && !this.messages.length) {
			return onFinish();
		}

		return (<oksee-toast { ...style }>
			{ this.messages && this.messages[0] }
		</oksee-toast>);
	}
}
