<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
if(strstr($_SERVER['SERVER_NAME'], 'localhost')){
	define( 'DB_NAME', 'local' );
	define( 'DB_USER', 'root' );
	define( 'DB_PASSWORD', 'root' );
	define( 'DB_HOST', 'localhost' );
}else{
	define( 'DB_NAME', 'epiz_31442408_Main' );
	define( 'DB_USER', 'epiz_31442408' );
	define( 'DB_PASSWORD', 'tk7N7E9T7ila' );
	define( 'DB_HOST', 'sql204.epizy.com' );
}

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'QC95DEXhmgwLouBTWH/OPZNRWEAw2AGOTNCi6fp5rcm5MEQVMp/RO7ygwyptd5GPFg68oFzVQfK9/lgwbBSoTQ==');
define('SECURE_AUTH_KEY',  'Lrs/CS7yYvPnffC7eDYStL62EdmFoGdcc14B9nWl4sGAbPIyWMeSoYKqHr2AZFbSTP4+0ERjVWBECVWDQczavw==');
define('LOGGED_IN_KEY',    'OL7K5MvopiKUpuWEdTlNzxr1htl8Ohd0YYiggw/nUlEipWRYVBDwCDgpPAFLherIko1HXD1ZZ34WrcpfpAxyeQ==');
define('NONCE_KEY',        'TXW2mbiv1xEZoXmUHwJT30j7mt2Q0ZNwRiQQMeIi9WSUgnaotqd8Io7E6TB6pLPCigm8Kl9fY+uBSk/w8NeDlQ==');
define('AUTH_SALT',        'TfekepVLWuyqg/nHv371UUG5fSoXA055e8qig8eF2RR/sWuEbU42aPCxpwR6NW69wqc6YroikqbYIGPuvkzXKA==');
define('SECURE_AUTH_SALT', 'HUptXP+0uo/2eXSfX+zUszlb/NZrhXf05FqVos2b6xOFYK060tFEPzQgrakATc1ZPoBIkZkt8OCk1zIrF9fZxA==');
define('LOGGED_IN_SALT',   'cxIv0p064/rDgx1TriZsZ8uAkZagIyn6FBcx9dtoYlgmy0QFbjU9iQMtNtJsrWQYJC0e+qfW1V1mC5L1jfZeGA==');
define('NONCE_SALT',       '6x/r6zG42Fs0Tyu9WXyo6AsvYR55e9Zva4LCyibU2qzSWJA5VyQWe2q6XOYkTMlAzW30WqPgUVyuiFdhW+dp+g==');

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';




/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
