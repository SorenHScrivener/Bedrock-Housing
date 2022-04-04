<?php

namespace AcfBetterSearch\Admin;

use AcfBetterSearch\HookableInterface;
use AcfBetterSearch\PluginInfo;

/**
 * .
 */
class Install implements HookableInterface {

	/**
	 * @var PluginInfo
	 */
	private $plugin_info;

	public function __construct( PluginInfo $plugin_info ) {
		$this->plugin_info = $plugin_info;
	}

	/**
	 * {@inheritdoc}
	 */
	public function init_hooks() {
		register_activation_hook( $this->plugin_info->get_plugin_file(), [ $this, 'add_default_options' ] );
	}

	/**
	 * @return void
	 */
	public function add_default_options() {
		if ( get_option( 'acfbs_notice_hidden', false ) === false ) {
			add_option( 'acfbs_notice_hidden', strtotime( '+ 1 week' ) );
		}
	}
}
