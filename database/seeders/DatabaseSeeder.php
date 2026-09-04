<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Game;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed only master/reference data.
     * No demo users, no demo products, no balances.
     */
    public function run(): void
    {
        // ── 1. Categories (Jenis Produk) ─────────────────────────────────────
        $categoryData = [
            ['name' => 'Item In-Game',   'slug' => 'items',    'icon' => 'inventory_2',  'description' => 'Skin, senjata, kostum, item dekorasi, dan segala item virtual dalam game.'],
            ['name' => 'Akun Game',      'slug' => 'accounts', 'icon' => 'manage_accounts','description' => 'Jual beli akun game yang sudah leveling, skins, dan rank tinggi.'],
            ['name' => 'Top Up',         'slug' => 'topup',    'icon' => 'payments',     'description' => 'Top up diamond, VP, UC, koin, dan mata uang virtual game lainnya.'],
            ['name' => 'Jasa Gaming',    'slug' => 'jasa',     'icon' => 'sports_esports','description' => 'Jasa boost rank, carry, coaching, dan layanan gaming profesional.'],
        ];

        foreach ($categoryData as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // ── 2. Games (Supported Games) ──────────────────────────────────────
        $gameData = [
            [
                'name'         => 'Mobile Legends: Bang Bang',
                'slug'         => 'mobile-legends',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mobile_Legends_Bang_Bang.png/240px-Mobile_Legends_Bang_Bang.png',
                'banner'       => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'Moonton',
                'category_tag' => 'MOBA',
                'is_popular'   => true,
            ],
            [
                'name'         => 'PUBG Mobile',
                'slug'         => 'pubg-mobile',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/en/3/3e/PUBG_Mobile_logo.png',
                'banner'       => 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'Krafton',
                'category_tag' => 'Battle Royale',
                'is_popular'   => true,
            ],
            [
                'name'         => 'Genshin Impact',
                'slug'         => 'genshin-impact',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Genshin_Impact.png',
                'banner'       => 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'HoYoverse',
                'category_tag' => 'Action RPG',
                'is_popular'   => true,
            ],
            [
                'name'         => 'Free Fire',
                'slug'         => 'free-fire',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Free_Fire_logo.png/240px-Free_Fire_logo.png',
                'banner'       => 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'Garena',
                'category_tag' => 'Battle Royale',
                'is_popular'   => true,
            ],
            [
                'name'         => 'Valorant',
                'slug'         => 'valorant',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Valorant_logo_-_pink_color_version.png/320px-Valorant_logo_-_pink_color_version.png',
                'banner'       => 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'Riot Games',
                'category_tag' => 'Tactical FPS',
                'is_popular'   => true,
            ],
            [
                'name'         => 'League of Legends',
                'slug'         => 'league-of-legends',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/League_of_Legends_2019_vector.svg/320px-League_of_Legends_2019_vector.svg.png',
                'banner'       => 'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'Riot Games',
                'category_tag' => 'MOBA',
                'is_popular'   => true,
            ],
            [
                'name'         => 'Honkai: Star Rail',
                'slug'         => 'honkai-star-rail',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/en/b/b5/Honkai_Star_Rail_game_logo.png',
                'banner'       => 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'HoYoverse',
                'category_tag' => 'Turn-Based RPG',
                'is_popular'   => true,
            ],
            [
                'name'         => 'Call of Duty Mobile',
                'slug'         => 'codm',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/en/6/67/Call_of_Duty_Mobile_logo.png',
                'banner'       => 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'Activision / TiMi',
                'category_tag' => 'FPS',
                'is_popular'   => false,
            ],
            [
                'name'         => 'Steam',
                'slug'         => 'steam',
                'icon'         => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/240px-Steam_icon_logo.svg.png',
                'banner'       => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
                'publisher'    => 'Valve',
                'category_tag' => 'Platform',
                'is_popular'   => false,
            ],
        ];

        foreach ($gameData as $game) {
            Game::firstOrCreate(['slug' => $game['slug']], $game);
        }
    }
}
