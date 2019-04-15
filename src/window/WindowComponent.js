import React, {Component} from 'react';
import api from '../api';
import MenuItemComponent from '../menu/MenuItemComponent';
import ToastComponent from '../toast/ToastComponent';

import * as styles from '../styles';

const windowStyle = styles.merge(
	styles.flex.fluid,
	styles.flex.vertical,
	styles.border.subtle,
	styles.border.strong,
	styles.theme.normal,
	{
		padding: 1
	});
const rowStyle = styles.merge(
	styles.flex.horizontal);

const contentStyle = styles.merge(
	styles.flex.vertical,
	styles.flex.fluid,
	styles.overflow.auto);

const headerStyles = styles.merge(
	styles.flex.fixed,
	styles.flex.horizontal,
	styles.flex.spaceBetween,
	styles.flex.gutter,
	styles.steno.normal);

const headerNameStyles = styles.merge(
	styles.flex.fluid,
	styles.theme.inverse,
	styles.padding.field,
	styles.padding.button);

export default class WindowComponent extends Component {
	render () {
		return (
			<oksee-window { ...windowStyle }>
				<oksee-window-header { ...headerStyles } { ...rowStyle }>
					<div { ...headerNameStyles }>{this.props.name}</div>
					<div { ...styles.merge(styles.flex.fixed) } { ...rowStyle }>
						<MenuItemComponent onClick={ () => {
							api.emit('window:destroy', this.props.name);
						} }>&times;</MenuItemComponent>
					</div>
				</oksee-window-header>
				<oksee-window-content { ...contentStyle } class="fuck-you-scroll">
					<ToastComponent
						messages={[
							'Reserving space in viewport…',
							'Pushing some pixels…',
							'Loading window contents…',
							'Exchanging security codes…',
							'Wishing Trump was not POTUS…',
							'Rendering…'
						]}
						onFinish={ () => this.props.children }
					/>
				</oksee-window-content>
			</oksee-window>
		);
	}

}
