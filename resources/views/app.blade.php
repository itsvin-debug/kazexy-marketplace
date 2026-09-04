<!DOCTYPE html>
<html lang="id" class="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Nexus Gaming - The Ultimate Pro Marketplace</title>
    <meta name="description" content="Platform marketplace jual beli akun game, item, skin, top up diamond, dan voucher game resmi terpercaya dengan garansi 100% dan pengiriman instan.">
    
    <!-- Google Fonts: Inter & Material Symbols Outlined -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
    
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="bg-[#f7f9fb] text-[#191c1e] font-sans antialiased min-h-screen">
    <div id="app"></div>
</body>
</html>
