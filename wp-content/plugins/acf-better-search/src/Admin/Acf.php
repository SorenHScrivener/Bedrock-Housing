<?php

namespace AcfBetterSearch\Admin;

use AcfBetterSearch\Helper\ViewLoader;
use AcfBetterSearch\HookableInterface;
use AcfBetterSearch\PluginInfo;

/**
 * .
 */
class Acf implements HookableInterface {

	const NOTICE_VIEW_PATH = 'components/notices/acf.php';

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
		add_action( 'admin_notices', [ $this, 'show_admin_error' ] );
	}

	/**
	 * @return void
	 */
	public function show_admin_error() {
		if ( function_exists( 'acf_get_setting' ) ) {
			return;
		}

		( new ViewLoader( $this->plugin_info ) )->load_view(
			self::NOTICE_VIEW_PATH,
			[]
		);
	}
}
