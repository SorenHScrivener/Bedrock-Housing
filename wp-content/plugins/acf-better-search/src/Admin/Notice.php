<?php

namespace AcfBetterSearch\Admin;

use AcfBetterSearch\Helper\ViewLoader;
use AcfBetterSearch\HookableInterface;
use AcfBetterSearch\PluginInfo;

/**
 * .
 */
class Notice implements HookableInterface {

	const NOTICE_VIEW_PATH = 'components/notices/thanks.php';
	const OPTION_NOTICE    = 'acfbs_notice_hidden';

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
		add_filter( 'acfbs_notice_url', [ $this, 'show_notice_url' ] );
		add_action( 'admin_notices', [ $this, 'show_admin_notice' ] );
		add_action( 'wp_ajax_acfbs_notice', [ $this, 'hide_admin_notice' ] );
	}

	public function show_notice_url(): string {
		return admin_url( 'admin-ajax.php?action=acfbs_notice' );
	}

	/**
	 * @return void
	 */
	public function show_admin_notice() {
		if ( ( $_SERVER['PHP_SELF'] !== '/wp-admin/index.php' ) || // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			( get_option( self::OPTION_NOTICE, 0 ) >= time() ) ) {
			return;
		}

		( new ViewLoader( $this->plugin_info ) )->load_view(
			self::NOTICE_VIEW_PATH,
			[]
		);
	}

	/**
	 * @return void
	 */
	public function hide_admin_notice() {
		$is_permanent = isset( $_POST['is_permanently'] ) && $_POST['is_permanently']; // phpcs:ignore WordPress.Security
		$expires      = strtotime( ( $is_permanent ) ? '+10 years' : '+ 1 month' );

		$this->save_option( (string) $expires );
	}

	/**
	 * @param string $value .
	 *
	 * @return void
	 */
	public function save_option( string $value ) {
		if ( get_option( self::OPTION_NOTICE, false ) !== false ) {
			update_option( self::OPTION_NOTICE, $value );
		} else {
			add_option( self::OPTION_NOTICE, $value );
		}
	}
}
