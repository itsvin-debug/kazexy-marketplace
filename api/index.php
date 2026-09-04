<?php

// Pastikan direktori sementara /tmp tersedia untuk Vercel Serverless (karena storage bersifat read-only)
$directories = [
    '/tmp/storage/app',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Teruskan request ke entry point standar Laravel
require __DIR__ . '/../public/index.php';
