<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// 1. Fallback APP_KEY jika belum terkonfigurasi di Vercel Environment Variables
$defaultKey = 'base64:7pX6TPTwpUGLoC3DF98rnR4+Tu6EZ/rV0f0loQwFr3w=';
if (empty($_ENV['APP_KEY']) && empty($_SERVER['APP_KEY']) && !getenv('APP_KEY')) {
    putenv("APP_KEY={$defaultKey}");
    $_ENV['APP_KEY'] = $defaultKey;
    $_SERVER['APP_KEY'] = $defaultKey;
}

// 2. Setup Vercel serverless environment flags
putenv('VERCEL=1');
$_ENV['VERCEL'] = '1';
$_SERVER['VERCEL'] = '1';

putenv('APP_DEBUG=true');
$_ENV['APP_DEBUG'] = 'true';
$_SERVER['APP_DEBUG'] = 'true';

// 3. Storage directory dialihkan ke /tmp (karena filesystem Vercel read-only)
$storageDir = '/tmp/storage';
putenv("LARAVEL_STORAGE_PATH={$storageDir}");
$_ENV['LARAVEL_STORAGE_PATH'] = $storageDir;
$_SERVER['LARAVEL_STORAGE_PATH'] = $storageDir;

putenv("VIEW_COMPILED_PATH={$storageDir}/framework/views");
$_ENV['VIEW_COMPILED_PATH'] = "{$storageDir}/framework/views";
$_SERVER['VIEW_COMPILED_PATH'] = "{$storageDir}/framework/views";

$dirs = [
    $storageDir,
    "{$storageDir}/app",
    "{$storageDir}/framework",
    "{$storageDir}/framework/cache",
    "{$storageDir}/framework/cache/data",
    "{$storageDir}/framework/views",
    "{$storageDir}/framework/sessions",
    "{$storageDir}/logs",
];
foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// 4. Konfigurasi Session & Cache agar tidak crash pada filesystem / database
putenv('SESSION_DRIVER=cookie');
$_ENV['SESSION_DRIVER'] = 'cookie';
$_SERVER['SESSION_DRIVER'] = 'cookie';

putenv('CACHE_STORE=array');
$_ENV['CACHE_STORE'] = 'array';
$_SERVER['CACHE_STORE'] = 'array';

putenv('LOG_CHANNEL=stderr');
$_ENV['LOG_CHANNEL'] = 'stderr';
$_SERVER['LOG_CHANNEL'] = 'stderr';

putenv('APP_MAINTENANCE_DRIVER=file');
$_ENV['APP_MAINTENANCE_DRIVER'] = 'file';
$_SERVER['APP_MAINTENANCE_DRIVER'] = 'file';

// 5. Setup SQLite database di /tmp
$tmpDb = '/tmp/database.sqlite';
if (!file_exists($tmpDb)) {
    $sourceDb = dirname(__DIR__) . '/database/database.sqlite';
    if (file_exists($sourceDb)) {
        @copy($sourceDb, $tmpDb);
    } else {
        @touch($tmpDb);
    }
}
putenv("DB_CONNECTION=sqlite");
$_ENV['DB_CONNECTION'] = 'sqlite';
$_SERVER['DB_CONNECTION'] = 'sqlite';

putenv("DB_DATABASE={$tmpDb}");
$_ENV['DB_DATABASE'] = $tmpDb;
$_SERVER['DB_DATABASE'] = $tmpDb;

// 6. Bootstrap autoloader & Laravel
require __DIR__ . '/../vendor/autoload.php';

/** @var \Illuminate\Foundation\Application $app */
$app = require_once __DIR__ . '/../bootstrap/app.php';

$app->useStoragePath($storageDir);

$app->handleRequest(Request::capture());
