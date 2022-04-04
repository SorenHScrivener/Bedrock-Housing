<?php

namespace AcfBetterSearch\Search;

use AcfBetterSearch\HookableInterface;

/**
 * .
 */
class Request implements HookableInterface {

	/**
	 * {@inheritdoc}
	 */
	public function init_hooks() {
		add_filter( 'posts_request', [ $this, 'sql_distinct' ], 10, 2 );
	}

	public function sql_distinct( string $sql, \WP_Query $query ): string {
		if ( ! isset( $query->query_vars['s'] ) || empty( $query->query_vars['s'] )
			|| ! apply_filters( 'acfbs_search_is_available', true, $query ) ) {
			return $sql;
		}

		return (string) preg_replace( '/SELECT/', 'SELECT DISTINCT', $sql, 1 );
	}
}
